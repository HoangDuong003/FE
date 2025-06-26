import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, MenuItem, FormControl, IconButton, Menu as MuiMenu, TextField, Button, Box, Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import AlertPopup from '../../components/common/AlertPopup';
import { fetchSchedulesByEmail, createEvent, updateEvent, deleteEvent } from './scheduleSlice';
import { fetchAllWorkTypes } from '../worktype/workTypeSlice';
import { fetchAllCompanies } from '../company/companySlice';

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);

// Hardcoded colors to match the design
const jobTypeColors = {
  '出張': '#212a63',
  '顧客訪問': '#3a7d82',
  '在宅勤務／リモートワーク': '#823f3a',
  '有給休暇': '#525252',
};

const getLocalDateString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function getCalendarMatrix(month, year) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  let matrix = [[]];
  let week = matrix[0];
  let dayOfWeek = firstDay.getDay();

  for (let i = dayOfWeek - 1; i >= 0; i--) {
    week.unshift({ day: prevLastDay.getDate() - i, current: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    if (week.length === 7) {
      week = [];
      matrix.push(week);
    }
    week.push({ day: d, current: true, date: new Date(year, month, d) });
  }

  let nextDay = 1;
  while (week.length < 7) {
    week.push({ day: nextDay++, current: false });
  }

  return matrix;
}

const isToday = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
};

const companies = [
  { id: 6, name: '横浜オフィス', address: '横浜市', description: '横浜市の本社' },
  { id: 7, name: '宮城行政センター', address: '宮城県', description: '宮城城行政センター' },
  { id: 8, name: '札幌オフィス', address: '札幌市', description: '札幌オフィス' },
  { id: 9, name: '東京オフィス', address: '東京都', description: '東京オフィス' }
];

const jobTypes = [
  { id: 5, name: '出張' },
  { id: 6, name: '顧客訪問' },
  { id: 7, name: '在宅勤務／リモートワーク' },
  { id: 8, name: '有給休暇' }
];

const workplaceJapaneseNames = {
  6: "横浜オフィス",
  7: "宮城行政センター",
  8: "札幌オフィス",
  9: "東京オフィス"
};

export default function Calendar() {
    // STATE MANAGEMENT
    const dispatch = useDispatch();
    const events = useSelector((state) => state.schedule?.schedules || []);
    const reduxState = useSelector((state) => state);
    console.log('events:', events);
    console.log('Redux state:', reduxState);
    const { workTypes = [] } = useSelector((state) => state.workTypes || {});
    console.log('workTypes:', workTypes);
    const { companies: headquarters = [] } = useSelector((state) => state.companies || {});
    console.log('headquarters:', headquarters);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarDate, setCalendarDate] = useState(new Date());

    // State for creating new events
    const [isSelecting, setIsSelecting] = useState(false);
    const [startCell, setStartCell] = useState(null);
    const [selectedCells, setSelectedCells] = useState([]);
    const [provisionalEvent, setProvisionalEvent] = useState(null);

    // State for dragging existing events
    const [isDragging, setIsDragging] = useState(false);
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // State for the form/modal
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    // State for alerts and menus
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuEvent, setMenuEvent] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('error');

    // MEMOIZED VALUES & HELPERS
    const calendarMatrix = useMemo(() => getCalendarMatrix(calendarDate.getMonth(), calendarDate.getFullYear()), [calendarDate]);
    const weekDates = useMemo(() => {
        const startOfWeek = new Date(selectedDate);
        const dayOfWeek = startOfWeek.getDay();
        const sunday = new Date(startOfWeek);
        sunday.setDate(startOfWeek.getDate() - dayOfWeek);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            return d;
        });
    }, [selectedDate]);

    const timeOptions = useMemo(() => Array.from({ length: 25 }, (_, i) => {
        const hour = String(i).padStart(2, '0');
        return `${hour}:00`;
    }), []);

    const getSelectedTimeRange = useCallback(() => {
        if (!selectedCells || selectedCells.length === 0) return null;
        const sortedCells = [...selectedCells].sort((a, b) => a.rowIndex - b.rowIndex);
        const startCellInfo = sortedCells[0];
        const endCellInfo = sortedCells[sortedCells.length - 1];

        const startDate = new Date(weekDates[startCellInfo.dayIndex]);
        startDate.setHours(startCellInfo.rowIndex, 0, 0, 0);

        const endDate = new Date(weekDates[endCellInfo.dayIndex]);
        endDate.setHours(endCellInfo.rowIndex + 1, 0, 0, 0); 
        
        return { startDate, endDate };
    }, [selectedCells, weekDates]);
    
    const formatTimeForSelect = (date) => {
        if (!date) return '';
        let d = new Date(date);
        const hour = String(d.getHours()).padStart(2, '0');
        return `${hour}:00`;
    };

    const formatEndTimeForDisplay = (date) => {
        if (!date) return '';
        let d = new Date(date);
        d.setHours(d.getHours() - 1); // Subtract 1 hour for inclusive display
        const hour = String(d.getHours()).padStart(2, '0');
        return `${hour}:00`;
    }

    // DATA FETCHING
    useEffect(() => {
        if (currentUser?.email) dispatch(fetchSchedulesByEmail(currentUser.email));
        dispatch(fetchAllWorkTypes());
        dispatch(fetchAllCompanies());
    }, [dispatch, currentUser?.email]);

    // MOUSE EVENT HANDLING
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isSelecting && startCell) {
                const target = e.target.closest('td[data-day]');
                if (!target) return;
                const dayIndex = parseInt(target.dataset.day, 10);
                if (dayIndex !== startCell.dayIndex) return; // Restrict to same day
                const idParts = target.id.split('-');
                const rowIndex = parseInt(idParts[idParts.length - 1], 10);
                const minRow = Math.min(startCell.rowIndex, rowIndex);
                const maxRow = Math.max(startCell.rowIndex, rowIndex);
                const newSelectedCells = [];
                for (let i = minRow; i <= maxRow; i++) {
                    newSelectedCells.push({ dayIndex: startCell.dayIndex, rowIndex: i });
                }
                setSelectedCells(newSelectedCells);
            } else if (isDragging && draggedEvent) {
                const dx = e.clientX - draggedEvent.initialMouse.x;
                const dy = e.clientY - draggedEvent.initialMouse.y;
                setDragOffset({ x: dx, y: dy });
            }
        };

        const handleMouseUp = (e) => {
            if (isSelecting) {
                setIsSelecting(false);
                if (selectedCells.length > 0) {
                    const timeRange = getSelectedTimeRange();
                    if (timeRange) {
                        setProvisionalEvent({ start: timeRange.startDate, end: timeRange.endDate });
                        setSelectedEvent(null);
                        setShowForm(true);
                        setEditMode(false);
                    }
                }
            } else if (isDragging) {
                handleDragMouseUp(e);
            }
        };

        if (isSelecting || isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isSelecting, isDragging, startCell, draggedEvent, getSelectedTimeRange]);

    // HANDLERS
    const handlePreviousMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleDayClick = (day) => {
        if (!day.current) return;
        const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day.day);
        setSelectedDate(newDate);
        setCalendarDate(newDate);
    };

    const handleFormClose = () => {
        console.log('handleFormClose called');
        setShowForm(false);
        setSelectedEvent(null);
        setProvisionalEvent(null);
        setEditMode(false);
        setIsSelecting(false);
        setSelectedCells([]);
    };

    const handleMouseDownOnCell = (e, rowIndex, dayIndex) => {
        if (e.target.closest('.event-item') || e.button !== 0) return;
        const cellDate = new Date(weekDates[dayIndex]);
        cellDate.setHours(rowIndex, 0, 0, 0);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (cellDate < today) {
            setAlertMessage('過去の日付には登録できません。');
            setAlertType('error');
            setOpenAlert(true);
            return;
        }
        // Ràng buộc: đã có sự kiện trong ngày thì không cho đăng ký thêm
        const hasEvent = events.some(event => {
            const eventDate = new Date(event.start);
            return eventDate.getFullYear() === cellDate.getFullYear() &&
                   eventDate.getMonth() === cellDate.getMonth() &&
                   eventDate.getDate() === cellDate.getDate();
        });
        if (hasEvent) {
            setAlertMessage('同じ日には1つの仕事しか登録できません。古い予定を削除してから編集してください！');
            setAlertType('error');
            setOpenAlert(true);
            return;
        }
        e.preventDefault();
        setIsSelecting(true);
        const cellData = { dayIndex, rowIndex };
        setStartCell(cellData);
        setSelectedCells([cellData]);
    };

    const handleMouseDownOnEvent = (e, eventToDrag) => {
        if (e.button !== 0) return;
        const eventDate = new Date(eventToDrag.start);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (eventDate < today) {
            setAlertMessage('過去の日付には編集できません。');
            setAlertType('error');
            setOpenAlert(true);
            return;
        }
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({ x: 0, y: 0 });
        setDraggedEvent({
            event: eventToDrag,
            initialMouse: { x: e.clientX, y: e.clientY },
            offsetY: e.clientY - rect.top,
        });
        setIsDragging(true);
    };

    const handleDragMouseUp = async (e) => {
        if (!isDragging || !draggedEvent) return;
        const draggedEl = document.getElementById(`event-${draggedEvent.event.id}`);
        if (draggedEl) draggedEl.style.pointerEvents = 'none';
        const targetCell = document.elementFromPoint(e.clientX, e.clientY);
        if (draggedEl) draggedEl.style.pointerEvents = 'auto';
        setIsDragging(false);
        const calendarGrid = document.getElementById('calendar-grid-body');
        if (!targetCell || !calendarGrid || !calendarGrid.contains(targetCell)) {
            setDraggedEvent(null);
            return;
        }
        const targetTD = targetCell.closest('td[data-day]');
        if (targetTD) {
            const gridRect = calendarGrid.getBoundingClientRect();
            const slotHeight = gridRect.height / 24;
            const dropY = e.clientY - gridRect.top - draggedEvent.offsetY;
            const slotIndex = Math.max(0, Math.floor(dropY / slotHeight)); // Snap to hour
            const newStartDateTime = new Date(weekDates[parseInt(targetTD.dataset.day, 10)]);
            newStartDateTime.setHours(slotIndex, 0, 0, 0);
            const today = new Date();
            today.setHours(0,0,0,0);
            if (newStartDateTime < today) {
                setAlertMessage('過去の日付には移動できません。');
                setAlertType('error');
                setOpenAlert(true);
                setDraggedEvent(null);
                setIsDragging(false);
                return;
            }
            // Ràng buộc: ngày đích đã có event khác thì không cho phép di chuyển
            const dayString = getLocalDateString(newStartDateTime);
            const hasEvent = events.some(event =>
                getLocalDateString(new Date(event.start)) === dayString &&
                event.id !== draggedEvent.event.id
            );
            if (hasEvent) {
                setAlertMessage('この日にはすでに予定があります！');
                setAlertType('error');
                setOpenAlert(true);
                setDraggedEvent(null);
                setIsDragging(false);
                return;
            }
            const eventDurationMs = new Date(draggedEvent.event.end).getTime() - new Date(draggedEvent.event.start).getTime();
            const newEndDateTime = new Date(newStartDateTime.getTime() + eventDurationMs);

            const finalPayload = {
                day: getLocalDateString(newStartDateTime),
                employee_id: draggedEvent.event.employee,
                workplace_id: draggedEvent.event.workplace.id,
                workType_id: draggedEvent.event.workType.id,
                startTime: newStartDateTime.getHours(),
                endTime: newEndDateTime.getHours(),
                taskDescription: draggedEvent.event.description,
                status: draggedEvent.event.status,
            };
            try {
                await dispatch(updateEvent({ eventId: draggedEvent.event.id, eventData: finalPayload })).unwrap();
            } catch (error) {
                setAlertMessage(error.message || '予定の更新中にエラーが発生しました。');
                setAlertType('error');
                setOpenAlert(true);
            }
        }
        setDraggedEvent(null);
    };
    
    const handleMenuOpen = (event, e) => {
        e.stopPropagation();
        setMenuEvent(event);
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuEvent(null);
    };

    const handleEdit = () => {
        setEditMode(true);
        setShowForm(true);
        setAnchorEl(null);
    };

    const handleDelete = async () => {
        if (menuEvent) {
            const eventDate = new Date(menuEvent.start);
            const today = new Date();
            today.setHours(0,0,0,0);
            if (eventDate < today) {
                setAlertMessage('過去の予定は削除できません。');
                setAlertType('error');
                setOpenAlert(true);
                handleMenuClose();
                return;
            }
            await dispatch(deleteEvent(menuEvent.id));
        }
        handleMenuClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const timeSource = editMode ? selectedEvent : provisionalEvent;
        if (!timeSource) {
            setAlertMessage('時間を特定できません。');
            setAlertType('error');
            setOpenAlert(true);
            return;
        }
        const startDateTime = new Date(timeSource.start);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (startDateTime < today) {
            setAlertMessage('過去の日付には登録できません。');
            setAlertType('error');
            setOpenAlert(true);
            return;
        }
        const dayString = getLocalDateString(startDateTime);
        const eventExistsOnDay = events.some(event => getLocalDateString(new Date(event.start)) === dayString && event.id !== selectedEvent?.id);
        if (eventExistsOnDay && !editMode) {
            setAlertMessage('同じ日には1つの予定しか登録できません。');
            setAlertType('error');
            setOpenAlert(true);
            handleFormClose();
            return;
        }
        const [startHour] = formData.get('start').split(':').map(Number);
        const [endHour] = formData.get('end').split(':').map(Number);
        
        const selectedJobType = jobTypes.find(jt => jt.name === formData.get('jobType'));
        const workType_id = selectedJobType ? selectedJobType.id : null;
        
        const payload = {
            day: dayString,
            employee_id: currentUser.id,
            workplace_id: Number(formData.get('headquarterId')),
            workType_id,
            startTime: startHour,
            endTime: endHour + 1,
            taskDescription: formData.get('description'),
            status: "SCHEDULED"
        };
        const action = editMode
            ? updateEvent({ eventId: selectedEvent.id, eventData: payload })
            : createEvent(payload);
        try {
            await dispatch(action).unwrap();
            setAlertMessage(editMode ? '更新完了' : '登録完了');
            setAlertType('success');
            setOpenAlert(true);
            handleFormClose();
        } catch (err) {
            setAlertMessage(err.message || `Lỗi khi ${editMode ? 'cập nhật' : 'tạo'}.`);
            setAlertType('error');
            setOpenAlert(true);
        }
    };
    
    // RENDER
    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
            <Box sx={{ width: '300px', borderRight: '1px solid #ddd', p: 2, overflowY: 'auto', flexShrink: 0 }}>
                <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                    {`${calendarDate.getFullYear()} 年 ${calendarDate.getMonth() + 1} 月 `}
                </Typography>
                <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                        <TableRow>
                            {weekdays.map((day, i) => (
                                <TableCell key={day} sx={{ textAlign: 'center', p: '4px', color: i === 0 ? 'red' : 'inherit', fontWeight: 'bold', border: 'none' }}>
                                    {day}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {calendarMatrix.map((week, i) => (
                            <TableRow key={i}>
                                {week.map((day, j) => {
                                    const isSelected = selectedDate.getDate() === day.day && selectedDate.getMonth() === calendarDate.getMonth() && day.current;
                                    const dateObj = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day.day);
                                    const isCurrentToday = isToday(dateObj) && day.current;
                                    const isSunday = j === 0;

                                    const getBackgroundColor = () => {
                                        if (isCurrentToday) return '#ffd600'; // Yellow for today
                                        if (isSelected) return '#bbdefb'; // Blue for selected day
                                        return 'transparent';
                                    };

                                    return (
                                        <TableCell
                                            key={`${i}-${j}`}
                                            onClick={() => handleDayClick(day)}
                                        sx={{
                                                textAlign: 'center',
                                                p: 1,
                                            cursor: day.current ? 'pointer' : 'default',
                                                color: !day.current ? '#ccc' : isSunday ? 'red' : 'inherit',
                                                backgroundColor: getBackgroundColor(),
                                                border: '1px solid #ddd',
                                                fontWeight: isSelected || isCurrentToday ? 'bold' : 'normal',
                                            '&:hover': {
                                                    backgroundColor: day.current ? '#f5f5f5' : 'transparent',
                                                },
                                        }}
                                    >
                                        {day.day}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            ))}
                    </TableBody>
                </Table>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="outlined" size="small" sx={{ color: 'black', borderColor: '#ccc', fontWeight: 'bold', '&:hover': { borderColor: 'black', backgroundColor: 'rgba(0, 0, 0, 0.04)' } }} onClick={handlePreviousMonth}>先月</Button>
                    <Button variant="outlined" size="small" sx={{ color: 'black', borderColor: '#ccc', fontWeight: 'bold', '&:hover': { borderColor: 'black', backgroundColor: 'rgba(0, 0, 0, 0.04)' } }} onClick={handleNextMonth}>来月</Button>
                </Box>
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#fafafa', borderRadius: '8px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>勤務形態</Typography>
                    {Object.entries(jobTypeColors).map(([jobType, color]) => (
                        <Box key={jobType} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ width: 16, height: 16, backgroundColor: color, mr: 1.5, borderRadius: '4px', border: '1px solid #eee' }} />
                            <Typography variant="body2">{jobType}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                    <Box>
                        <Button variant="outlined" sx={{ mr: 1, color: 'black', borderColor: '#ccc', fontWeight: 'bold', '&:hover': { borderColor: 'black', backgroundColor: 'rgba(0, 0, 0, 0.04)' } }} onClick={() => setSelectedDate(d => new Date(d.setDate(d.getDate() - 7)))}>先週</Button>
                        <Button variant="outlined" sx={{ color: 'black', borderColor: '#ccc', fontWeight: 'bold', '&:hover': { borderColor: 'black', backgroundColor: 'rgba(0, 0, 0, 0.04)' } }} onClick={() => setSelectedDate(d => new Date(d.setDate(d.getDate() + 7)))}>来週</Button>
                    </Box>
                </Box>
                
                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{ position: 'sticky', top: 0, background: 'white', zIndex: 20 }}>
                                <th style={{ width: '80px', border: '1px solid #ddd', backgroundColor: '#0288d1', color: 'white' }}></th>
                                {weekDates.map((date, index) => (
                                    <th key={index} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#0288d1', color: 'white' }}>
                                        <div>{weekdays[date.getDay()]}</div>
                                        <div>{`${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}`}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody id="calendar-grid-body">
                            {Array.from({ length: 24 }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', verticalAlign: 'middle', background: '#0288d1', color: 'white' }}>
                                        {`${rowIndex}h`}
                                    </td>
                                    {weekDates.map((date, dayIndex) => {
                                        const isSelected = selectedCells.some(c => c.dayIndex === dayIndex && c.rowIndex === rowIndex);
                                        return (
                                        <td 
                                            key={dayIndex} 
                                                data-day={dayIndex}
                                                id={`cell-${dayIndex}-${rowIndex}`}
                                                onMouseDown={(e) => handleMouseDownOnCell(e, rowIndex, dayIndex)}
                                            style={{
                                                    backgroundColor: isSelected ? '#e3f2fd' : 'white',
                                                border: '1px solid #ddd',
                                                    height: '60px', // Adjusted height for 24 rows
                                                position: 'relative'
                                            }}
                                            >
                                                {/* Event rendering with collision detection */}
                                                {(() => {
                                                    const dayEvents = events.filter(e => new Date(e.start).toDateString() === date.toDateString());
                                                    
                                                    const processDayEventsForLayout = (eventsToProcess) => {
                                                        if (!eventsToProcess || eventsToProcess.length === 0) return [];
                                                    
                                                        const sorted = eventsToProcess.map(e => ({...e})).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                                                    
                                                        const columns = []; // This will track the last event in each column
                                                        
                                                        sorted.forEach(event => {
                                                            let placed = false;
                                                            for (let i = 0; i < columns.length; i++) {
                                                                const lastEvent = columns[i];
                                                                if (new Date(event.start).getTime() >= new Date(lastEvent.end).getTime()) {
                                                                    columns[i] = event;
                                                                    event.column = i;
                                                                    placed = true;
                                                                    break;
                                                                }
                                                            }
                                                            if (!placed) {
                                                                event.column = columns.length;
                                                                columns.push(event);
                                                            }
                                                        });
                                                    
                                                        // All events in a day share the same total number of columns to keep widths consistent.
                                                        const totalColumns = columns.length > 0 ? columns.length : 1;
                                                        sorted.forEach(e => e.totalColumns = totalColumns);
                                                    
                                                        return sorted;
                                                    };

                                                    const processedEvents = processDayEventsForLayout(dayEvents);


                                                    return processedEvents
                                                        .filter(event => {
                                                            const eventDate = new Date(event.start);
                                                            return eventDate.getHours() === rowIndex;
                                                        })
                                                        .map(event => {
                                                            const start = new Date(event.start);
                                                            const end = new Date(event.end);
                                                            const topOffset = (start.getMinutes() / 60) * 100;
                                                            const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                                            
                                                            const totalColumns = event.totalColumns || 1;
                                                            const column = event.column || 0;
                                                            const width = 100 / totalColumns;
                                                            const left = column * width;

                                                            const jobTypeName =
                                                              (event.workType?.name && jobTypeColors[event.workType.name]) ? event.workType.name :
                                                              (event.workType?.workMode && jobTypeColors[event.workType.workMode]) ? event.workType.workMode :
                                                              (event.jobType && jobTypeColors[event.jobType]) ? event.jobType :
                                                              (event.workType_id && jobTypeColors[jobTypes.find(jt => jt.id === event.workType_id)?.name]) ? jobTypes.find(jt => jt.id === event.workType_id)?.name :
                                                              '';
                                                            const eventStyle = {
                                                                position: 'absolute', top: `${topOffset}%`, left: `${left}%`,
                                                                width: `calc(${width}% - 4px)`,
                                                                height: `calc(${durationHours * 100}% + ${durationHours * 2}px)`,
                                                                backgroundColor: jobTypeColors[jobTypeName] || '#3a7d82',
                                                                color: 'white', padding: '8px', borderRadius: '4px',
                                                                zIndex: 10 + column, overflow: 'hidden',
                                                                transform: isDragging && draggedEvent?.event.id === event.id ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : 'none',
                                                                boxSizing: 'border-box',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                textAlign: 'center'
                                                            };
                                                            const workplaceName = workplaceJapaneseNames[event.workplace?.id] || event.workplace?.name;
                                                            return (
                                                                <div key={event.id} id={`event-${event.id}`} onMouseDown={(e) => handleMouseDownOnEvent(e, event)} style={eventStyle}>
                                                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{event.description}</div>
                                                                    <div style={{ fontSize: '14px' }}>{workplaceName}</div>
                                                                    <div style={{ fontSize: '14px' }}>{`${formatTimeForSelect(start)} - ${formatEndTimeForDisplay(end)}`}</div>
                                                                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{jobTypeName}</div>
                                                                    <MoreVertIcon onClick={(e) => handleMenuOpen(event, e)} style={{ position: 'absolute', top: 4, right: 4, cursor: 'pointer', fontSize: '18px' }}/>
                                                                </div>
                                                            );
                                                        });
                                                })()}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <MuiMenu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={() => {
                        setSelectedEvent(menuEvent);
                        setShowForm(true);
                        setEditMode(false);
                        setAnchorEl(null);
                    }}>スケジュール詳細</MenuItem>
                    <MenuItem onClick={handleDelete}>スケジュール削除</MenuItem>
                </MuiMenu>
            </Box>

            {showForm && selectedEvent && !editMode ? (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setSelectedEvent(null); setEditMode(false); }}
                            style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', fontSize: 22, fontWeight: 'bold', color: '#888', cursor: 'pointer', zIndex: 2 }}
                            aria-label="Đóng"
                        >
                            ×
                        </button>スケジュール詳細
                        <Typography variant="h6" sx={{mb: 2, textAlign: 'center', fontWeight: 'bold'}}>スケジュール詳細</Typography>
                        <form>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>開始時間</label>
                                <input
                                    type="text"
                                    value={new Date(selectedEvent.start).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    readOnly
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', background: '#f5f5f5' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>終了時間</label>
                                <input
                                    type="text"
                                    value={new Date(selectedEvent.end).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    readOnly
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', background: '#f5f5f5' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>場所</label>
                                <input
                                    type="text"
                                    value={selectedEvent.location || selectedEvent.workplace?.name || ''}
                                    readOnly
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', background: '#f5f5f5' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>説明</label>
                                <textarea
                                    value={selectedEvent.description || ''}
                                    readOnly
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px', background: '#f5f5f5' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>勤務形態</label>
                                <input
                                    type="text"
                                    value={selectedEvent.jobType || selectedEvent.title || selectedEvent.workType?.description || ''}
                                    readOnly
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', background: '#f5f5f5' }}
                                />
                            </div>
                        </form>
                        <div style={{ display: 'flex', gap: '10px', marginTop: 8 }}>
                            <button
                                type="button"
                                onClick={() => setEditMode(true)}
                                style={{ flex: 1, background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                編集
                            </button>
                        </div>
                    </div>
                </div>
            ) : showForm && !selectedEvent ? (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
                        <Typography variant="h6" sx={{mb: 2}}>登録</Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField select fullWidth label="開始時間" name="start" defaultValue={formatTimeForSelect(provisionalEvent?.start)} required margin="normal">
                                {timeOptions.filter(t => t !== '25:00').map(time => <MenuItem key={`start-${time}`} value={time}>{time}</MenuItem>)}
                            </TextField>
                            <TextField select fullWidth label="終了時間" name="end" defaultValue={formatEndTimeForDisplay(provisionalEvent?.end)} required margin="normal">
                                {timeOptions.filter(t => t !== '00:00').map(time => <MenuItem key={`end-${time}`} value={time}>{time}</MenuItem>)}
                            </TextField>
                            <TextField select fullWidth label="場所" name="headquarterId" defaultValue="" required margin="normal">
                                {companies.map(of => <MenuItem key={of.id} value={of.id}>{of.name}</MenuItem>)}
                            </TextField>
                            <TextField select fullWidth label="業務形態" name="jobType" defaultValue="" required margin="normal">
                                {jobTypes.map(jt => <MenuItem key={jt.id} value={jt.name}>{jt.name}</MenuItem>)}
                            </TextField>
                            <TextField name="description" label="説明" fullWidth margin="normal" multiline rows={3} defaultValue=""/>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button onClick={handleFormClose} sx={{ mr: 1 }}>キャンセル</Button>
                                <Button type="submit" variant="contained">保存</Button>
                            </Box>
                        </form>
                    </div>
                </div>
            ) : showForm && selectedEvent && editMode ? (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setSelectedEvent(null); setEditMode(false); }}
                            style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', fontSize: 22, fontWeight: 'bold', color: '#888', cursor: 'pointer', zIndex: 2 }}
                            aria-label="Đóng"
                        >
                            ×
                        </button>
                        <Typography variant="h6" sx={{mb: 2, textAlign: 'center', fontWeight: 'bold'}}>スケジュール編集</Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField select fullWidth label="開始時間" name="start" defaultValue={formatTimeForSelect(selectedEvent?.start)} required margin="normal">
                                {timeOptions.filter(t => t !== '25:00').map(time => <MenuItem key={`start-${time}`} value={time}>{time}</MenuItem>)}
                            </TextField>
                            <TextField select fullWidth label="終了時間" name="end" defaultValue={formatEndTimeForDisplay(selectedEvent?.end)} required margin="normal">
                                {timeOptions.filter(t => t !== '00:00').map(time => <MenuItem key={`end-${time}`} value={time}>{time}</MenuItem>)}
                            </TextField>
                            <TextField select fullWidth label="場所" name="headquarterId" defaultValue={selectedEvent?.workplace?.id || ''} required margin="normal">
                                {companies.map(of => <MenuItem key={of.id} value={of.id}>{of.name}</MenuItem>)}
                            </TextField>
                            <TextField select fullWidth label="業務形態" name="jobType" defaultValue={selectedEvent?.title || ''} required margin="normal">
                                {jobTypes.map(jt => <MenuItem key={jt.id} value={jt.name}>{jt.name}</MenuItem>)}
                            </TextField>
                            <TextField name="description" label="説明" fullWidth margin="normal" multiline rows={3} defaultValue={selectedEvent?.description || ''}/>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit" variant="contained">保存</Button>
                            </Box>
                        </form>
                    </div>
                </div>
            ) : null}
            <AlertPopup open={openAlert} message={alertMessage} type={alertType} onClose={() => setOpenAlert(false)} />
        </Box>
    );
}
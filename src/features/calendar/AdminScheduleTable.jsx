import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from './AdminScheduleTable.module.css';
import { fetchEmployees } from '../../features/employee/employeeSlice';
import { fetchRoles } from '../../features/role/roleSlice';
import { fetchAllSchedules } from './scheduleSlice';

const weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

function getWeekDates(currentDateInput) {
  let date;
  if (typeof currentDateInput === 'string') {
    const [year, month, day] = currentDateInput.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else if (currentDateInput instanceof Date) {
    date = new Date(currentDateInput.getFullYear(), currentDateInput.getMonth(), currentDateInput.getDate());
  } else {
    throw new Error('Invalid date input');
  }
  const dayOfWeek = date.getDay(); // CN = 0
  // Lấy đúng CN local
  const sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    return d;
  });
}

function formatDateDM(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

function getEventColor(type) {
  if (type === 'Nghỉ') return '#008000';
  if (type === 'Công tác') return '#000080';
  if (type === 'Làm việc') return '#1976d2';
  return '#43a047';
}

function getUserEventsForDay(events, employeeId, date) {
    if (!events || !employeeId || !date) return [];
    return events.filter(ev => {
        if (!ev.employee) return false;
        const eventEmployeeId = typeof ev.employee === 'object' ? ev.employee.id : ev.employee;
        if (String(eventEmployeeId) !== String(employeeId)) return false;
        const start = new Date(ev.startDate);
        const end = new Date(ev.endDate);
        const targetDate = new Date(date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        return targetDate >= start && targetDate <= end;
    });
}

// [UPDATED] Định nghĩa màu giống Calendar.jsx
const jobTypeColors = {
  '出張': '#000080',
  '顧客訪問': '#3a7d82',
  '在宅勤務／リモートワーク': '#823f3a',
  '有給休暇': '#525252',
};
// [UPDATED] Hàm lấy màu loại công việc
function getJobTypeColor(name) {
  if (jobTypeColors[name]) return jobTypeColors[name];
  return '#888'; // màu mặc định nếu không có trong jobTypeColors
}

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

const positions = [
  "スタッフ",
  "チームリーダー",
  "部長",
  "部門長"
];

const workplaceJapaneseNames = {
  6: "横浜オフィス",
  7: "宮城行政センター",
  8: "札幌オフィス",
  9: "東京オフィス"
};

const AdminScheduleTable = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');
  
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Lấy dữ liệu từ Redux store
  const events = useSelector((state) => state.schedule?.schedules || []);
  const { employees = [], loading: employeesLoading = false } = useSelector((state) => state.employees || {});
  const { roles = [], loading: rolesLoading = false } = useSelector((state) => state.roles || {});

  // Thêm log kiểm tra dữ liệu
  console.log('AdminScheduleTable events:', events);
  console.log('AdminScheduleTable employees:', employees);

  // Lấy dữ liệu khi component được mount
  useEffect(() => {
    dispatch(fetchAllSchedules());
    dispatch(fetchEmployees());
    dispatch(fetchRoles());
  }, [dispatch]);

  // Lọc nhân viên theo chức vụ, trụ sở và tên
  const filteredEmployees = useMemo(() => employees.filter(emp =>
    (!roleFilter || emp.position === roleFilter) &&
    (!officeFilter || emp.address === officeFilter) &&
    (emp.fullname && emp.fullname.toLowerCase().includes(search.toLowerCase()))
  ), [employees, roleFilter, officeFilter, search]);

  const isLoading = employeesLoading || rolesLoading;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>社員の週間勤務予定表</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '12px 0 8px 0', flexWrap: 'wrap' }}>
          {Object.entries(jobTypeColors).map(([type, color]) => (
            <span key={type} style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
              <span style={{ display: 'inline-block', width: 18, height: 18, background: color, borderRadius: 4, marginRight: 6, border: '1px solid #888' }}></span>
              <span style={{ fontSize: 15 }}>{type}</span>
            </span>
          ))}
        </div>
        <div className={styles.headerBar}>
          <div className={styles.headerBarLeft}>
            <IconButton size="small" onClick={() => setCurrentDate(d => { const nd = new Date(d); nd.setDate(d.getDate() - 7); return nd; })} style={{ border: '1px solid #1976d2', color: '#1976d2' }}>{'<'}</IconButton>
            <span className={styles.dateText}>{formatDateDM(weekDates[0])} - {formatDateDM(weekDates[6])}</span>
            <IconButton size="small" onClick={() => setCurrentDate(d => { const nd = new Date(d); nd.setDate(d.getDate() + 7); return nd; })} style={{ border: '1px solid #1976d2', color: '#1976d2' }}>{'>'}</IconButton>
          </div>
          <div className={styles.filterBarRight}>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">-- 役職 --</option>
              {positions.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
              ))}
            </select>
            <select
              value={officeFilter}
              onChange={e => setOfficeFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">-- 勤務地 --</option>
              {companies.map(of => (
                <option key={of.id} value={of.address}>{of.name}</option>
              ))}
            </select>
            <TextField
              size="small"
              placeholder="社員を検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              InputProps={{ endAdornment: <SearchIcon sx={{ color: '#1976d2' }} /> }}
            />
          </div>
        </div>
      </div>
      <div className={styles.tableContainer}>
        <Table className={styles.table}>
          <TableHead>
            <TableRow className={styles.tableHeaderRow}>
              <TableCell className={`${styles.tableHeaderCell} ${styles.tableHeaderCellBorderRadius}`}>#</TableCell>
              <TableCell className={`${styles.tableHeaderCell} ${styles.tableHeaderCellLeft}`}>社員名</TableCell>
              {weekDates.map((date, idx) => (
                <TableCell key={idx} className={`${styles.tableHeaderCell} ${styles.tableHeaderCellMinWidth}`}>
                  <div className={idx === 0 ? `${styles.tableHeaderCellContent} ${styles.tableHeaderCellContentSunday}` : styles.tableHeaderCellContent}>{weekdays[idx]}</div>
                  <div className={styles.tableHeaderCellDate}>{formatDateDM(date)}</div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">読み込み中...</TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" className={styles.noEmployeeCell}>
                  社員が見つかりません。
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp, rowIdx) => (
                <TableRow key={emp.id} className={rowIdx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                  <TableCell className={styles.tableCellIndex}>{rowIdx + 1}</TableCell>
                  <TableCell className={styles.tableCellName}>{emp.fullname}</TableCell>
                  {weekDates.map((date, colIdx) => {
                    const userEvents = getUserEventsForDay(events, emp.id, date);
                    return (
                      <TableCell key={colIdx} className={styles.tableCell} align="center">
                        {userEvents.map((ev, i) => {
                          const start = new Date(ev.start);
                          const end = new Date(ev.end);
                          const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
                          const jobTypeName =
                            (ev.workType?.name && jobTypeColors[ev.workType.name]) ? ev.workType.name :
                            (ev.workType?.workMode && jobTypeColors[ev.workType.workMode]) ? ev.workType.workMode :
                            (ev.jobType && jobTypeColors[ev.jobType]) ? ev.jobType :
                            (ev.workType_id && jobTypeColors[jobTypes.find(jt => jt.id === ev.workType_id)?.name]) ? jobTypes.find(jt => jt.id === ev.workType_id)?.name :
                            '';
                          const workplaceName =
                            (ev.workplace?.id && workplaceJapaneseNames[ev.workplace.id]) ||
                            (ev.workplace_id && workplaceJapaneseNames[ev.workplace_id]) ||
                            ev.workplace?.name ||
                            '';
                          return (
                            <Tooltip
                              key={i}
                              title={
                                <>
                                  <div><b>場所:</b> {workplaceName}</div>
                                  <div><b>業務形態:</b> {jobTypeName}</div>
                                  {ev.description && <div><b>説明:</b> {ev.description}</div>}
                                </>
                              }
                              arrow
                              placement="top"
                              PopperProps={{
                                modifiers: [
                                  {
                                    name: 'customStyle',
                                    enabled: true,
                                    phase: 'afterWrite',
                                    fn: ({ state }) => {
                                      if (state.elements && state.elements.popper) {
                                        state.elements.popper.classList.add(styles.customTooltip);
                                      }
                                    },
                                  },
                                ],
                              }}
                            >
                              <div className={styles.eventBox} style={{ background: getJobTypeColor(jobTypeName) }}>
                                {timeStr}
                              </div>
                            </Tooltip>
                          );
                        })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminScheduleTable; 

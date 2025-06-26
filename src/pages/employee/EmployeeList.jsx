import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  TableCell,
} from '@mui/material';
import {
  Search,
  ArrowBackIos,
  ArrowForwardIos,
} from '@mui/icons-material';
import AlertPopup from '../../components/common/AlertPopup';
import styles from './EmployeeList.module.css';
import stylesProfile from './ProfileModal.module.css';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, deleteEmployee } from '../../features/employee/employeeSlice';
import { fetchRoles } from '../../features/role/roleSlice';
import { fetchAllWorkTypes } from '../../features/worktype/workTypeSlice';
import { roleAPI, employeeAPI } from '../../api/api';
import ProfileModal from './ProfileModal';
import axios from 'axios';
import { setUser } from '../../features/auth/authSlice';
import { fetchUserProfile } from '../../features/auth/authSlice';

const companies = [
  { id: 1, name: '横浜オフィス', address: '横浜市', description: '横浜市の本社' },
  { id: 2, name: '宮城行政センター', address: '宮城県', description: '宮城城行政センター' },
  { id: 3, name: '札幌オフィス', address: '札幌市', description: '札幌オフィス' },
  { id: 4, name: '東京オフィス', address: '東京都', description: '東京オフィス' }
];

const EmployeeTable = () => {
  const dispatch = useDispatch();
  const { employees = [], loading: employeesLoading = false, error: employeesError = null } = useSelector((state) => state.employees || {});
  const { roles = [], loading: rolesLoading = false, error: rolesError = null } = useSelector((state) => state.roles || {});
  const { workTypes = [] } = useSelector((state) => state.workTypes || {});
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;
  const [roleFilter, setRoleFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [employeesState, setEmployeesState] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    startdate: '',
    address: '',
    role: '',
    avatar: null,
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Thêm mảng chức vụ cứng
  const positions = [
    "スタッフ",
    "チームリーダー",
    "部長",
    "部門長"
  ];

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchRoles());
    dispatch(fetchAllWorkTypes());
  }, [dispatch]);

  // Lọc nhân viên từ Redux store với filter logic đúng
  const filtered = employees.filter(emp => {
    const positionMatch = !roleFilter || (emp.position && emp.position === roleFilter);
    const addressMatch = !addressFilter || (emp.address && emp.address === addressFilter);
    const searchMatch = !search ||
      (emp.fullname && emp.fullname.toLowerCase().includes(search.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(search.toLowerCase())) ||
      (emp.phone && emp.phone.toLowerCase().includes(search.toLowerCase()));
    
    return positionMatch && addressMatch && searchMatch;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    if (!isModalOpen) {
      setNewEmployee({
        name: '',
        password: '',
        email: '',
        phone: '',
        startdate: '',
        address: '',
        roleId: '',
        avatar: null,
        salary: 120000.0,
      });
      setAvatarPreview('');
    }
  }, [isModalOpen]);

  const handleDelete = (id) => {
    if (window.confirm('Muốn xóa nhân viên này?')) {
      setEmployeesState(prev => prev.filter(emp => emp.id !== id));
    }
  };

  const handleAddEmployee = () => {
    setIsModalOpen(true);
    setNewEmployee({
      name: '',
      password: '',
      email: '',
      phone: '',
      startdate: new Date().toISOString().slice(0, 10),
      address: '',
      roleId: '',
      avatar: null,
      salary: 120000.0,
    });
    setAvatarPreview('');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = async () => {
    if (!newEmployee.name) {
      setAlertMessage('氏名を入力してください');
      setOpenAlert(true);
      return;
    }
    const emailRegex = /^[\w-.]+@gmail\.com$/;
    if (!newEmployee.email || !emailRegex.test(newEmployee.email)) {
      setAlertMessage('メールアドレスが正しくありません');
      setOpenAlert(true);
      return;
    }
    const phoneRegex = /^\d{1,15}$/;
    if (!newEmployee.phone || !phoneRegex.test(newEmployee.phone)) {
      setAlertMessage('電話番号が正しくありません');
      setOpenAlert(true);
      return;
    }
    if (!newEmployee.password || !newEmployee.startdate || !newEmployee.address || !newEmployee.role) {
      setAlertMessage('すべての情報を入力してください');
      setOpenAlert(true);
      return;
    }

    const selectedRoleObject = roles.find(r => r.name === newEmployee.role);

    if (!selectedRoleObject) {
      setAlertMessage('役職が正しくありません、もう一度選択してください');
      setOpenAlert(true);
      return;
    }

    const payload = {
      fullname: newEmployee.name,
      password: newEmployee.password,
      email: newEmployee.email,
      phone: newEmployee.phone,
      startDate: newEmployee.startdate,
      address: newEmployee.address,
      roleId: selectedRoleObject.id,
      avatar: newEmployee.avatar || '',
      position: newEmployee.position,
      salary: Number(newEmployee.salary) || 120000.0,
    };

    try {
      await employeeAPI.addEmployee(payload);
      setIsModalOpen(false);
      dispatch(fetchEmployees());
      setAlertMessage('社員追加完了');
      setOpenAlert(true);
    } catch (error) {
      setAlertMessage(error.response?.data?.message || '社員追加失敗');
      setOpenAlert(true);
      console.error("社員追加失敗", error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarChangeCloudinary = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'upload_urban');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dp17vdzvm/image/upload',
        formData
      );
      const imageUrl = response.data.secure_url;
      setNewEmployee(prev => ({ ...prev, avatar: imageUrl }));
      setAvatarPreview(imageUrl);
      // Lấy email user hiện tại từ Redux
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user.email) {
        await dispatch(fetchUserProfile(user.email));
      }
    } catch (error) {
      console.error('Cloudinaryへの画像アップロードエラー:', error);
      setAlertMessage('画像のアップロードに失敗しました。もう一度お試しください。');
      setOpenAlert(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRowDoubleClick = (emp) => {
    // Tìm address đúng từ companies nếu emp.address không khớp
    const matchedCompany = companies.find(c => c.address === emp.address || c.name === emp.address);
    const address = matchedCompany ? matchedCompany.address : '';

    const role = roles.find(r => r.name === emp.roleName);
    const roleDescription = role ? role.description : emp.roleName;

    const employeeForEdit = {
      ...emp,
      address, // Đảm bảo luôn là giá trị tiếng Nhật
      roleName: roleDescription,
      startDate: emp.startDate || new Date().toISOString().slice(0, 10),
      salary: emp.salary || 120000.0,
    };

    setSelectedEmployee(employeeForEdit);
    setEditEmployee(employeeForEdit);
    setDetailModalOpen(true);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!editEmployee.fullname) {
      setAlertMessage('氏名を入力してください');
      setOpenAlert(true);
      return;
    }
    const emailRegex = /^[\w-.]+@gmail\.com$/;
    if (!editEmployee.email || !emailRegex.test(editEmployee.email)) {
      setAlertMessage('メールアドレスが正しくありません');
      setOpenAlert(true);
      return;
    }
    const phoneRegex = /^\d{1,15}$/;
    if (!editEmployee.phone || !phoneRegex.test(editEmployee.phone)) {
      setAlertMessage('電話番号が正しくありません');
      setOpenAlert(true);
      return;
    }
    if (!editEmployee.address || !editEmployee.startDate) {
      setAlertMessage('すべての情報を入力してください、開始日を含めてください');
      setOpenAlert(true);
      return;
    }

    const selectedRoleObject = roles.find(r => r.description === editEmployee.roleName);
     if (!selectedRoleObject) {
      setAlertMessage('役職が正しくありません、もう一度選択してください');
      setOpenAlert(true);
      return;
    }

    const payload = {
      id: editEmployee.id,
      fullname: editEmployee.fullname,
      email: editEmployee.email,
      phone: editEmployee.phone,
      address: editEmployee.address,
      salary: editEmployee.salary,
      roleId: selectedRoleObject.id,
      startDate: String(editEmployee.startDate).split('T')[0],
      avatar: editEmployee.avatar,
      position: editEmployee.position,
    };

    try {
      await employeeAPI.updateEmployee(editEmployee.id, payload);
      setDetailModalOpen(false);
      setIsEditMode(false);
      dispatch(fetchEmployees());
      setAlertMessage('社員更新完了');
      setOpenAlert(true);
    } catch (error) {
      setAlertMessage(error.response?.data?.message || '社員更新失敗');
      setOpenAlert(true);
      console.error("社員更新失敗", error);
    }
  };

  const handleEditChange = (field, value) => {
    setEditEmployee(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteEmployee = () => {
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;

    const resultAction = await dispatch(deleteEmployee(selectedEmployee.id));
    if (deleteEmployee.fulfilled.match(resultAction)) {
      setAlertMessage('社員削除完了');
      setOpenAlert(true);
      setDetailModalOpen(false);
    } else {
      setAlertMessage(resultAction.payload || '社員削除失敗');
      setOpenAlert(true);
    }
    setOpenConfirm(false);
  };

  // Cloudinary avatar upload handler cho edit
  const handleEditAvatarChangeCloudinary = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'upload_urban');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dp17vdzvm/image/upload',
        formData
      );
      const imageUrl = response.data.secure_url;
      setEditEmployee(prev => ({ ...prev, avatar: imageUrl }));
      setAvatarPreview(imageUrl);
    } catch (error) {
      setAlertMessage('画像のアップロードに失敗しました。もう一度お試しください。');
      setOpenAlert(true);
    } finally {
      setIsUploading(false);
    }
  };

  const company = selectedEmployee ? companies.find(c => c.address === selectedEmployee.address) : null;
  const companyName = company ? company.name : (selectedEmployee ? selectedEmployee.address : '未設定');

  if (employeesLoading || rolesLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (employeesError || rolesError) {
    return <Typography color="error">Error: {employeesError || rolesError}</Typography>;
  }

  return (
    <Paper sx={{ p: 4, m: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          社員リスト
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddEmployee}
          sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          社員追加
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
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
          value={addressFilter}
          onChange={e => setAddressFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">-- 勤務地 --</option>
          {companies.map((of) => (
            <option key={of.id} value={of.address}>{of.name}</option>
          ))}
        </select>
        <TextField
          placeholder="検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          style={{ minWidth: 220, height: 45 }}
        />
      </Paper>
      
      <div className={styles.tableHeaderRow}>
        <div className={styles.tableHeaderCell}>番号</div>
        <div className={styles.tableHeaderCell}>氏名</div>
        <div className={styles.tableHeaderCell}>役職</div>
        <div className={styles.tableHeaderCell}>勤務地</div>
      </div>
      
      {paginated.map((emp, idx) => {
        const company = companies.find(c => c.address === emp.address);
        const companyName = company ? company.name : emp.address;
        return (
          <div
            key={emp.id}
            className={styles.tableRow}
            onMouseEnter={() => setHoveredRow(emp.id)}
            onMouseLeave={() => setHoveredRow(null)}
            onDoubleClick={() => handleRowDoubleClick(emp)}
          >
            <div className={styles.tableCell}>{(page - 1) * rowsPerPage + idx + 1}</div>
            <div className={styles.tableCell}>{emp.fullname}</div>
            <div className={styles.tableCell}>{emp.position}</div>
            <div className={styles.tableCell}>{companyName}</div>
          </div>
        );
      })}
      
      <div className={styles.pagination}>
        <IconButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          <ArrowBackIos fontSize="small" />
        </IconButton>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
          <Button
            key={num}
            variant={num === page ? 'contained' : 'outlined'}
            className={num === page ? `${styles.pageBtn} ${styles.pageBtnActive}` : styles.pageBtn}
            onClick={() => setPage(num)}
          >
            {num}
          </Button>
        ))}
        <IconButton onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      </div>
      
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <div className={styles.modalBox}>
          <h2 className={styles.addFormTitle}>社員追加</h2>
          <div className={styles.addFormRow}>
            <div className={styles.addFormLeft}>
              <div className={styles.avatarContainer}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className={styles.avatarRect} />
                ) : (
                  <img src="https://via.placeholder.com/240x300?text=Avatar" alt="Avatar" className={styles.avatarRect} />
                )}
                <label className={styles.avatarButton}>
                プロフィール写真を選択
                  <input type="file" accept="image/*" hidden onChange={handleAvatarChangeCloudinary} />
                </label>
              </div>
            </div>
            <div className={styles.addFormRight}>
          <TextField
            label="氏名"
            fullWidth
                className={styles.addFormField}
            value={newEmployee.name}
            onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                autoComplete="off"
          />
          <TextField
            label="パスワード"
            type="password"
            fullWidth
                className={styles.addFormField}
            value={newEmployee.password}
            onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
                autoComplete="new-password"
          />
          <TextField
            label="メール"
            fullWidth
                className={styles.addFormField}
            value={newEmployee.email}
            onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
          />
          <TextField
            label="電話番号"
            fullWidth
                className={styles.addFormField}
            value={newEmployee.phone}
            onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
          />
          <TextField
            label="開始日"
            fullWidth
            className={styles.addFormField}
            value={newEmployee.startdate}
            InputProps={{ readOnly: true }}
          />
              <FormControl fullWidth className={styles.addFormField}>
            <InputLabel id="office-label">勤務地</InputLabel>
            <Select
              labelId="office-label"
              value={newEmployee.address}
              label="勤務地"
              onChange={e => setNewEmployee({ ...newEmployee, address: e.target.value })}
            >
              {companies.map(of => (
                <MenuItem key={of.id} value={of.address}>{of.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
              <FormControl fullWidth className={styles.addFormField}>
            <InputLabel id="position-label">役職</InputLabel>
            <Select
              labelId="position-label"
              value={newEmployee.position || ''}
              label="役職"
              onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })}
            >
              {positions.map((pos) => (
                <MenuItem key={pos} value={pos}>{pos}</MenuItem>
              ))}
            </Select>
          </FormControl>
              <FormControl fullWidth className={styles.addFormField}>
            <InputLabel id="role-label">役割</InputLabel>
            <Select
              labelId="role-label"
              value={newEmployee.role || ''}
              label="役割"
              onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>{role.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
              <div className={styles.modalActions}>
                <Button onClick={() => {
                  setIsModalOpen(false);
                  setNewEmployee({
                    name: '',
                    password: '',
                    email: '',
                    phone: '',
                    startdate: '',
                    address: '',
                    role: '',
                    avatar: null,
                  });
                  setAvatarPreview('');
                }}>キャンセル</Button>
            <Button variant="contained" onClick={handleModalSave}>保存</Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      
      {detailModalOpen && selectedEmployee && (
        <>
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)}>
            {isEditMode ? (
              <div className={styles.modalBox}>
                <div className={styles.addFormRow}>
                  <div className={styles.addFormLeft}>
                    <div className={styles.avatarContainer}>
                      {editEmployee.avatar ? (
                        <img src={editEmployee.avatar} alt="Avatar" className={styles.avatarRect} />
                      ) : (
                        <img src="https://via.placeholder.com/240x300?text=Avatar" alt="Avatar" className={styles.avatarRect} />
                      )}
                      <label className={styles.avatarButton}>
                      プロフィール写真を選択
                        <input type="file" accept="image/*" hidden onChange={handleEditAvatarChangeCloudinary} />
                      </label>
                    </div>
                  </div>
                  <div className={styles.addFormRight}>
                    <TextField
                      label="氏名"
                      fullWidth
                      className={styles.addFormField}
                      value={editEmployee.fullname}
                      onChange={(e) => handleEditChange('fullname', e.target.value)}
                    />
                    <TextField
                      label="メール"
                      fullWidth
                      className={styles.addFormField}
                      value={editEmployee.email}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                    />
                    <TextField
                      label="電話番号"
                      fullWidth
                      className={styles.addFormField}
                      value={editEmployee.phone}
                      onChange={(e) => handleEditChange('phone', e.target.value)}
                    />
                    <TextField
                      label="開始日"
                      type="date"
                      fullWidth
                      value={editEmployee?.startDate ? String(editEmployee.startDate).split('T')[0] : ''}
                      InputLabelProps={{ shrink: true }}
                      className={stylesProfile.input}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <FormControl fullWidth className={styles.addFormField}>
                      <InputLabel id="office-label-edit">勤務地</InputLabel>
                      <Select
                        labelId="office-label-edit"
                        value={editEmployee.address}
                        label="勤務地"
                        onChange={e => handleEditChange('address', e.target.value)}
                      >
                        {companies.map(of => (
                          <MenuItem key={of.id} value={of.address}>{of.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth className={styles.addFormField}>
                      <InputLabel id="position-label-edit">役職</InputLabel>
                      <Select
                        labelId="position-label-edit"
                        value={editEmployee.position || ''}
                        label="役職"
                        onChange={e => handleEditChange('position', e.target.value)}
                      >
                        {positions.map((pos) => (
                          <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <div className={styles.modalActions}>
                      <Button onClick={() => setIsEditMode(false)}>キャンセル</Button>
                <Button variant="contained" onClick={handleSaveEdit}>保存</Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={stylesProfile.profileModalBox}>
                <div className={stylesProfile.profileHeader}>
                  <div className={stylesProfile.profileAvatarCol}>
                    {selectedEmployee.avatar ? (
                      <img src={selectedEmployee.avatar} alt="Avatar" className={stylesProfile.profileAvatarRect} />
                    ) : (
                      <div className={`${stylesProfile.profileAvatarRect} ${stylesProfile.profileAvatarPlaceholder}`} />
                    )}
                  </div>
                  <div className={stylesProfile.profileNameCol}>
                    <div className={stylesProfile.profileName}>{selectedEmployee.fullname}</div>
                  </div>
                </div>
                <div className={stylesProfile.profileInfoSection}>
                  <div className={stylesProfile.profileInfoBlock}>
                    <div className={stylesProfile.profileInfoTitle}>個人情報</div>
                    <div className={stylesProfile.profileInfoGrid}>
                      <div>
                        <div className={stylesProfile.profileInfoLabel}>メール</div>
                        <div className={stylesProfile.profileInfoValue}>{selectedEmployee.email}</div>
                      </div>
                      <div>
                        <div className={stylesProfile.profileInfoLabel}>電話番号</div>
                        <div className={stylesProfile.profileInfoValue}>{selectedEmployee.phone}</div>
                      </div>
                      <div>
                        <div className={stylesProfile.profileInfoLabel}>開始日</div>
                        <div className={stylesProfile.profileInfoValue}>{selectedEmployee.startDate}</div>
                      </div>
                    </div>
                  </div>
                  <div className={stylesProfile.profileInfoBlock}>
                    <div className={stylesProfile.profileInfoTitle}>仕事情報</div>
                    <div className={stylesProfile.profileInfoGrid}>
                      <div>
                        <div className={stylesProfile.profileInfoLabel}>勤務地</div>
                        <div className={stylesProfile.profileInfoValue}>{companyName}</div>
                      </div>
                      <div>
                        <div className={stylesProfile.profileInfoLabel}>役職</div>
                        <div className={stylesProfile.profileInfoValue}>{selectedEmployee.position || '未設定'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={stylesProfile.profileModalActions}>
                  <Button variant="contained" onClick={() => { setIsEditMode(true); setEditEmployee(selectedEmployee); }}>編集</Button>
                  <Button variant="contained" color="error" onClick={handleDeleteEmployee}>削除</Button>
                  <Button onClick={() => setDetailModalOpen(false)}>閉じる</Button>
                </div>
              </div>
            )}
          </Modal>
          <ConfirmDialog
            open={openConfirm}
            title="社員削除確認"
            content="この社員を削除しますか？"
            onConfirm={handleConfirmDelete}
            onCancel={() => setOpenConfirm(false)}
            okText="削除"
            cancelText="キャンセル"
          />
        </>
      )}
      <AlertPopup open={openAlert} message={alertMessage} type={
        [
          '社員追加完了',
          '社員更新完了',
          '社員削除完了'
        ].includes(alertMessage) ? 'success' : 'error'
      } onClose={() => setOpenAlert(false)} className={isModalOpen ? styles.alertOnModal : ''} />
    </Paper>
  );
};

export default EmployeeTable; 
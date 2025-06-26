import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, Avatar, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser, setUser } from '../../features/auth/authSlice';
import { fetchEmployees } from '../../features/employee/employeeSlice';
import styles from './ProfileModal.module.css';

const positions = [
  "スタッフ",
  "チームリーダー",
  "部長",
  "部門長"
];

const companies = [
  { id: 1, name: '横浜オフィス', address: '横浜市', description: '横浜市の本社' },
  { id: 2, name: '宮城行政センター', address: '宮城県', description: '宮城城行政センター' },
  { id: 3, name: '札幌オフィス', address: '札幌市', description: '札幌オフィス' },
  { id: 4, name: '東京オフィス', address: '東京都', description: '東京オフィス' }
];

const ProfileModal = ({ open, onClose }) => {
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const roles = useSelector(state => state.roles.roles);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    const handleSave = () => {
        dispatch(setUser(editEmployee));
        dispatch(fetchEmployees());
        setIsEditMode(false);
    };

    if (!user) {
        return null;
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Box className={styles.profileModalBox}>
                {isEditMode ? (
                    <form className={styles.editProfileForm} onSubmit={e => { e.preventDefault(); handleSave(); }}>
                        <div className={styles.addFormRow}>
                            <div className={styles.addFormLeft}>
                                <div className={styles.avatarContainer}>
                                    {editEmployee?.avatar ? (
                                        <img src={editEmployee.avatar} alt="Avatar" className={styles.avatarRect} />
                                    ) : (
                                        <img src="https://via.placeholder.com/240x300?text=Avatar" alt="Avatar" className={styles.avatarRect} />
                                    )}
                                    <label className={styles.avatarButton}>
                                        プロフィール写真を選択
                                        <input type="file" accept="image/*" hidden onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setEditEmployee({ ...editEmployee, avatar: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </label>
                                </div>
                            </div>
                            <div className={styles.addFormRight}>
                                <TextField
                                    label="氏名"
                                    fullWidth
                                    className={styles.addFormField}
                                    value={editEmployee?.fullname || ''}
                                    onChange={e => setEditEmployee({ ...editEmployee, fullname: e.target.value })}
                                />
                                <TextField
                                    label="メール"
                                    fullWidth
                                    className={styles.addFormField}
                                    value={editEmployee?.email || ''}
                                    onChange={e => setEditEmployee({ ...editEmployee, email: e.target.value })}
                                    disabled
                                />
                                <TextField
                                    label="電話番号"
                                    fullWidth
                                    className={styles.addFormField}
                                    value={editEmployee?.phone || ''}
                                    onChange={e => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                                />
                                <TextField
                                    label="開始日"
                                    type="date"
                                    fullWidth
                                    className={styles.addFormField}
                                    value={editEmployee?.startDate ? String(editEmployee.startDate).split('T')[0] : ''}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{ readOnly: true }}
                                />
                                <FormControl fullWidth className={styles.addFormField}>
                                    <InputLabel id="office-label-edit">勤務地</InputLabel>
                                    <Select
                                        labelId="office-label-edit"
                                        value={editEmployee?.address || ''}
                                        label="勤務地"
                                        onChange={e => setEditEmployee({ ...editEmployee, address: e.target.value })}
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
                                        value={editEmployee?.position || ''}
                                        label="役職"
                                        onChange={e => setEditEmployee({ ...editEmployee, position: e.target.value })}
                                    >
                                        {positions.map((pos, idx) => (
                                            <MenuItem key={idx} value={pos}>{pos}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <div className={styles.profileModalActions} style={{ justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
                                    <Button onClick={() => setIsEditMode(false)} color="primary">キャンセル</Button>
                                    <Button type="submit" variant="contained" color="primary">保存</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className={styles.profileHeader}>
                            <div className={styles.profileAvatarCol}>
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className={styles.profileAvatarRect} />
                                ) : (
                                    <div className={`${styles.profileAvatarRect} ${styles.profileAvatarPlaceholder}`} />
                                )}
                            </div>
                            <div className={styles.profileNameCol}>
                                <div className={styles.profileName}>{user.fullname}</div>
                            </div>
                        </div>

                        <div className={styles.profileInfoSection}>
                            <div className={styles.profileInfoBlock}>
                                <div className={styles.profileInfoTitle}>個人情報</div>
                                <div className={styles.profileInfoGrid}>
                                    <div>
                                        <div className={styles.profileInfoLabel}>メール</div>
                                        <div className={styles.profileInfoValue}>{user.email || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className={styles.profileInfoLabel}>電話番号</div>
                                        <div className={styles.profileInfoValue}>{user.phone || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.profileInfoBlock}>
                                <div className={styles.profileInfoTitle}>業務情報</div>
                                <div className={styles.profileInfoGrid}>
                                    <div>
                                        <div className={styles.profileInfoLabel}>開始日</div>
                                        <div className={styles.profileInfoValue}>{user.startDate || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className={styles.profileInfoLabel}>役職</div>
                                        <div className={styles.profileInfoValue}>{user.position || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div>
                                        <div className={styles.profileInfoLabel}>勤務地</div>
                                        <div className={styles.profileInfoValue}>{user.address || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.profileModalActions} style={{ justifyContent: 'space-between' }}>
                            <div className={styles.groupButton}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        setIsEditMode(true);
                                        setEditEmployee(user);
                                    }}
                                    style={{ marginRight: 8 }}
                                >
                                    編集
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => { onClose(); navigate('/change-password'); }}>
                                    パスワード変更
                                </Button>
                            </div>
                            <div>
                                <Button onClick={onClose}>閉じる</Button>
                                <Button color="error" variant="outlined" onClick={handleLogout}>ログアウト</Button>
                            </div>
                        </div>
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default ProfileModal; 
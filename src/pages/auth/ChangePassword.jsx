import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AlertPopup from '../../components/common/AlertPopup';
import logo from '../../assets/images/urban-logo.png';
import axios from 'axios';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setError('すべての情報を入力してください');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser || !currentUser.email) {
        setError('ユーザー情報が見つかりません。');
        setLoading(false);
        return;
      }
      await axios.post('/api/user/change-password', {
        email: currentUser.email,
        oldPassword,
        newPassword
      });
      setAlertMessage('パスワードを変更しました');
      setOpenAlert(true);
      setTimeout(() => {
        setOpenAlert(false);
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data || 'パスワードを変更できませんでした');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fafd' }}>
      <Paper sx={{ p: 4, minWidth: 340, maxWidth: 400 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src={logo} alt="Urban Logo" style={{ height: 60, marginBottom: 12 }} />
        </Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>パスワードを変更</Typography>
        <TextField
          label="古いパスワード"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
        />
        <TextField
          label="新しいパスワード"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <Button variant="contained" fullWidth onClick={handleChangePassword} disabled={loading}>パスワードを変更</Button>
        <AlertPopup open={openAlert} message={alertMessage} type="success" onClose={() => setOpenAlert(false)} />
      </Paper>
    </Box>
  );
};

export default ChangePassword; 
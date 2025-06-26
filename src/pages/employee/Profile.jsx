import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { useSelector } from 'react-redux';

const companies = [
  { id: 1, name: '横浜オフィス', address: '横浜市', description: '横浜市の本社' },
  { id: 2, name: '宮城行政センター', address: '宮城県', description: '宮城城行政センター' },
  { id: 3, name: '札幌オフィス', address: '札幌市', description: '札幌オフィス' },
  { id: 4, name: '東京オフィス', address: '東京都', description: '東京オフィス' }
];

const Profile = () => {
    // Lấy thông tin user đầy đủ từ Redux store
    const user = useSelector(state => state.auth.user);
    const { roles } = useSelector(state => state.role);

    if (!user) {
        return <Typography>Đang tải thông tin người dùng...</Typography>;
            }
    
    const getAvatarUrl = (user) => {
        if (user && user.avatar) return user.avatar;
        return "https://via.placeholder.com/240x300?text=Avatar";
    };

    const company = companies.find(c => c.address === user.address);
    const companyName = company ? company.name : user.address || 'Chưa cập nhật';

    return (
        <Box sx={{ maxWidth: 800, margin: '40px auto', p: 3 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }} elevation={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar src={getAvatarUrl(user)} sx={{ width: 100, height: 100, mr: 3 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{user.fullname}</Typography>
                    </Box>
                </Box>

                <Box sx={{ borderTop: '1px solid #eee', pt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Thông tin cá nhân</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Typography><b>Email:</b> {user.email}</Typography>
                        <Typography><b>Số điện thoại:</b> {user.phone}</Typography>
                        <Typography><b>Ngày bắt đầu:</b> {user.startDate ? new Date(user.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</Typography>
                        </Box>
                        </Box>

                <Box sx={{ borderTop: '1px solid #eee', pt: 3, mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Thông tin công việc</Typography>
                     <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Typography><b>Trụ sở:</b> {companyName}</Typography>
                        <Typography><b>Chức vụ:</b> {user.position || 'Chưa cập nhật'}</Typography>
                        </Box>
                        </Box>
            </Paper>
        </Box>
    );
};

export default Profile; 
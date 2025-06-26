import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowRoles }) => {
    const { user, token } = useSelector(state => state.auth);

    // 1. Kiểm tra xem người dùng đã đăng nhập chưa
    if (!token || !user) {
        // Nếu chưa, chuyển hướng về trang đăng nhập
        return <Navigate to="/login" replace />;
    }

    // 2. Chuẩn hóa vai trò của người dùng về chữ thường
    const userRole = (user.roleName || user.role || '').toLowerCase();

    // 3. Chuẩn hóa các vai trò được cho phép về chữ thường
    const allowedRolesLower = allowRoles.map(r => r.toLowerCase());

    // 4. Kiểm tra xem vai trò của người dùng có được phép không
    if (!allowedRolesLower.includes(userRole)) {
        // Nếu không được phép, hiển thị thông báo lỗi
        return (
            <div style={{ color: 'red', fontWeight: 600, textAlign: 'center', marginTop: 40 }}>
                Bạn không có quyền truy cập trang này!
            </div>
        );
    }

    // 5. Nếu mọi thứ đều ổn, cho phép truy cập
    return children;
};

export default ProtectedRoute; 
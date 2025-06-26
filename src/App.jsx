import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Layout from './components/layout/Layout';
import EmployeeList from './pages/employee/EmployeeList';
import Login from './pages/auth/Login';
import PrivateRoute from './components/common/PrivateRoute';
import Calendar from './features/calendar/Calendar';
import Home from './pages/Home';
import UrVN from './pages/UrVN';
import UrCor from './pages/UrCor';
import RoleManagement from './pages/admin/RoleManagement.jsx';
import CompanyManagement from './pages/admin/CompanyManagement.jsx';
import JobTypeManagement from './pages/admin/JobTypeManagement.jsx';
import ChucvuManagement from './pages/admin/ChucvuManagement.jsx';
import Profile from './pages/employee/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminScheduleTable from './features/calendar/AdminScheduleTable';
import ChangePassword from './pages/auth/ChangePassword.jsx';
import Forgotpass from './pages/auth/Forgotpass';

const App = () => {
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <Header />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<UrVN />} />
          <Route path="/corporation" element={<UrCor />} />
          <Route path="/admin/employees" element={
            <ProtectedRoute allowRoles={['Admin']}>
              <EmployeeList />
            </ProtectedRoute>
          } />
          <Route path="/admin/roles" element={
            <ProtectedRoute allowRoles={['Admin']}>
              <RoleManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/companies" element={
            <ProtectedRoute allowRoles={['Admin']}>
              <CompanyManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/job-types" element={
            <ProtectedRoute allowRoles={['Admin']}>
              <JobTypeManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/schedule" element={
            <ProtectedRoute allowRoles={['Admin']}>
              <AdminScheduleTable />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute allowRoles={['User']}>
              <Calendar />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpass" element={<Forgotpass />} />
      </Routes>
    </div>
  );
};

export default App; 
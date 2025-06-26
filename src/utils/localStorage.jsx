// Utility functions for localStorage operations
export const getLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initial data for different entities
export const initialData = {
  employees: [
    {
      id: 1,
      name: 'LE HUYNH DIEP',
      position: 'Trưởng phòng',
      office: 'Trung tâm hành chính Miyagi',
      status: 'Đang làm việc',
    },
    // ... other initial employees
  ],
  roles: [
    { id: 1, name: 'Quản lý', description: 'Quản trị viên hệ thống', code: 'Admin' },
    { id: 2, name: 'Nhân viên', description: 'Nhân viên', code: 'User' },
  ],
  companies: [
    { id: 1, name: 'Company A', address: 'Tokyo, Japan' },
    { id: 2, name: 'Company B', address: 'Osaka, Japan' },
  ],
  jobTypes: [
    { id: 5, name: '出張', description: 'Công tác' },
    { id: 6, name: '顧客訪問', description: 'Ra ngoài gặp khách hàng' },
    { id: 7, name: '在宅勤務／リモートワーク', description: 'Làm việc từ xa / tại nhà' },
    { id: 8, name: '有給休暇', description: 'Nghỉ phép có lương' },
  ],
};

// Initialize data if not exists
export const initializeData = () => {
  Object.entries(initialData).forEach(([key, value]) => {
    if (!getLocalStorage(key)) {
      setLocalStorage(key, value);
    }
  });
}; 
import axios from 'axios';

const BASE_URL = "https://urban-corporation.onrender.com";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để xử lý token
api.interceptors.request.use(
    (config) => {
    const token = localStorage.getItem('token');
    if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API calls
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
};

export const userAPI = {
    getProfile: () => api.get('/api/profile'),
    updateProfile: (data) => api.put('/api/profile', data),
    getProfileByEmail: (email) => api.get(`/api/profile/${email}`),
};

export const employeeAPI = {
    getAllEmployees: () => api.get('/admin/employees'),
    getEmployeeById: (id) => api.get(`/admin/employees/${id}`),
    addEmployee: (data) => api.post('/auth/register', data),
    deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
    updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
};

export const roleAPI = {
    getAllRoles: () => api.get('/api/roles'),
};

export const eventAPI = {
    getByEmail: (email) => api.get(`/api/event/${email}`),
    getAll: () => api.get('/api/event'),
    create: (eventData) => api.post('/api/event/create', eventData),
    update: (eventId, eventData) => api.post(`/api/event/update/${eventId}`, eventData),
    delete: (eventId) => api.delete(`/api/event/${eventId}`),
};

export const headquarterAPI = {
    getAll: () => api.get('/api/headquarter'),
};

export const workTypeAPI = {
    getAll: () => api.get('/api/workType'),
};


export default api; 
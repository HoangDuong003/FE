import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import employeeReducer from '../features/employee/employeeSlice';
import roleReducer from '../features/role/roleSlice';
import scheduleReducer from '../features/calendar/scheduleSlice';
import workTypeReducer from '../features/worktype/workTypeSlice';
import companyReducer from '../features/company/companySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    roles: roleReducer,
    schedule: scheduleReducer,
    workTypes: workTypeReducer,
    companies: companyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
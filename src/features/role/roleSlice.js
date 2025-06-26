import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roleAPI } from '../../api/api';

// Thunk để lấy danh sách vai trò
export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roleAPI.getAllRoles();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not fetch roles.');
    }
  }
);

const initialState = {
  roles: [],
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default roleSlice.reducer; 

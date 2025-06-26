import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, userAPI } from '../../api/api';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(userData);
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed.');
    }
  }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    }
);

// Thunk để fetch thông tin profile của user bằng email
export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (email, { rejectWithValue }) => {
        try {
            const response = await userAPI.getProfileByEmail(email);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Could not fetch user profile.');
        }
    }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('currentUser')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
        state.loading = action.payload
    },
    setUser: (state, action) => {
        state.user = action.payload;
        if(action.payload) {
            localStorage.setItem('currentUser', JSON.stringify(action.payload));
        } else {
            localStorage.removeItem('currentUser');
        }
      }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      })
      // Xử lý cho fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
          state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload; // Cập nhật đầy đủ thông tin user
          localStorage.setItem('currentUser', JSON.stringify(action.payload)); // Cập nhật localStorage
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      });
  },
});

export const { setLoading, setUser } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer; 
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workTypeAPI } from '../../api/api';

export const fetchAllWorkTypes = createAsyncThunk(
  'workTypes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workTypeAPI.getAll();
      if (typeof response.data === 'string') {
        return JSON.parse(response.data);
      }
      return response.data;
    } catch (error) {
      console.error("API Error for WorkTypes:", error.response);
      return rejectWithValue(error.response.data);
    }
  }
);

const workTypeSlice = createSlice({
  name: 'workTypes',
  initialState: {
    workTypes: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllWorkTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllWorkTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const workTypes = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload && Array.isArray(action.payload.data)) 
          ? action.payload.data 
          : [];
        state.workTypes = workTypes;
      })
      .addCase(fetchAllWorkTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      }); 
  },
});

export default workTypeSlice.reducer; 
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { headquarterAPI } from '../../api/api';

export const fetchAllCompanies = createAsyncThunk(
  'companies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await headquarterAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState: {
    companies: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCompanies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const companies = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload && Array.isArray(action.payload.data)) 
          ? action.payload.data 
          : [];
        state.companies = companies;
      })
      .addCase(fetchAllCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default companySlice.reducer; 
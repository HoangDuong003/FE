import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventAPI } from '../../api/api';

// Async thunk for fetching schedules for a specific user by email
export const fetchSchedulesByEmail = createAsyncThunk(
  'schedules/fetchByEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getByEmail(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for fetching all schedules (for admin)
export const fetchAllSchedules = createAsyncThunk(
  'schedules/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for creating a new event
export const createEvent = createAsyncThunk(
  'schedules/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventAPI.create(eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for updating an event
export const updateEvent = createAsyncThunk(
  'schedules/updateEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventAPI.update(eventId, eventData);
      // Thêm log để debug response
      console.log('Update event response:', response);
      // Nếu BE trả về object event trực tiếp
      return response.data;
      // Nếu BE trả về { data: ... } thì dùng: return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting an event
export const deleteEvent = createAsyncThunk(
  'schedules/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await eventAPI.delete(eventId);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState: {
    schedules: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cases for fetching ALL schedules (for admin)
      .addCase(fetchAllSchedules.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllSchedules.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log('fetchAllSchedules.fulfilled called with payload:', action.payload);
        if (Array.isArray(action.payload)) {
          state.schedules = action.payload
            .map(transformEvent)
            .filter(event => event !== null);
          console.log('Transformed schedules:', state.schedules);
        } else {
          state.schedules = [];
        }
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Cases for fetching schedules BY EMAIL (for user)
      .addCase(fetchSchedulesByEmail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSchedulesByEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (Array.isArray(action.payload)) {
          state.schedules = action.payload
            .map(transformEvent)
            .filter(event => event !== null);
        } else {
          state.schedules = [];
        }
      })
      .addCase(fetchSchedulesByEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error("Failed to fetch user schedules:", action.payload);
      })

      // Cases for Create, Update, Delete
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Chuyển đổi event mới và thêm vào state
        const newEvent = transformEvent(action.payload);
        if (newEvent) {
          state.schedules.push(newEvent);
        }
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedEvent = transformEvent(action.payload);
        const index = state.schedules.findIndex(event => event.id === updatedEvent.id);
        if (index !== -1) {
          state.schedules[index] = updatedEvent;
        }
      })
       .addCase(deleteEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.schedules = state.schedules.filter((event) => event.id !== action.payload);
      });
  },
});

// Helper function to transform DTO to frontend event object
const transformEvent = (event) => {
  if (!event || !event.day) return null;
  
  const [year, month, day] = event.day.split('-').map(Number);
  const startDate = new Date(year, month - 1, day, event.startTime);
  const endDate = new Date(year, month - 1, day, event.endTime);
  
  const transformed = {
    ...event,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startDate: startDate.toISOString(), // For AdminScheduleTable
    endDate: endDate.toISOString(), // For AdminScheduleTable
    // Map DTO structure to the one used in Calendar.jsx
    title: event.workType?.description, 
    headquarterId: event.workplace?.id,
    description: event.taskDescription,
    // For AdminScheduleTable
    jobType: event.workType?.description,
    location: event.workplace?.name || event.workplace?.address,
  };
  
  return transformed;
};

export default scheduleSlice.reducer; 
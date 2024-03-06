import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { server } from '../../config/server';
import { requestCount } from '../../home/views/request/api/request';

export const fetchNotification = createAsyncThunk('notification/fetchNotification', async (_, { rejectWithValue }) => {
  try {
    let result = {};
    const res = await server.get(`/requests`);

    // re data for redux state
    res.data.data.count.map((res) => {
      result = { ...result, [res.name]: res.count };
    });
    return result;
  } catch (error) {
    rejectWithValue(error.response.data);
  }
});

export const counterNotification = createSlice({
  name: 'notification',
  initialState: {
    data: { Pending: 0, Processing: 0, Returned: 0, Completed: 0, Closed:0, Drafts: 0 },
    status: null,
  },
  extraReducers: {
    [fetchNotification.pending]: (state, action) => {
      state.status = 'loading';
    },
    [fetchNotification.fulfilled]: (state, { payload }) => {
      state.status = 'success';
      state.data = payload;
    },
    [fetchNotification.rejected]: (state, { payload }) => {
      state.status = 'failed';
    },
  },
});

export const { returnPending, returnProcessing, returnReturned, returnCompleted, returnClosed, returnDrafts } =
  counterNotification.actions;

export default counterNotification.reducer;

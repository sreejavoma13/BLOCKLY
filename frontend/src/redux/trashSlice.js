import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to empty the trash
export const emptyTrash = createAsyncThunk(
  "trash/emptyTrash",
  async ({userid}, thunkAPI) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/trash/${userid}`, {
        withCredentials: true, // if you’re using cookies for auth
      });
      return res.data.message; // "Trash emptied successfully" or similar
    } catch (err) {
      console.log(err.response?.data?.error);
        
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to empty trash"
      );
    }
  }
);

const trashSlice = createSlice({
  name: "trash",
  initialState: {
    loading: false,
    successMessage: null,
    error: null,
  },
  reducers: {
    clearTrashStatus: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(emptyTrash.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(emptyTrash.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload; // Message from API
      })
      .addCase(emptyTrash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTrashStatus } = trashSlice.actions;

export default trashSlice.reducer;
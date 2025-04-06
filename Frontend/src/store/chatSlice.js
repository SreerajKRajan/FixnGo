import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// Async thunk to fetch chat threads
export const fetchChatThreads = createAsyncThunk(
  "chat/fetchChatThreads",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/chat/threads/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Failed to fetch chat threads"
      );
    }
  }
);

// Async thunk to create a new chat thread
export const createChatThread = createAsyncThunk(
  "chat/createChatThread",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/chat/threads/", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Failed to create chat thread"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    threads: [],
    loading: false,
    error: null,
  },
  reducers: {
    // For real-time updates
    updateThread: (state, action) => {
      const updatedThread = action.payload;
      const index = state.threads.findIndex(thread => thread.id === updatedThread.id);
      
      if (index !== -1) {
        state.threads[index] = updatedThread;
      }
    },
    
    // Update unread count after a message is received
    incrementUnreadCount: (state, action) => {
      const { roomId, senderType } = action.payload;
      const threadIndex = state.threads.findIndex(thread => thread.id === roomId);
      
      if (threadIndex !== -1) {
        // Increment the appropriate unread count based on sender type
        const isCurrentUserWorkshop = localStorage.getItem("isWorkshop") === "true";
        
        if ((isCurrentUserWorkshop && senderType === "user") || 
            (!isCurrentUserWorkshop && senderType === "workshop")) {
          state.threads[threadIndex].unread_count = 
            (state.threads[threadIndex].unread_count || 0) + 1;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload;
      })
      .addCase(fetchChatThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createChatThread.fulfilled, (state, action) => {
        // Add new thread to the list if it doesn't exist already
        const exists = state.threads.some(thread => thread.id === action.payload.id);
        if (!exists) {
          state.threads.unshift(action.payload);
        }
      });
  },
});

export const { updateThread, incrementUnreadCount } = chatSlice.actions;
export default chatSlice.reducer;
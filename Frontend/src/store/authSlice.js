import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("users/signup/", userData);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signup Failed");
    }
  }
);

export const otpVerification = createAsyncThunk(
  "auth/otpVerification",
  async ({ otp, email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("users/otp_verification/", { otp, email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP Verification Failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("users/login/", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login Failed");
    }
  }
);


const initialState = {
  user: null,
  email: null,
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.email = null;
      state.error = null;
      localStorage.removeItem("token"); // Clear token from localStorage if needed
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.email = action.payload.email;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
      })
      .addCase(otpVerification.pending, (state) => {
        state.loading = true;
      })
      .addCase(otpVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(otpVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred during OTP verification";
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.email = action.payload.email;
        state.error = null;
        localStorage.setItem("token", action.payload.token); // Save token to localStorage
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout } =
  authSlice.actions;
export default authSlice.reducer;

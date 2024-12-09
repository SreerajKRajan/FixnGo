import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const userSignup = createAsyncThunk(
  "userAuth/userSignup",
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

export const userOtpVerification = createAsyncThunk(
  "userAuth/userOtpVerification",
  async ({ otp, email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("users/otp_verification/", { otp, email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP Verification Failed");
    }
  }
);

export const userLogin = createAsyncThunk(
  "userAuth/userLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("users/login/", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login Failed");
    }
  }
);

export const adminLogin = createAsyncThunk(
  "userAuth/adminLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("admin_side/login/", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Admin login failed" });
    }
  }
);


const initialState = {
  user: (() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      return null;
    }
  })(),
    email: localStorage.getItem("email") || null,
  error: null,
  loading: false,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.email = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("email");
    },    
  },
  extraReducers: (builder) => {
    builder
      .addCase(userSignup.pending, (state) => {
        state.loading = true;
      })
      .addCase(userSignup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.email = action.payload.email;
        state.error = null;
      })
      .addCase(userSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
      })
      .addCase(userOtpVerification.pending, (state) => {
        state.loading = true;
      })
      .addCase(userOtpVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(userOtpVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred during OTP verification";
      })
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.email = action.payload.email;
        state.error = null;
      
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("email", action.payload.email);
      })      
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.non_field_errors
          ? action.payload.non_field_errors[0]
          : "Login failed";
      })
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.admin;
        state.error = null;
        localStorage.setItem("adminToken", action.payload.token);
        localStorage.setItem("admin", JSON.stringify(action.payload.admin));
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error =
        action.payload?.non_field_errors?.[0] ||
        action.payload?.detail ||
        "Admin login failed";
      });
      
  },
});

export const { logout } =
  userAuthSlice.actions;
export default userAuthSlice.reducer;

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
      // Extract and return backend error
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data); // Send error to rejected case
      }
      return rejectWithValue({ detail: "Network error. Please try again." });
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

export const sendForgotPasswordEmail = createAsyncThunk(
  "userAuth/sendForgotPasswordEmail",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/forgot-password/", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ uidb64, token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/users/reset-password/${uidb64}/${token}/`,
        {
          password: password,
          confirm_password: confirmPassword,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to reset password. Try again."
      );
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
  successMessage: null,
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
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
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
        console.log("User payload", action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.email = action.payload.email;
        state.error = null;
      
        localStorage.setItem("token", action.payload.access);
        localStorage.setItem("refreshToken", action.payload.refresh);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("email", action.payload.email);
      })      
      .addCase(userLogin.rejected, (state, action) => {
        console.log("Rejected action payload:", action.payload); // Debugging payload
        state.loading = false;
        // Extract meaningful error message
        state.error =
          action.payload?.non_field_errors?.[0] || // Django-style errors
          action.payload?.error ||                // Custom errors
          action.payload?.detail ||               // JWT errors
          "Login failed. Please try again.";      // Default fallback
      })
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        console.log("Admin payload", action.payload); // Check payload structure
        state.loading = false;
        state.admin = action.payload.admin;
        state.error = null;
      
        // Store tokens in localStorage
        const adminToken = action.payload.token;
        const adminRefreshToken = action.payload.refresh;
        const adminData = action.payload.admin;
      
        localStorage.setItem("adminToken", adminToken);
        localStorage.setItem("adminRefreshToken", adminRefreshToken);
        localStorage.setItem("admin", JSON.stringify(adminData));
      
        // Log the stored token for debugging
        console.log("Admin token set to localstorage", adminToken); 
      })
              
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error =
        action.payload?.non_field_errors?.[0] ||
        action.payload?.detail ||
        "Admin login failed";
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Password reset successful!";
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Password reset failed.";
      });
      
  },
});

export const { logout, clearMessages } =
  userAuthSlice.actions;
export default userAuthSlice.reducer;

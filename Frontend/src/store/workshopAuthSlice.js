import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// Workshop Signup
export const workshopSignup = createAsyncThunk(
    'workshop/signup',
    async (workshopData, thunkAPI) => {
      try {
        const response = await axiosInstance.post('workshop/signup/', workshopData);
        console.log("Signup API Response:", response.data);  // Log the full response
        return response.data;  // Ensure response contains the email
      } catch (error) {
        console.error("Signup API Error:", error.response?.data || error.message);
        return thunkAPI.rejectWithValue(error.response?.data || "Signup failed");      }
    }
  );
  

// Workshop OTP Verification
export const workshopOtpVerification = createAsyncThunk(
  "workshopAuth/workshopOtpVerification",
  async ({ otp, email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("workshop/otp_verification/", { otp, email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP Verification Failed");
    }
  }
);

// Workshop Login
export const workshopLogin = createAsyncThunk(
  "workshopAuth/workshopLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("workshop/login/", credentials);
      return response.data; // Expecting data to include workshop info and email
    } catch (error) {
      console.log("errrrrror", error);
      
      return rejectWithValue(error.response?.data || "Login Failed");
    }
  }
);

export const forgotWorkshopPassword = createAsyncThunk(
  "workshopAuth/forgotWorkshopPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/workshop/forgot-password/", {
        email,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error sending reset link");
    }
  }
);

export const workshopResetPassword = createAsyncThunk(
  "workshopAuth/resetPassword",
  async ({ uidb64, token, password, confirmPassword }, { rejectWithValue }) => {
    console.log("Password:", password, "Confirm Password:", confirmPassword);
    try {
      const response = await axiosInstance.post(
        `/workshop/reset-password/${uidb64}/${token}/`,
        {
          password: password,
          confirm_password: confirmPassword,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to reset workshop password. Try again."
      );
    }
  }
);

const initialState = {
    workshop: (() => {
      const storedWorkshop = localStorage.getItem("workshop");
      try {
        return storedWorkshop ? JSON.parse(storedWorkshop) : null;
      } catch (e) {
        console.error("Failed to parse workshop from localStorage:", e);
        return null;
      }
    })(),
    email: localStorage.getItem("workshopEmail") || null,
    error: null,
    loading: false,
    successMessage: null,
  };
  
const workshopAuthSlice = createSlice({
  name: "workshopAuth",
  initialState,
  reducers: {
    logout: (state) => {
      state.workshop = null;
      state.email = null;
      state.error = null;
      localStorage.removeItem("workshopToken");
      localStorage.removeItem("workshop");
      localStorage.removeItem("workshopEmail");
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(workshopSignup.pending, (state) => {
        state.loading = true;
      })
      .addCase(workshopSignup.fulfilled, (state, action) => {
        state.loading = false;
        state.workshop = null; // No workshop data yet
        state.email = action.payload.email; // Store the email from the response
        state.error = null;
      
        // Save the email to localStorage
        if (action.payload.email) {
          localStorage.setItem("workshopEmail", action.payload.email);
        }
      })
      .addCase(workshopSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
      })
      .addCase(workshopOtpVerification.pending, (state) => {
        state.loading = true;
      })
      .addCase(workshopOtpVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.workshop = action.payload;
        state.error = null;
      })
      .addCase(workshopOtpVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred during OTP verification";
      })
      .addCase(workshopLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(workshopLogin.fulfilled, (state, action) => {        
        state.loading = false;
        state.workshop = action.payload.workshop || null;  // Ensure workshop data is being set
        state.email = action.payload.email || null;  // Ensure email is being set if necessary
        state.error = null;
      
        // Save valid JSON to localStorage
        try {
          if (action.payload.workshop) {
            localStorage.setItem("workshop", JSON.stringify(action.payload.workshop));
          } else {
            localStorage.removeItem("workshop");
          }
      
          // Set both access and refresh tokens for the workshop
          localStorage.setItem("workshopToken", action.payload.access || ""); // Workshop access token
          localStorage.setItem("workshopRefreshToken", action.payload.refresh || ""); // Workshop refresh token
          localStorage.setItem("workshopEmail", action.payload.email || ""); // If email is part of the response
        } catch (error) {
          console.error("Failed to save workshop data to localStorage:", error);
        }
      })
      .addCase(workshopLogin.rejected, (state, action) => {
        console.log("Action payload on rejected:", action.payload);
        state.loading = false;
        // Safely handle backend error response or default error
        state.error =
          action.payload?.error ||
          action.payload?.message || // Check alternative field if backend uses `message`
          "Login failed";
      })
      .addCase(workshopResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(workshopResetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload.message || "Password reset successful!";
        state.error = null;
      })
      .addCase(workshopResetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Workshop password reset failed.";
      });
      
  },
});

export const { logout, clearMessages } = workshopAuthSlice.actions;
export default workshopAuthSlice.reducer;

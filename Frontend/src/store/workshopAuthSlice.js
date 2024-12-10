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
      return rejectWithValue(error.response?.data || "Login Failed");
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
        localStorage.removeItem("workshop"); // Clean up invalid data
        return null;
      }
    })(),
    email: localStorage.getItem("workshopEmail") || null,
    error: null,
    loading: false,
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
        state.workshop = action.payload.workshop || null;
        state.email = action.payload.email || null;
        state.error = null;
      
        // Save valid JSON to localStorage
        try {
          if (action.payload.workshop) {
            localStorage.setItem("workshop", JSON.stringify(action.payload.workshop));
          } else {
            localStorage.removeItem("workshop");
          }
      
          localStorage.setItem("workshopToken", action.payload.token || "");
          localStorage.setItem("workshopEmail", action.payload.email || "");
        } catch (error) {
          console.error("Failed to save workshop data to localStorage:", error);
        }
      })
      .addCase(workshopLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout } = workshopAuthSlice.actions;
export default workshopAuthSlice.reducer;
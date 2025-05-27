  import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Interceptor to add Authorization header dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    // Determine if current user is a workshop or regular user
    const isWorkshop = localStorage.getItem("isWorkshop") === "true";
    
    // Get appropriate token based on user type
    let token;
    if (config.url.includes("/admin_side/")) {
      token = localStorage.getItem("adminToken");
    } else if (isWorkshop) {
      token = localStorage.getItem("workshopToken");
    } else {
      token = localStorage.getItem("token");
    }
    
    // Set Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle refresh token logic for 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is due to unauthorized access and retrying hasn't been attempted yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Determine user type
        const isWorkshop = localStorage.getItem("isWorkshop") === "true";
        const isAdminRequest = originalRequest.url.includes("/admin_side/");
        
        // Select appropriate token and refresh token
        let tokenKey, refreshTokenKey;
        
        if (isAdminRequest) {
          tokenKey = "adminToken";
          refreshTokenKey = "adminRefreshToken";
        } else if (isWorkshop) {
          tokenKey = "workshopToken";
          refreshTokenKey = "workshopRefreshToken";
        } else {
          tokenKey = "token";
          refreshTokenKey = "refreshToken";
        }
        
        const refreshToken = localStorage.getItem(refreshTokenKey);
        
        // If no refresh token exists, log the user out
        if (!refreshToken) {
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(refreshTokenKey);
          window.location.href = "/login"; // Redirect to login page
          return Promise.reject("No refresh token available");
        }
        
        // Call the refresh token endpoint
        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh: refreshToken }
        );
        
        // Get the new access token from the response
        const { access } = response.data;
        
        // Store the new access token in localStorage
        localStorage.setItem(tokenKey, access);
        
        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refreshing fails, log out the user and clear localStorage
        const isWorkshop = localStorage.getItem("isWorkshop") === "true";
        const isAdminRequest = originalRequest.url.includes("/admin_side/");
        
        let tokenKey, refreshTokenKey;
        
        if (isAdminRequest) {
          tokenKey = "adminToken";
          refreshTokenKey = "adminRefreshToken";
        } else if (isWorkshop) {
          tokenKey = "workshopToken";
          refreshTokenKey = "workshopRefreshToken";
        } else {
          tokenKey = "token";
          refreshTokenKey = "refreshToken";
        }
        
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshTokenKey);
        
        // Redirect to login page on authentication failure
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    // If the error is not 401 or retry was already attempted, reject it
    return Promise.reject(error);
  }
);

export default axiosInstance;
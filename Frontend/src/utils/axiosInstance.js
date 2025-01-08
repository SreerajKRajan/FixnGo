import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Interceptor to add Authorization header dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    // Get tokens from localStorage
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("token");
    const workshopToken = localStorage.getItem("workshopToken");

    // Add Authorization header based on the request URL
    if (config.url.includes("/admin_side/") && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`; // Admin token for admin-related requests
    } else if (config.url.includes("/workshop/") && workshopToken) {
      config.headers.Authorization = `Bearer ${workshopToken}`; // Workshop token for workshop-related requests
    } else if (config.url.includes("/users/") && userToken) {
      config.headers.Authorization = `Bearer ${userToken}`; // User token for user-related requests
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle refresh token logic for 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to unauthorized access and retrying hasn't been attempted yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Determine the type of token and refresh token based on the request URL
        const isAdminRequest = originalRequest.url.includes("/admin_side/");
        const isWorkshopRequest = originalRequest.url.includes("/workshop/");
        
        const tokenType = isAdminRequest
          ? "adminToken"
          : isWorkshopRequest
          ? "workshopToken"
          : "token"; // Default token for user requests

        const refreshTokenType = isAdminRequest
          ? "adminRefreshToken"
          : isWorkshopRequest
          ? "workshopRefreshToken"
          : "refreshToken"; // Default refresh token for user requests

        const refreshToken = localStorage.getItem(refreshTokenType);

        // If no refresh token exists, log the user out
        if (!refreshToken) {
          localStorage.removeItem(tokenType);
          localStorage.removeItem(refreshTokenType);
          return Promise.reject("No refresh token, user logged out");
        }

        // Call the refresh token endpoint
        const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh: refreshToken,
        });

        // Get the new access token from the response
        const { access } = response.data;

        // Store the new access token in localStorage
        localStorage.setItem(tokenType, access);

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // If refreshing fails, log out the user and clear localStorage
        const tokenType = originalRequest.url.includes("/admin_side/")
          ? "adminToken"
          : originalRequest.url.includes("/workshop/")
          ? "workshopToken"
          : "token";

        const refreshTokenType = originalRequest.url.includes("/admin_side/")
          ? "adminRefreshToken"
          : originalRequest.url.includes("/workshop/")
          ? "workshopRefreshToken"
          : "refreshToken";

        localStorage.removeItem(tokenType);
        localStorage.removeItem(refreshTokenType);
        return Promise.reject(refreshError);
      }
    }

    // If the error is not 401 or retry was already attempted, reject it
    return Promise.reject(error);
  }
);

export default axiosInstance;

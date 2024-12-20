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
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (config.url.includes("/workshop/") && workshopToken) {
      config.headers.Authorization = `Bearer ${workshopToken}`;
    } else if (config.url.includes("/users/") && userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
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
        // Get the refresh token from localStorage
        const refreshToken = localStorage.getItem("refreshToken");

        // If no refresh token exists, log the user out
        if (!refreshToken) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          localStorage.removeItem("email");
          return Promise.reject("No refresh token, user logged out");
        }

        // Call the refresh token endpoint
        const response = await axiosInstance.post("token/refresh/", {
          refresh: refreshToken,
        });

        // Get the new access token from the response
        const { access } = response.data;

        // Store the new access token in localStorage
        localStorage.setItem("token", access);

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // If refreshing fails, log out the user and clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("email");
        return Promise.reject(refreshError);
      }
    }

    // If the error is not 401 or retry was already attempted, reject it
    return Promise.reject(error);
  }
);

export default axiosInstance;

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

export default axiosInstance;

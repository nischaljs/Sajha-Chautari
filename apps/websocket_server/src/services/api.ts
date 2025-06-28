import axios from "axios";

const baseURL = process.env.HTTP_BASE_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor to add auth headers
api.interceptors.request.use(
  function (config) {
    // Headers will be set by individual requests when needed
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
import axios from "axios"

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Default to localhost for development
  return "http://localhost:5000";
}

const api = axios.create({
  baseURL: getApiUrl(),
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hs_token")
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  console.log("API Request:", config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''), config.data);
  if (config.data) {
    console.log("Request data:", JSON.stringify(config.data, null, 2));
  }
  return config
})

// Response interceptor to handle 401 errors and extract data
api.interceptors.response.use(
  (response) => {
    // Extract data from response if it exists
    return response.data || response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    console.error("Error details:", error);
    
    // Handle network errors
    if (!error.response) {
      console.error("Network error - check if backend is running");
      return Promise.reject(new Error("Network error - check if backend is running"));
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem("hs_token")
      localStorage.removeItem("hs_user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:5173/api"
    : "https://chat-app-e2ee.onrender.com/api",
  withCredentials: true,
});

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://student-backend-bx45.onrender.com",
});

export default API;
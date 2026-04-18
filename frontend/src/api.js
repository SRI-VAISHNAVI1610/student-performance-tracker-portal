import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://student-backend-bx45.onrender.com";

const API = axios.create({
  baseURL: BASE_URL,
});

console.log("API BASE URL:", BASE_URL); // debug

export default API;
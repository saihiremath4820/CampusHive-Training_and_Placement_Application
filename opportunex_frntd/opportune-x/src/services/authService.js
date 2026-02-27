import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: { "Content-Type": "application/json" }
});

/* 🔐 Attach token automatically (if present) */
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/*  AUTH APIs  */
export const registerUser = (payload) => {
  // payload must include: name, email, password, role, collegeId
  return API.post("/auth/register", payload);
};

export const loginUser = (payload) => {
  // payload must include: email, password, collegeId
  return API.post("/auth/login", payload);
};

export const getPublicSettings = () => {
  return API.get("/auth/settings");
};

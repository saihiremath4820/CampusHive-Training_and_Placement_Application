import api from "./api";

/*  AUTH APIs  */
export const registerUser = (payload) => {
  // payload must include: name, email, password, role, collegeId
  return api.post("/auth/register", payload);
};

export const loginUser = (payload) => {
  // payload must include: email, password, collegeId
  return api.post("/auth/login", payload);
};

export const getPublicSettings = () => {
  return api.get("/auth/settings");
};

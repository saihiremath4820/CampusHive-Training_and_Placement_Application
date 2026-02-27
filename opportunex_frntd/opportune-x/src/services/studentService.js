import api from "./api";

// Get logged-in student's profile
export const getStudentProfile = () => {
  return api.get("/student/profile");
};

// Create or update profile
export const saveStudentProfile = (profileData) => {
  return api.put("/student/profile", profileData);
};

// Get student's applications
export const getStudentApplications = () => {
  return api.get("/application/student");
};

// Apply to an opportunity
export const applyToOpportunity = (opportunityId) => {
  return api.post("/application", { opportunityId });
};

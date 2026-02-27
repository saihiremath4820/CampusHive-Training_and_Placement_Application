import api from "./api";

// ===============================
// GET OPPORTUNITIES FOR STUDENT (WITH FIT %)
// ===============================
export const getStudentOpportunities = async () => {
  return api.get("/opportunity/student");
};

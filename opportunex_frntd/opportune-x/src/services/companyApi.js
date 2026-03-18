import api from "./api";

/* =====================
   OPPORTUNITY ROUTES
   ===================== */

// GET all opportunities for the logged-in company
export const getOpportunities = () => api.get("/opportunity");
export const getCompanyOpportunities = getOpportunities;

// CREATE opportunity
export const createOpportunity = (data) => api.post("/opportunity", data);

// EDIT opportunity (resets approval)
export const updateOpportunity = (id, data) => api.put(`/opportunity/${id}`, data);

// DELETE opportunity
export const deleteOpportunity = (id) => api.delete(`/opportunity/${id}`);

// CLOSE opportunity
export const closeOpportunity = (id) => api.put(`/opportunity/${id}/close`);

// Analytics
export const getCompanyAnalytics = () => api.get("/opportunity/analytics");

/* =====================
   APPLICATION ROUTES
   ===================== */

// ✅ FIXED: Correct URL for fetching applicants per opportunity
export const getApplicants = (opportunityId) =>
  api.get(`/application/opportunity/${opportunityId}`);

// Update applicant status (shortlist / select / reject)
export const updateApplicantStatus = (applicationId, newStatus) =>
  api.put("/application/status", { applicationId, newStatus });

// New real-time dashboard endpoints
export const getApplicationStats = () => api.get("/company/stats");
export const getDeadlineAlerts = () => api.get("/company/deadline-alerts");
export const getRecentActivity = () => api.get("/company/recent-activity");
export const getDashboardStats = () => api.get("/company/dashboard-stats");
export const getPublicCompanyProfile = (id) => api.get(`/company/public/${id}`);

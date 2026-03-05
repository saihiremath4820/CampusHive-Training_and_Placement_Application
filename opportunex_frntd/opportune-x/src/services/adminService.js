import api from "./api";

/* =======================
   DASHBOARD / COUNTS
======================= */
export const getCounts = () => api.get("/admin/counts");
export const getPendingCounts = () => api.get("/admin/pending-counts");

/* =======================
   APPROVALS – FACULTY
======================= */
export const getPendingFaculty = () => api.get("/admin/pending-faculty");
export const approveFaculty = (id) => api.post(`/admin/approve-faculty/${id}`);
export const rejectFaculty = (id) => api.post(`/admin/reject-faculty/${id}`);

/* =======================
   APPROVALS – COMPANIES
======================= */
export const getPendingCompanies = () => api.get("/admin/pending-companies");
export const approveCompany = (id) => api.post(`/admin/approve-company/${id}`);
export const rejectCompany = (id) => api.post(`/admin/reject-company/${id}`);

/* =======================
   APPROVALS – DRIVES
======================= */
export const getPendingDrives = () => api.get("/admin/pending-drives");
export const approveDrive = (id) => api.post(`/admin/approve-drive/${id}`);
export const rejectDrive = (id, reason) => api.post(`/admin/reject-drive/${id}`, { reason });

/* =======================
   OPPORTUNITIES (Admin)
======================= */
export const getAllOpportunities = () => api.get("/admin/opportunities");
export const disableOpportunity = (id) => api.post(`/admin/disable-opportunity/${id}`);

/* =======================
   APPLICATIONS (Admin)
======================= */
export const getAllApplications = () => api.get("/admin/applications");

/* =======================
   USERS
======================= */
export const createUser = (data) => api.post("/admin/users", data);
export const getAllUsers = () => api.get("/admin/users");
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const deactivateUser = (id) => api.post(`/admin/deactivate/${id}`);
export const reactivateUser = (id) => api.post(`/admin/reactivate/${id}`);

import api from "./api";

/* ================= OVERVIEW ================= */
export const getPlacementOverview = () =>
  api.get("/admin/placement/overview");

export const upsertPlacementOverview = (data) =>
  api.post("/admin/placement/overview", data);

/* ================= OBJECTIVES ================= */
export const getPlacementObjectives = () =>
  api.get("/admin/placement/objectives");

export const addPlacementObjective = (data) =>
  api.post("/admin/placement/objectives", data);

export const deletePlacementObjective = (id) =>
  api.delete(`/admin/placement/objectives/${id}`);

export const updatePlacementObjective = (id, data) =>
  api.put(`/admin/placement/objectives/${id}`, data);

/* ================= PROCESS ================= */
export const getPlacementProcess = () =>
  api.get("/admin/placement/process");

export const upsertPlacementProcess = (data) =>
  api.post("/admin/placement/process", data);

export const deletePlacementProcess = (id) =>
  api.delete(`/admin/placement/process/${id}`);

/* ================= STATS ================= */
export const getPlacementStats = () =>
  api.get("/admin/placement/stats");

export const upsertPlacementStat = (data) =>
  api.post("/admin/placement/stats", data);

export const deletePlacementStat = (id) =>
  api.delete(`/admin/placement/stats/${id}`);

/* ================= TRAININGS ================= */
export const getTrainingActivities = () =>
  api.get("/admin/placement/trainings");

export const addTrainingActivity = (data) =>
  api.post("/admin/placement/trainings", data);

export const deleteTraining = (id) =>
  api.delete(`/admin/placement/trainings/${id}`);


export const updateTrainingActivity = (id, data) =>
  api.put(`/admin/placement/trainings/${id}`, data);

/* ================= REPORTS ================= */
export const getPlacementReports = () =>
  api.get("/admin/placement/reports");

export const addPlacementReport = (data) =>
  api.post("/admin/placement/reports", data);

export const deletePlacementReport = (id) =>
  api.delete(`/admin/placement/reports/${id}`);


export const updatePlacementReport = (id, data) =>
  api.put(`/admin/placement/reports/${id}`, data);

/* ================= RECRUITERS ================= */
export const getRecruiters = () =>
  api.get("/admin/placement/recruiters");

export const addRecruiter = (data) =>
  api.post("/admin/placement/recruiters", {
    companyName: data.companyName,
    role: data.role,
    package: data.package,
    description: data.description || "",
  });

export const deleteRecruiter = (id) =>
  api.delete(`/admin/placement/recruiters/${id}`);


export const updateRecruiter = (id, data) =>
  api.put(`/admin/placement/recruiters/${id}`, {
    companyName: data.companyName,
    role: data.role,
    package: data.package,
    description: data.description || "",
  });

/* ================= COLLABORATIONS ================= */
export const getIndustryCollaborations = () =>
  api.get("/admin/placement/collaborations");

export const addIndustryCollaboration = (data) =>
  api.post("/admin/placement/collaborations", data);

export const deleteIndustryCollaboration = (id) =>
  api.delete(`/admin/placement/collaborations/${id}`);


export const updateIndustryCollaboration = (id, data) =>
  api.put(`/admin/placement/collaborations/${id}`, {
    organization: data.organization,
    type: data.type,
    description: data.description || "",
  });

/* ================= TPO CONTACTS ================= */
export const getTpoContacts = () =>
  api.get("/admin/placement/contacts");

export const addTpoContact = (data) =>
  api.post("/admin/placement/contacts", {
    name: data.name,
    role: data.role || data.designation,
    email: data.email,
    phone: data.phone,
  });

export const deleteTpoContact = (id) =>
  api.delete(`/admin/placement/contacts/${id}`);


export const updateTpoContact = (id, data) =>
  api.put(`/admin/placement/contacts/${id}`, {
    name: data.name,
    role: data.designation || data.role,
    email: data.email,
    phone: data.phone,
  });
const express = require("express");
const { verifyToken, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/adminPlacementController");
const upload = require("../config/multer");

const router = express.Router();

/* ================= MIDDLEWARE ================= */
router.use(verifyToken);

// Helper for restricted admin actions
const adminOnly = authorize(["admin"]);
const allRoles = authorize(["admin", "student", "faculty", "company"]);

/* ================= OVERVIEW ================= */
router.get("/overview", allRoles, ctrl.getOverview);
router.post("/overview", adminOnly, ctrl.upsertOverview);

/* ================= OBJECTIVES ================= */
router.get("/objectives", allRoles, ctrl.getObjectives);
router.post("/objectives", adminOnly, ctrl.addObjective);
router.delete("/objectives/:id", adminOnly, ctrl.deleteObjective);

/* ================= PROCESS ================= */
router.get("/process", allRoles, ctrl.getProcess);
router.post("/process", adminOnly, ctrl.upsertProcess);
router.delete("/process/:id", adminOnly, ctrl.deleteProcess);

/* ================= STATS ================= */
router.get("/stats", allRoles, ctrl.getStats);
router.post("/stats", adminOnly, ctrl.upsertStat);
router.delete("/stats/:id", adminOnly, ctrl.deleteStat);

/* ================= TRAININGS ================= */
router.get("/trainings", allRoles, ctrl.getTrainings);
router.post("/trainings", adminOnly, ctrl.addTraining);
router.delete("/trainings/:id", adminOnly, ctrl.deleteTraining);
router.put("/trainings/:id", adminOnly, ctrl.updateTraining);

/* ================= REPORTS ================= */
router.get("/reports", allRoles, ctrl.getReports);
router.post("/reports", adminOnly, upload.single('reportFile'), ctrl.addReport);
router.put("/reports/:id", adminOnly, ctrl.updateReport);
router.delete("/reports/:id", adminOnly, ctrl.deleteReport);

/* ================= RECRUITERS ================= */
router.get("/recruiters", allRoles, ctrl.getRecruiters);
router.post("/recruiters", adminOnly, ctrl.addRecruiter);
router.put("/recruiters/:id", adminOnly, ctrl.updateRecruiter);
router.delete("/recruiters/:id", adminOnly, ctrl.deleteRecruiter);

/* ================= COLLABORATIONS ================= */
router.get("/collaborations", allRoles, ctrl.getCollaborations);
router.post("/collaborations", adminOnly, ctrl.addCollaboration);
router.put("/collaborations/:id", adminOnly, ctrl.updateCollaboration);
router.delete("/collaborations/:id", adminOnly, ctrl.deleteCollaboration);

/* ================= TPO CONTACTS ================= */
router.get("/contacts", allRoles, ctrl.getContacts);
router.post("/contacts", adminOnly, ctrl.addContact);
router.put("/contacts/:id", adminOnly, ctrl.updateContact);
router.delete("/contacts/:id", adminOnly, ctrl.deleteContact);

module.exports = router;
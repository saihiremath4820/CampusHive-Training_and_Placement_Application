const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, authorize } = require("../middleware/auth");

// 🔒 All Admin Routes require token + admin role
router.use(verifyToken, authorize(["admin"]));

/* ================= COMPANY APPROVALS ================= */
router.get("/pending-companies", adminController.getPendingCompanies);
router.post("/approve-company/:id", adminController.approveCompany);
router.post("/reject-company/:id", adminController.rejectCompany);

/* ================= FACULTY APPROVALS ================= */
router.get("/pending-faculty", adminController.getPendingFaculty);
router.post("/approve-faculty/:id", adminController.approveFaculty);
router.post("/reject-faculty/:id", adminController.rejectFaculty);

/* ================= DRIVE APPROVALS ================= */
router.get("/pending-drives", adminController.getPendingDrives);
router.post("/approve-drive/:id", adminController.approveDrive);
router.post("/reject-drive/:id", adminController.rejectDrive);

/* ================= OPPORTUNITIES ================= */
router.get("/opportunities", adminController.getAllOpportunities);
router.post("/disable-opportunity/:id", adminController.disableOpportunity);

/* ================= DASHBOARD ================= */
router.get("/counts", adminController.getCounts);
router.get("/pending-counts", adminController.getPendingCounts);

/* ================= APPLICATIONS ================= */
router.get("/applications", adminController.getAllApplications);

/* ================= USERS ================= */
router.get("/users", adminController.getAllUsers);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.post("/deactivate/:id", adminController.deactivateUser);
router.post("/reactivate/:id", adminController.reactivateUser);

/* ================= SETTINGS ================= */
router.get("/settings", adminController.getSettings);
router.post("/settings", adminController.updateSettings);

module.exports = router;

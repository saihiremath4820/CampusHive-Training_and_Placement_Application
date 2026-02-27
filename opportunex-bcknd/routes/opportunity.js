const express = require("express");
const {
  createOpportunity,
  getAllOpportunities,
  updateOpportunity,
  closeOpportunity,
  deleteOpportunity,
  getCompanyAnalytics,
  getStudentOpportunities
} = require("../controllers/opportunityController");
const { verifyToken, authorize } = require("../middleware/auth");

const router = express.Router();

// Create (company/faculty only, pending-company block enforced in controller)
router.post("/", verifyToken, authorize(["faculty", "company"]), createOpportunity);

// Get all (scoped by role in controller)
router.get("/", verifyToken, getAllOpportunities);

// Student-filtered feed (approved + active only)
router.get("/student", verifyToken, authorize(["student"]), getStudentOpportunities);

// Analytics
router.get("/analytics", verifyToken, authorize(["company"]), getCompanyAnalytics);

// Edit (company only, resets approval)
router.put("/:id", verifyToken, authorize(["faculty", "company"]), updateOpportunity);

// Close
router.put("/:id/close", verifyToken, authorize(["faculty", "company"]), closeOpportunity);

// Delete
router.delete("/:id", verifyToken, authorize(["faculty", "company", "admin"]), deleteOpportunity);

module.exports = router;

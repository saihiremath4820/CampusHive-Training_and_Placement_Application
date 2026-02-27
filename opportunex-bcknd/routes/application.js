const express = require("express");
const Application = require("../models/Application");
const { verifyToken, authorize } = require("../middleware/auth");

const {
  applyToOpportunity,
  updateApplicationStatus,
  getApplicationsByOpportunity,
  getStudentApplications
} = require("../controllers/applicationController");

const router = express.Router();

router.post("/", verifyToken, authorize(["student"]), applyToOpportunity);
router.get("/student", verifyToken, authorize(["student"]), getStudentApplications);
router.get("/opportunity/:opportunityId", verifyToken, authorize(["faculty", "company", "admin"]), getApplicationsByOpportunity);
router.put("/status", verifyToken, authorize(["faculty", "company"]), updateApplicationStatus);

module.exports = router;

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

const Joi = require('joi');
const validate = require('../middleware/validate');

const createOpportunitySchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string().valid('Internship', 'Full-Time', 'Project', 'Contract').required(),
  deadline: Joi.date().greater('now').required(),
  eligibility: Joi.string().optional(),  // Mongoose is returning String for eligibility
  skills: Joi.array().items(Joi.string()).optional(),
  salary: Joi.string().optional(),
  location: Joi.string().optional(),
});

// Create (company/faculty only, pending-company block enforced in controller)
router.post("/", verifyToken, authorize(["faculty", "company"]), validate(createOpportunitySchema), createOpportunity);

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

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

const Joi = require('joi');
const validate = require('../middleware/validate');

const applySchema = Joi.object({
  opportunityId: Joi.string().required(),
  github: Joi.string().uri().optional().allow(''),
  linkedin: Joi.string().uri().optional().allow(''),
  sop: Joi.string().max(1000).optional().allow(''),
});

router.post("/", verifyToken, authorize(["student"]), validate(applySchema), applyToOpportunity);
router.get("/student", verifyToken, authorize(["student"]), getStudentApplications);
router.get("/opportunity/:opportunityId", verifyToken, authorize(["faculty", "company", "admin"]), getApplicationsByOpportunity);
router.put("/status", verifyToken, authorize(["faculty", "company"]), updateApplicationStatus);

module.exports = router;

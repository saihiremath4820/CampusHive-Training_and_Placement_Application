const express = require("express");
const { verifyToken, authorize } = require("../middleware/auth");
const {
    createProject,
    getCollegeProjects,
    getMyProjects,
    applyToProject,
    getFacultyApplications,
    updateProjectApplicationStatus,
    deleteProject
} = require("../controllers/projectController");

const router = express.Router();

const Joi = require('joi');
const validate = require('../middleware/validate');

const createProjectSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  domain: Joi.string().required(),
  duration: Joi.string().required(),
  maxStudents: Joi.number().min(1).max(20).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  milestones: Joi.array().optional(),
});

router.post("/", verifyToken, authorize(["faculty"]), validate(createProjectSchema), createProject);
router.get("/", verifyToken, getCollegeProjects);
router.get("/my", verifyToken, authorize(["faculty"]), getMyProjects);
router.delete("/:id", verifyToken, authorize(["faculty"]), deleteProject);

// Application routes
router.post("/apply", verifyToken, authorize(["student"]), applyToProject);
router.get("/applications", verifyToken, authorize(["faculty"]), getFacultyApplications);
router.put("/application/status", verifyToken, authorize(["faculty"]), updateProjectApplicationStatus);

module.exports = router;

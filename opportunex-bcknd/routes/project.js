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

router.post("/", verifyToken, authorize(["faculty"]), createProject);
router.get("/", verifyToken, getCollegeProjects);
router.get("/my", verifyToken, authorize(["faculty"]), getMyProjects);
router.delete("/:id", verifyToken, authorize(["faculty"]), deleteProject);

// Application routes
router.post("/apply", verifyToken, authorize(["student"]), applyToProject);
router.get("/applications", verifyToken, authorize(["faculty"]), getFacultyApplications);
router.put("/application/status", verifyToken, authorize(["faculty"]), updateProjectApplicationStatus);

module.exports = router;

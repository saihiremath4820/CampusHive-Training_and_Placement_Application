const express = require("express");
const { verifyToken, authorize } = require("../middleware/auth");
const { createTeam, getMyTeams, getApprovedStudentsForProject, evaluateTeam, getStudentTeams } = require("../controllers/teamController");

const router = express.Router();

router.post("/", verifyToken, authorize(["faculty"]), createTeam);
router.get("/", verifyToken, authorize(["faculty"]), getMyTeams);
router.get("/project/:projectId/available", verifyToken, authorize(["faculty"]), getApprovedStudentsForProject);
router.post("/evaluate", verifyToken, authorize(["faculty"]), evaluateTeam);
router.get("/student", verifyToken, authorize(["student"]), getStudentTeams);

module.exports = router;

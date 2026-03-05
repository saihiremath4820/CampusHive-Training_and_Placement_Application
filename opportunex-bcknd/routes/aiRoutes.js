const express = require("express");
const router = express.Router();
const { verifyToken, authorize } = require("../middleware/auth");

const { getFitScore, getAtsScore, getSkillMatch, companyATSScore, facultyATSScore } = require("../controllers/aiController");

// All AI routes require a valid token
router.use(verifyToken);

router.post("/fit-score", getFitScore);
router.post("/ats-score", getAtsScore);
router.post("/skill-match", getSkillMatch);

// ATS scoring for company and faculty recruiters
router.post("/company-ats-score", authorize(["company", "admin"]), companyATSScore);
router.post("/faculty-ats-score", authorize(["faculty", "admin"]), facultyATSScore);

module.exports = router;


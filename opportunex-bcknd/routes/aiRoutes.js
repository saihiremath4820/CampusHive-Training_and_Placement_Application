const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

const { getFitScore, getAtsScore, getSkillMatch } = require("../controllers/aiController");

// All AI routes require a valid token
router.use(verifyToken);

router.post("/fit-score", getFitScore);
router.post("/ats-score", getAtsScore);
router.post("/skill-match", getSkillMatch);

module.exports = router;

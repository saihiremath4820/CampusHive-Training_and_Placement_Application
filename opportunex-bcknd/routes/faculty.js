const express = require("express");
const { verifyToken, authorize } = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/facultyController");

const router = express.Router();

router.get("/profile", verifyToken, authorize(["faculty"]), getProfile);
router.put("/profile", verifyToken, authorize(["faculty"]), updateProfile);

module.exports = router;

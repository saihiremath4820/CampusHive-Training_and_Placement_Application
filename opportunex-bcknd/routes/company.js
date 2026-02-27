const express = require("express");
const { verifyToken, authorize } = require("../middleware/auth");
const { getProfile, updateProfile, getAnalytics } = require("../controllers/companyController");

const router = express.Router();

router.get("/profile", verifyToken, authorize(["company"]), getProfile);
router.put("/profile", verifyToken, authorize(["company"]), updateProfile);
router.get("/analytics", verifyToken, authorize(["company"]), getAnalytics);

module.exports = router;

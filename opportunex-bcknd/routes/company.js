const express = require("express");
const { verifyToken, authorize } = require("../middleware/auth");
const {
    getProfile, updateProfile, getAnalytics,
    getApplicationStats, getDeadlineAlerts, getRecentActivity, getDashboardStats,
    getPublicCompanyProfile
} = require("../controllers/companyController");

const router = express.Router();

// Public route - accessible to all logged in users
router.get("/public/:id", verifyToken, getPublicCompanyProfile);

router.get("/profile", verifyToken, authorize(["company"]), getProfile);
router.put("/profile", verifyToken, authorize(["company"]), updateProfile);
router.get("/analytics", verifyToken, authorize(["company"]), getAnalytics);
router.get("/stats", verifyToken, authorize(["company"]), getApplicationStats);
router.get("/deadline-alerts", verifyToken, authorize(["company"]), getDeadlineAlerts);
router.get("/recent-activity", verifyToken, authorize(["company"]), getRecentActivity);
router.get("/dashboard-stats", verifyToken, authorize(["company"]), getDashboardStats);

module.exports = router;

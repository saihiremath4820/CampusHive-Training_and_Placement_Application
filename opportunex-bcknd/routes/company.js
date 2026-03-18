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

const Joi = require('joi');
const validate = require('../middleware/validate');

const companyProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  industry: Joi.string().required(),
  location: Joi.string().optional(),
  about: Joi.string().max(500).optional(),
  website: Joi.string().uri().optional().allow(''),
});

router.get("/profile", verifyToken, authorize(["company"]), getProfile);
router.post("/profile", verifyToken, authorize(["company"]), validate(companyProfileSchema), updateProfile);
router.put("/profile", verifyToken, authorize(["company"]), validate(companyProfileSchema), updateProfile);
router.get("/analytics", verifyToken, authorize(["company"]), getAnalytics);
router.get("/stats", verifyToken, authorize(["company"]), getApplicationStats);
router.get("/deadline-alerts", verifyToken, authorize(["company"]), getDeadlineAlerts);
router.get("/recent-activity", verifyToken, authorize(["company"]), getRecentActivity);
router.get("/dashboard-stats", verifyToken, authorize(["company"]), getDashboardStats);

module.exports = router;

const express = require("express");
const { verifyToken, authorize } = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/facultyController");

const router = express.Router();

const Joi = require('joi');
const validate = require('../middleware/validate');

const facultyProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  department: Joi.string().optional(),
  position: Joi.string().optional(),
  phone: Joi.string().optional().allow(''),
});

router.get("/profile", verifyToken, authorize(["faculty"]), getProfile);
router.put("/profile", verifyToken, authorize(["faculty"]), validate(facultyProfileSchema), updateProfile);

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

/* ===== HELPER ===== */
const toObjectId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return null;
  }
  return new mongoose.Types.ObjectId(id);
};

const Joi = require("joi");

/* ================= VALIDATION SCHEMAS ================= */
const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("student", "company", "faculty", "admin").optional(),
  collegeId: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  collegeId: Joi.string().required()
});

/* ================= PUBLIC SETTINGS ================= */
router.get("/settings", async (req, res) => {
  try {
    const Setting = require("../models/Setting");
    let settings = await Setting.findOne();
    if (!settings) settings = {};

    return res.json({
      studentRegistration: settings.studentRegistration !== false,
      companyRegistration: settings.companyRegistration !== false,
      facultyRegistration: settings.facultyRegistration !== false,
      placementEnabled: settings.placementEnabled !== false,
      trainingEnabled: settings.trainingEnabled !== false,
      recruitersVisible: settings.recruitersVisible !== false,
      showAnalytics: settings.showAnalytics !== false,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Register request received:", req.body);

    // 🛡️ Validate Input
    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.log("❌ Validation error:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, role, collegeId } = req.body;

    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be self-registered." });
    }

    if (role === "faculty") {
      return res.status(403).json({ message: "Faculty accounts are created by admin only. Please contact your institution." });
    }

    const Setting = require("../models/Setting");
    const settings = await Setting.findOne() || {};

    if (role === "student" && settings.studentRegistration === false) {
      return res.status(403).json({ message: "Student registration is currently disabled." });
    }
    if (role === "company" && settings.companyRegistration === false) {
      return res.status(403).json({ message: "Company registration is currently disabled." });
    }
    if (role === "faculty" && settings.facultyRegistration === false) {
      return res.status(403).json({ message: "Faculty registration is currently disabled." });
    }


    const existing = await User.findOne({
      email: email.toLowerCase(),
      collegeId: collegeId,
    });

    if (existing) {
      console.log("❌ User already exists");
      return res.status(400).json({ message: "Email already registered for this college" });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log("🔑 Password hashed");

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "student",
      collegeId: collegeId,
      status: role === "company" || role === "faculty" ? "pending" : "approved",
    });
    console.log("👤 User created:", user._id);

    // Auto-create basic StudentProfile if role is student
    if (user.role === "student") {
      try {
        const StudentProfile = require("../models/StudentProfile");
        await StudentProfile.create({
          userId: user._id,
          fullName: name || "",
          email: email.toLowerCase()
        });
        console.log("🎓 Student profile created");
      } catch (profileErr) {
        console.error("⚠️ Failed to create student profile:", profileErr);
        // Profile creation failed — clean up the user and return an error
        await require("../models/User").findByIdAndDelete(user._id);
        return res.status(500).json({ message: "Registration failed: could not create student profile. Please try again." });
      }
    }

    if (user.status === "pending") {
      return res.status(201).json({
        message: "Registration successful. Please wait for admin approval.",
        role: user.role,
        collegeId: user.collegeId,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, collegeId: user.collegeId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registered successfully",
      token,
      role: user.role,
      collegeId: user.collegeId,
    });
  } catch (err) {
    console.error("🔥 Register CRITICAL error:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    // 🛡️ Validate Input
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password, collegeId } = req.body;
    if (!email || !password || !collegeId) {
      return res
        .status(400)
        .json({ message: "Email, password and collegeId required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      collegeId: collegeId,
    });

    if (!user) {
      return res.status(400).json({ message: "No account found with this email for the selected institution." });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Your company registration is pending admin approval. You will be notified once approved."
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        message: "Your company registration was rejected. Please contact admin."
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password. Please try again." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, collegeId: user.collegeId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      role: user.role,
      collegeId: user.collegeId,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, collegeId } = req.body;

    if (!email || !collegeId) {
      return res
        .status(400)
        .json({ message: "Email and collegeId required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      collegeId: collegeId,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // 📧 Send the reset email
    try {
      const { sendPasswordResetEmail } = require("../config/mailer");
      await sendPasswordResetEmail(user.email, resetLink);
      console.log(`✅ Password reset email sent to: ${user.email}`);
    } catch (emailErr) {
      console.error("❌ Failed to send reset email:", emailErr);
      // Invalidate the token so a stale token doesn't linger
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({
        message: "Failed to send reset email. Please check your email configuration or try again later.",
      });
    }

    return res.json({ message: "Password reset email sent. Please check your inbox." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

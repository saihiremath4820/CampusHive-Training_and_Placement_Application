const StudentProfile = require("../models/StudentProfile");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

/* ---------------- PROXY TO AI ENGINE (ATS SCORE) ---------------- */
exports.getAtsScore = async (req, res) => {
  try {
    const { role } = req.body;
    const { id: userId, collegeId } = req.user;

    console.log(`🤖 AI Request [ATS]: College ${collegeId}, User ${userId}, Role ${role}`);

    // ✅ 🛡️ 1. NULL SAFETY: Force fetch profile from database
    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    if (!profile.resumePath) {
      return res.status(400).json({
        message: "No resume found. Please upload your resume first."
      });
    }

    // ✅ 🛡️ 2. ENTERPRISE SANDBOXING (Mathematical Isolation)
    const rawPath = profile.resumePath;
    const baseDir = path.resolve("uploads/resumes"); // The jail/sandbox
    const targetFile = path.resolve(rawPath);        // The requested file

    // path.relative(base, target) returns path from 'base' to 'target'
    // If target is outside base, the result will start with '..'
    const relativePart = path.relative(baseDir, targetFile);

    const isOutsideSandbox = relativePart.startsWith('..') || path.isAbsolute(relativePart);

    if (isOutsideSandbox) {
      console.error(`🚨 SECURITY BREACH PROTECTED: User ${userId} attempted to access ${targetFile}`);
      return res.status(403).json({ message: "Security violation: Invalid file access" });
    }

    // ✅ 🛡️ 3. FILE EXISTENCE VERIFICATION
    if (!fs.existsSync(targetFile)) {
      console.warn(`⚠️ File missing in system: ${relativePart}`);
      return res.status(404).json({ message: "The uploaded resume file could not be found on the server." });
    }

    // ✅ 🛡️ 4. SECURE PROXY CALL
    const response = await axios.post(`${process.env.AI_ENGINE_URL}/analyze-resume`, {
      filePath: targetFile,
      role: role || "ml",
      collegeId,
      userId
    });

    res.json(response.data);
  } catch (error) {
    console.error("ATS Score Proxy Error:", error.message);
    res.status(500).json({
      atsScore: 0,
      error: "AI Engine unavailable",
      suggestions: ["System unable to reach AI analysis engine. Please try again later."]
    });
  }
};

/* ---------------- PROXY TO AI ENGINE (SKILL MATCH) ---------------- */
exports.getSkillMatch = async (req, res) => {
  try {
    const { student, project } = req.body;
    const { collegeId } = req.user;

    console.log(`🤖 AI Request [MATCH]: College ${collegeId}`);

    const response = await axios.post(`${process.env.AI_ENGINE_URL}/match-skills`, {
      student,
      project,
      collegeId
    });

    res.json(response.data);
  } catch (error) {
    console.error("Skill Match Proxy Error:", error.message);
    res.json({ matchScore: 0, error: "AI Engine unavailable" });
  }
};

// Keep for backward compatibility if needed, or remove later
exports.getFitScore = exports.getSkillMatch;

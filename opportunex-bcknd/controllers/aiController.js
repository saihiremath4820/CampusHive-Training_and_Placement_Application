const StudentProfile = require("../models/StudentProfile");
const Opportunity = require("../models/Opportunity");
const Project = require("../models/Project");
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

/* ---------------- COMPANY ATS SCORE ---------------- */
exports.companyATSScore = async (req, res) => {
  try {
    const { studentId, opportunityId } = req.body;

    if (!studentId || !opportunityId) {
      return res.status(400).json({ message: "studentId and opportunityId are required" });
    }

    // Fetch student profile
    const studentProfile = await StudentProfile.findOne({ userId: studentId })
      .select("resumePath skills branch year cgpa");

    if (!studentProfile?.resumePath) {
      return res.status(404).json({ message: "Student has not uploaded a resume yet" });
    }

    // Fetch opportunity
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Build resume path — support both Cloudinary URLs and local files
    let resumePath = studentProfile.resumePath;
    if (!resumePath.startsWith("http://") && !resumePath.startsWith("https://")) {
      resumePath = path.resolve(resumePath);
      if (!fs.existsSync(resumePath)) {
        return res.status(404).json({ message: "Resume file not found on server" });
      }
    }

    console.log(`🤖 Company ATS: student=${studentId}, opp=${opportunityId}`);

    // Call AI engine
    const aiResponse = await axios.post(
      `${process.env.AI_ENGINE_URL}/company-ats-score`,
      {
        resumePath,
        studentProfile: {
          skills: studentProfile.skills || [],
          branch: studentProfile.branch || "",
          year: studentProfile.year || "",
          cgpa: studentProfile.cgpa || 0
        },
        opportunity: {
          title: opportunity.title,
          description: opportunity.description || "",
          requiredSkills: opportunity.requiredSkills || [],
          requiredCGPA: opportunity.requiredCGPA || 0,
          requiredDegree: opportunity.requiredDegree || "",
          type: opportunity.type || ""
        }
      },
      { timeout: 60000 }
    );

    res.json(aiResponse.data);
  } catch (err) {
    const isConnRefused = err.code === "ECONNREFUSED";
    const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");
    console.error("Company ATS error:", err.message);
    res.status(500).json({
      message: isConnRefused
        ? "AI engine is offline. Please ensure the AI engine is running."
        : isTimeout
          ? "AI analysis timed out. Please retry."
          : `ATS analysis failed: ${err.response?.data?.error || err.message}`
    });
  }
};

/* ---------------- FACULTY ATS SCORE ---------------- */
exports.facultyATSScore = async (req, res) => {
  try {
    const { studentId, projectId } = req.body;

    if (!studentId || !projectId) {
      return res.status(400).json({ message: "studentId and projectId are required" });
    }

    // Fetch student profile
    const studentProfile = await StudentProfile.findOne({ userId: studentId })
      .select("resumePath skills branch year cgpa");

    if (!studentProfile?.resumePath) {
      return res.status(404).json({ message: "Student has not uploaded a resume yet" });
    }

    // Fetch project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Build resume path — support both Cloudinary URLs and local files
    let resumePath = studentProfile.resumePath;
    if (!resumePath.startsWith("http://") && !resumePath.startsWith("https://")) {
      resumePath = path.resolve(resumePath);
      if (!fs.existsSync(resumePath)) {
        return res.status(404).json({ message: "Resume file not found on server" });
      }
    }

    console.log(`🤖 Faculty ATS: student=${studentId}, project=${projectId}`);

    // Call AI engine
    const aiResponse = await axios.post(
      `${process.env.AI_ENGINE_URL}/faculty-ats-score`,
      {
        resumePath,
        studentProfile: {
          skills: studentProfile.skills || [],
          branch: studentProfile.branch || "",
          year: studentProfile.year || "",
          cgpa: studentProfile.cgpa || 0
        },
        project: {
          title: project.title,
          description: project.description || "",
          domain: project.domain || ""
        }
      },
      { timeout: 60000 }
    );

    res.json(aiResponse.data);
  } catch (err) {
    const isConnRefused = err.code === "ECONNREFUSED";
    const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");
    console.error("Faculty ATS error:", err.message);
    res.status(500).json({
      message: isConnRefused
        ? "AI engine is offline. Please ensure the AI engine is running."
        : isTimeout
          ? "AI analysis timed out. Please retry."
          : `ATS analysis failed: ${err.response?.data?.error || err.message}`
    });
  }
};


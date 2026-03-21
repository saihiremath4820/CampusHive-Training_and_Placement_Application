import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { analyzeResume, analyzeResumeForJob, analyzeResumeForProject } from "./engine.js";
import { runAIEngine } from "./engine.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

// 🔐 Startup Security Guards
const requiredEnvVars = ['GROQ_API_KEY'];
requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    console.error(`   Add it to ai-engine/.env`);
    process.exit(1);
  }
});
console.log('✅ All required env vars present');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5000',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.json({ status: "AI Engine running", port: process.env.PORT || 5001 });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "AI Engine is running", port: process.env.PORT || 5001 });
});

/* ---------------- ANALYZE RESUME ---------------- */
app.post("/analyze-resume", async (req, res) => {
  try {
    // ✅ Now accepts studentProfile and role from the backend controller
    const { filePath, role, studentProfile, studentSkills } = req.body;

    console.log("📥 AI REQUEST RECEIVED");
    console.log("🎯 Role:", role || "software-engineer");
    console.log("👤 Student skills from profile:", studentSkills || studentProfile?.skills || []);
    console.log("🏫 Branch:", studentProfile?.branch || "Not provided");

    if (!filePath) {
      return res.status(400).json({ error: "Missing file path" });
    }

    const isUrl = filePath.startsWith("http://") || filePath.startsWith("https://");
    let resolvedPath = filePath;

    if (!isUrl) {
      // ✅ SECURITY: Restrict to the resumes sandbox directory
      resolvedPath = path.resolve(filePath);
      const resumesDir = path.resolve("../opportunex-bcknd/uploads/resumes");

      const relativePart = path.relative(resumesDir, resolvedPath);
      const isOutsideSandbox = relativePart.startsWith("..") || path.isAbsolute(relativePart);

      if (isOutsideSandbox) {
        console.error(`🚨 ACCESS DENIED: ${resolvedPath} is outside ${resumesDir}`);
        return res.status(403).json({ error: "Security Restriction: Forbidden file access" });
      }

      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({
          atsScore: 0,
          extractedSkills: [],
          missingSkills: [],
          suggestions: ["Resume file not found in system"]
        });
      }
    }

    // ✅ Build a complete studentProfile object for the engine
    // Support both the new { studentProfile } shape and the legacy { studentSkills } array shape
    const resolvedProfile = studentProfile || {
      skills: Array.isArray(studentSkills) ? studentSkills : [],
      branch: "",
      year: "",
      cgpa: ""
    };

    /* ===== CALL ENGINE (SINGLE SOURCE OF TRUTH) ===== */
    const result = await analyzeResume(resolvedPath, role || "software-engineer", resolvedProfile);

    console.log("🧠 ENGINE RESULT:", result?.mode, "| Score:", result?.atsScore);

    /* ===== SAFETY CHECK ===== */
    if (!result || typeof result.atsScore !== "number") {
      return res.json({
        atsScore: 0,
        extractedSkills: [],
        missingSkills: [],
        suggestions: ["Resume analysis suspended: Parsing error"]
      });
    }

    res.json(result);

  } catch (err) {
    console.error("🔥 AI ENGINE ERROR:", err.message);
    res.status(500).json({
      error: err.message,
      atsScore: 0,
      extractedSkills: [],
      missingSkills: [],
      suggestions: ["AI system temporarily unavailable. Please try again."]
    });
  }
});

/* ---------------- MATCH SKILLS (Student vs Project) ---------------- */
app.post("/match-skills", async (req, res) => {
  try {
    const { student, project } = req.body;
    const result = await runAIEngine(student, project);
    res.json(result);
  } catch (err) {
    console.error("🔥 MATCH ERROR:", err);
    res.status(500).json({ error: "Matching failed" });
  }
});

/* ---------------- COMPANY ATS SCORE (Resume vs Job) ---------------- */
app.post("/company-ats-score", async (req, res) => {
  try {
    const { resumePath, studentProfile, opportunity } = req.body;
    if (!resumePath) return res.status(400).json({ error: "Missing resumePath" });
    if (!opportunity) return res.status(400).json({ error: "Missing opportunity data" });

    console.log("🤖 Company ATS request received");
    const result = await analyzeResumeForJob(resumePath, studentProfile || {}, opportunity);
    console.log("🧠 Company ATS result: score =", result.overallScore);
    res.json(result);
  } catch (err) {
    console.error("🔥 Company ATS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- FACULTY ATS SCORE (Resume vs Project) ---------------- */
app.post("/faculty-ats-score", async (req, res) => {
  try {
    const { resumePath, studentProfile, project } = req.body;
    if (!resumePath) return res.status(400).json({ error: "Missing resumePath" });
    if (!project) return res.status(400).json({ error: "Missing project data" });

    console.log("🤖 Faculty ATS request received");
    const result = await analyzeResumeForProject(resumePath, studentProfile || {}, project);
    console.log("🧠 Faculty ATS result: fitScore =", result.fitScore);
    res.json(result);
  } catch (err) {
    console.error("🔥 Faculty ATS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5001;

process.on('uncaughtException', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the process using it and restart.`);
    process.exit(1);
  }
});

const server = app.listen(PORT, () => {
  console.log(`🤖 AI Engine running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use. Run: taskkill /F /IM node.exe and restart.');
    process.exit(1);
  }
});

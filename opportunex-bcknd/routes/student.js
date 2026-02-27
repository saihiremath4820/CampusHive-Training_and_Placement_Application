const express = require("express");
const { verifyToken, authorize } = require("../middleware/auth");
const studentController = require("../controllers/studentController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

let resumeStorage;

if (process.env.CLOUDINARY_URL) {
  resumeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "resumes",
      resource_type: "raw", // Required for serving PDFs directly
      format: "pdf",
      public_id: (req, file) => "resume-" + Date.now()
    }
  });
  console.log("☁️ Enabled Cloudinary file storage for Resumes");
} else {
  // Use diskStorage so we preserve the .pdf extension
  resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/resumes/"),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `resume-${unique}.pdf`);
    }
  });
  console.log("💾 Enabled Local DiskStorage for Resumes");
}

const upload = multer({
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    console.log("📄 File received:", file.originalname);
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf") {
      return cb(new Error("Only PDF resumes are allowed"));
    }
    cb(null, true);
  }
});

// ── Public PDF serve route (no auth — iframes can't set headers, filename is a random hash) ──
router.get("/resume/view/:filename", (req, res) => {
  const filename = path.basename(req.params.filename); // strip any path traversal
  const uploadsDir = path.resolve(__dirname, "../uploads/resumes");
  const filePath = path.resolve(uploadsDir, filename);
  // Extra safety: ensure resolved path stays inside the uploads/resumes dir
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Resume file not found" });
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(filePath);
});

// 🔥 SMART RESUME ANALYZER (WITH DEBUG LOGS)
router.post(
  "/analyze-resume",
  verifyToken,
  authorize(["student"]),
  (req, res, next) => {
    console.log("➡️ /student/analyze-resume route hit");
    next();
  },
  upload.single("resume"),
  studentController.analyzeResume
);

// Multer error handler (CRITICAL)
router.use((err, req, res, next) => {
  console.error("❌ Multer error:", err.message);
  res.status(400).json({ error: err.message });
});

// =======================
// STUDENT PROFILE ROUTES
// =======================

// Get student profile
router.get(
  "/profile",
  verifyToken,
  authorize(["student"]),
  studentController.getProfile
);

// Create or update student profile
router.put(
  "/profile",
  verifyToken,
  authorize(["student"]),
  studentController.createOrUpdateProfile
);


module.exports = router;

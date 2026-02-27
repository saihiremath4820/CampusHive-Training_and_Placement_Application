const StudentProfile = require("../models/StudentProfile");
const axios = require("axios");
const path = require("path");

// CREATE or UPDATE student profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    console.log("📝 Received Profile Update:", req.body);
    console.log("👤 User ID:", req.user.id);

    // Ensure userId is correctly set
    const updateData = { ...req.body, userId: req.user.id };

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    if (global.io) {
      global.io.to('admin').emit('student_profile_updated', {
        type: 'profile_update',
        message: `A student updated their profile`,
        studentId: req.user.id,
        timestamp: new Date()
      });
    }

    console.log("✅ Profile Saved Successfully");
    res.json(profile);
  } catch (err) {
    console.error("❌ Profile Save Error:", err);
    res.status(500).json({ error: err.message || "Failed to save profile" });
  }
};

// GET student profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id }).populate("userId", "name email");

    if (!profile) {
      // If no profile exists yet, return basic info from User model
      const user = await require("../models/User").findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({
        fullName: user.name,
        email: user.email,
        degree: "",
        branch: "",
        skills: [],
        year: "",
        cgpa: "",
        percentage: "",
        interests: "",
        linkedin: "",
        github: "",
        projects: "",
        resumePath: ""
      });
    }

    // Merge User data if Profile data is missing
    const response = profile.toObject();
    if (profile.userId) {
      response.fullName = profile.fullName || profile.userId.name;
      response.email = profile.email || profile.userId.email;
    }

    // Ensure consistent defaults for UI
    response.skills = response.skills || [];
    response.projects = response.projects || "";
    response.interests = response.interests || "";
    response.linkedin = response.linkedin || "";

    res.json(response);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// GET student profile

// UPLOAD resume without AI
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Resume file is required" });
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { resumePath: req.file.path },
      { new: true, upsert: true }
    );
    res.json({ success: true, resumePath: req.file.path });
  } catch (err) {
    console.error("Resume upload error:", err);
    res.status(500).json({ error: "Failed to upload resume" });
  }
};

// 🔥 SMART RESUME ANALYZER — passes full student profile for personalised AI analysis
exports.analyzeResume = async (req, res) => {
  try {
    console.log("✅ analyzeResume called");

    if (!req.file) {
      console.log("❌ No resume file");
      return res.status(400).json({ message: "Resume file is required" });
    }

    const isUrl = req.file.path.startsWith("http://") || req.file.path.startsWith("https://");
    const absolutePath = isUrl ? req.file.path : path.resolve(req.file.path);
    console.log("📄 Resume path:", absolutePath);

    // ✅ Fetch complete student profile from DB
    const profile = await StudentProfile.findOne({ userId: req.user.id });

    // Read skills from request body as per latest architecture requirement
    let studentSkills = [];
    try {
      studentSkills = JSON.parse(req.body.studentSkills || "[]");
    } catch (e) { }

    // ✅ Build a rich profile object to send to AI engine
    // This is what drives personalised, role-aware suggestions
    const studentProfile = {
      skills: studentSkills.length > 0 ? studentSkills : (Array.isArray(profile?.skills) ? profile.skills : []),
      branch: req.body.studentBranch || profile?.branch || "",
      year: req.body.studentYear || profile?.year || "",
      cgpa: req.body.studentCgpa || profile?.cgpa || "",
      name: profile?.fullName || ""
    };

    // ✅ Support optional target role from request body (e.g. "ml", "frontend")
    // Default to "software-engineer" — never hardcode "ml" unless student chose it
    const role = req.body.role || "software-engineer";

    console.log("👤 Student profile sent to AI engine:", studentProfile);
    console.log("🎯 Target role:", role);

    // ✅ Save the resume path to the student profile
    await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { resumePath: req.file.path },
      { upsert: true }
    );

    const aiResponse = await axios.post(
      `${process.env.AI_ENGINE_URL}/analyze-resume`,
      {
        filePath: absolutePath,
        role,
        studentProfile,
        studentSkills
      },
      { timeout: 60000 }  // 60 second timeout for Groq AI
    );

    console.log("🤖 AI response received, mode:", aiResponse.data?.mode, "| Score:", aiResponse.data?.atsScore);

    res.json({
      success: true,
      analysis: aiResponse.data
    });

  } catch (err) {
    const aiError = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
    const isConnRefused = err.code === 'ECONNREFUSED';
    const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
    console.error("🔥 Resume analysis failed:", { code: err.code, message: err.message, aiEngineResponse: err.response?.data });
    res.status(500).json({
      message: isConnRefused
        ? "AI engine is offline. Please ensure the AI engine server is running on port 5001."
        : isTimeout
          ? "AI analysis timed out. The Groq API may be slow — please retry in a moment."
          : `Resume analysis failed: ${aiError}`
    });
  }
};

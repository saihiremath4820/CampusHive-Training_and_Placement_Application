const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  fullName: String,
  email: String,
  mobile: String,
  degree: String,
  branch: String,
  year: String,
  cgpa: String, // String to handle empty inputs gracefully
  percentage: String,
  tenth: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  twelfth: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },

  skills: [String],
  github: String,
  linkedin: String,
  projects: String, // Description block
  interests: String,
  certifications: [String],
  resumePath: String, // 📄 Secured path to the student's resume
  profileCompletion: Number
});

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);

const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    // 🔹 BASIC INFO
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // 🔹 REQUIREMENTS
    requiredSkills: {
      type: [String],
      required: true,
    },

    requiredDegree: {
      type: String,
      required: true,
    },

    requiredCGPA: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    deadline: {
      type: Date,
      required: true,
    },

    // 🔹 OPPORTUNITY DETAILS
    type: {
      type: String,
      enum: ["Internship", "Full-Time", "Project", "Contract"],
      required: true,
    },

    duration: {
      type: String,
    },

    eligibility: {
      type: String,
    },

    dataRequirements: {
      type: [String],
      default: ["Resume", "CGPA", "Contact Number"],
    },

    // 🔹 STATUS & OWNERSHIP
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    // 🔹 ADMIN APPROVAL
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    collegeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);

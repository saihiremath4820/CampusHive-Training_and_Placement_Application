const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },

    // For faculty/staff
    position: { type: String, default: "Faculty Member" },
    department: { type: String, default: "" },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "faculty", "company", "admin"],
      default: "student"
    },

    // 🔒 COLLEGE BINDING (CRITICAL)
    collegeId: {
      type: String,
      required: true
    },

    // 🔐 ACCOUNT STATUS (for approvals)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "deactivated"],
      default: "approved"
    },

    // Company Profile Completion
    profileCompleted: {
      type: Boolean,
      default: false
    },

    // 🔐 Forgot Password
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);

// ✅ Email must be unique PER COLLEGE (not globally)
UserSchema.index({ email: 1, collegeId: 1 }, { unique: true });

UserSchema.pre("save", function () {
  if (this.role) {
    this.role = this.role.toLowerCase();
  }
});

module.exports = mongoose.model("User", UserSchema);

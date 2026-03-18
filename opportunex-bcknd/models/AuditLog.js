const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    // 🔐 Who did the action
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🏫 College isolation
    collegeId: {
      type: String,
      required: true,
    },

    // 📦 Which module was affected
    module: {
      type: String,
      required: true,
      // examples:
      // "PlacementOverview"
      // "PlacementStats"
      // "TrainingActivity"
      // "UserApproval"
    },

    // ⚡ Action type
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "UPLOAD"],
      required: true,
    },

    // 🆔 Affected record
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // 📝 Change tracking
    oldValue: {
      type: Object,
      default: null,
    },

    newValue: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ collegeId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

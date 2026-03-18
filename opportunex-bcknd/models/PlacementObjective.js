const mongoose = require("mongoose");

const placementObjectiveSchema = new mongoose.Schema(
  {
    // 🏫 College isolation
    collegeId: {
      type: String,
      required: true,
    },

    // 👤 Admin who added/updated
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🎯 Objective text
    objective: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

placementObjectiveSchema.index({ collegeId: 1 });

module.exports = mongoose.model("PlacementObjective", placementObjectiveSchema);

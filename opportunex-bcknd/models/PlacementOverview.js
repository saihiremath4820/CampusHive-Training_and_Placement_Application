const mongoose = require("mongoose");

const placementOverviewSchema = new mongoose.Schema(
  {
    // 🏫 College isolation
    collegeId: {
      type: String,
      required: true,
    },

    // 👤 Admin who last updated
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📝 Main content
    title: {
      type: String,
      default: "Training & Placement Cell",
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

placementOverviewSchema.index({ collegeId: 1 });

module.exports = mongoose.model("PlacementOverview", placementOverviewSchema);

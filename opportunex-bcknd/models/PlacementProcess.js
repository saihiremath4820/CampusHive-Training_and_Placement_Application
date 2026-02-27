const mongoose = require("mongoose");

const placementProcessSchema = new mongoose.Schema(
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

    // 🔢 Step number (1–7)
    stepNumber: {
      type: Number,
      required: true,
    },

    // 🏷️ Step title
    title: {
      type: String,
      required: true,
    },

    // 📝 Step description
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PlacementProcess", placementProcessSchema);

const mongoose = require("mongoose");

const placementReportSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    academicYear: {
      type: String,
      required: true,
    },

    reportFileUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

placementReportSchema.index({ collegeId: 1 });

module.exports = mongoose.model("PlacementReport", placementReportSchema);

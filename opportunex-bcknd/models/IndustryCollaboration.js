const mongoose = require("mongoose");

const industryCollaborationSchema = new mongoose.Schema(
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


    organizationName: {
      type: String,
      required: true,
    },


    purpose: {
      type: String,
      required: true,
    },


    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

industryCollaborationSchema.index({ collegeId: 1 });

module.exports = mongoose.model(
  "IndustryCollaboration",
  industryCollaborationSchema
);
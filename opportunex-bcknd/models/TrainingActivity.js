const mongoose = require("mongoose");

const trainingActivitySchema = new mongoose.Schema(
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

    // 🏷️ Activity title
    title: {
      type: String,
      required: true,
    },

    // 📅 Date of activity
    date: {
      type: Date,
      required: true,
    },

    // 🧩 Category
    category: {
      type: String,
      enum: [
        "Training",
        "Workshop",
        "Tech Talk",
        "Orientation",
        "Career Guidance",
        "Awareness Session",
      ],
      required: true,
    },

    // 👨‍🏫 Resource person / organization
    resourcePerson: {
      type: String,
      default: "",
    },

    // 📝 Optional description
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TrainingActivity", trainingActivitySchema);

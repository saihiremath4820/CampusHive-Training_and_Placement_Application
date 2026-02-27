const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
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

    // 🏢 Company name
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    // 💼 Role offered
    role: {
      type: String,
      default: "-",
      trim: true,
    },

    // 💰 Package / CTC
    package: {
      type: String,
      default: "-",
      trim: true,
    },

    // 📝 Role expectations / skills required
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // 🌐 Optional logo URL
    logoUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Recruiter", recruiterSchema);

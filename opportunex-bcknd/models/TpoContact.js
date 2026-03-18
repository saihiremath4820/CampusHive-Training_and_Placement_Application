const mongoose = require("mongoose");

const tpoContactSchema = new mongoose.Schema(
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

    // 👤 Name of the person
    name: {
      type: String,
      required: true,
    },

    // 🏷️ Role (TPO, Joint TPO, Coordinator, etc.)
    role: {
      type: String,
      required: true,
    },

    // 📧 Contact email
    email: {
      type: String,
      required: true,
    },

    // 📞 Phone number
    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tpoContactSchema.index({ collegeId: 1 });

module.exports = mongoose.model("TpoContact", tpoContactSchema);

const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            default: "Ongoing"
        },
        grade: { type: String },
        feedback: { type: String },
        evaluatedAt: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Team", TeamSchema);

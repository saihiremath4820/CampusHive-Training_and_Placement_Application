const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        domain: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        milestones: [
            {
                text: String,
                isCompleted: { type: Boolean, default: false }
            }
        ],
        status: {
            type: String,
            enum: ["Active", "Completed", "Closed"],
            default: "Active",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        collegeId: {
            type: String,
            required: true,
        },
        applicants: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                status: {
                    type: String,
                    enum: ["Pending", "Approved", "Rejected"],
                    default: "Pending"
                },
                rejectionReason: { type: String },
                appliedAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

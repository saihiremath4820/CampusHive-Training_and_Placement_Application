const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // if null, it's a global notification for the college
        },
        role: {
            type: String,
            enum: ["student", "faculty", "company", "admin", "all"],
            default: "all",
        },
        collegeId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ collegeId: 1 });
notificationSchema.index({ isBroadcast: 1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ collegeId: 1, isBroadcast: 1 });

module.exports = mongoose.model("Notification", notificationSchema);

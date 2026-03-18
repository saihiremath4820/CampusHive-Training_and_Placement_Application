const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
    try {
        const { collegeId, id: userId, role } = req.user;

        // 1. specifically for this user
        // 2. Or global for this role
        // 3. Or global for everyone
        const notifications = await Notification.find({
            collegeId,
            $or: [
                { recipient: userId }, // Personal notifications
                { recipient: null, role: role },
                { recipient: null, role: "all" },
                { recipient: { $exists: false }, role: role },
                { recipient: { $exists: false }, role: "all" }
            ]
        }).sort({ createdAt: -1 }).limit(20);

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.clearAll = async (req, res) => {
    try {
        const { collegeId, id: userId, role } = req.user;
        await Notification.updateMany(
            {
                collegeId,
                $or: [
                    { recipient: userId }, // Personal notifications
                    { recipient: null, role: role },
                    { recipient: null, role: "all" },
                    { recipient: { $exists: false }, role: role },
                    { recipient: { $exists: false }, role: "all" }
                ]
            },
            { isRead: true }
        );
        res.json({ message: "Cleared all" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Helper for other controllers to create notifications
exports.createNotification = async ({ collegeId, recipient, role, title, message, type, link, eventName, socketData }) => {
    try {
        const notif = await Notification.create({
            collegeId: collegeId || "default", // safeguard
            recipient,
            role,
            title,
            message,
            type,
            link
        });

        try {
            const { getIO } = require('../config/socket');
            const io = getIO();
            
            if (eventName) {
                const payload = {
                    ...notif.toObject(),
                    ...(socketData || {}),
                    timestamp: new Date()
                };

                if (recipient) {
                    io.to(recipient.toString()).emit(eventName, payload);
                } else if (role) {
                    io.to(role).emit(eventName, payload);
                }
            }
        } catch(err) {
            console.error("Socket error mapping notification emission:", err.message);
        }
        return notif;
    } catch (err) {
        console.error("Failed to create notification:", err);
    }
};

const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { getNotifications, markAsRead, clearAll } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/:id/read", verifyToken, markAsRead);
router.put("/clear-all", verifyToken, clearAll);

module.exports = router;

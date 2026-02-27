const User = require("../models/User");

// Get Faculty Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("name email position department");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update Faculty Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, position, department } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (position) user.position = position;
        if (department) user.department = department;

        await user.save();

        res.json({ message: "Profile updated successfully", user: { name: user.name, position: user.position, email: user.email, department: user.department } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

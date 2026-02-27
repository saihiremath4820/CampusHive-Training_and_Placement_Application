const CompanyProfile = require("../models/CompanyProfile");
const User = require("../models/User");
const Application = require("../models/Application");

// Get Company Profile
exports.getProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ userId: req.user.id }).populate("userId", "name email profileCompleted");

        if (!profile) {
            // Fallback: If no company profile, return User info (Recruiter Name)
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            return res.json({
                name: user.name, // Recruiter Name
                email: user.email,
                companyName: "My Company", // Default
                industry: "",
                location: "",
                website: "",
                about: "",
                profileCompleted: user.profileCompleted || false
            });
        }

        // Merge Recruiter Name/Email if using fields from User
        const response = profile.toObject();
        if (profile.userId) {
            response.recruiterName = profile.userId.name;
            response.recruiterEmail = profile.userId.email;
            response.profileCompleted = profile.userId.profileCompleted || false;
        }

        res.json(response);

    } catch (err) {
        res.status(500).json({ message: "Failed to fetch profile", error: err.message });
    }
};

// Update Company Profile
exports.updateProfile = async (req, res) => {
    try {
        const { companyName, industry, location, website, about, contactNumber, recruiterName } = req.body;

        const profile = await CompanyProfile.findOneAndUpdate(
            { userId: req.user.id },
            {
                userId: req.user.id,
                companyName,
                industry,
                location,
                website,
                about,
                contactNumber
            },
            { new: true, upsert: true } // Create if not exists
        );

        const updatePayload = { profileCompleted: true };
        if (recruiterName) updatePayload.name = recruiterName;

        await User.findByIdAndUpdate(req.user.id, updatePayload);

        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile", error: err.message });
    }
};

// GET /api/company/analytics
exports.getAnalytics = async (req, res) => {
    try {
        const companyId = req.user.id; // Company's user ID

        // 1. Get status counts
        const statusCounts = await Application.aggregate([
            { $match: { company: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        let totalApplicants = 0;
        let shortlisted = 0;
        let interviewed = 0;
        let offered = 0;

        statusCounts.forEach(stat => {
            totalApplicants += stat.count;
            const status = stat._id.toLowerCase();
            if (status === 'shortlisted') shortlisted += stat.count;
            if (status === 'interview') interviewed += stat.count;
            if (status === 'selected' || status === 'offered') offered += stat.count;
        });

        const conversionRate = totalApplicants > 0 ? ((offered / totalApplicants) * 100).toFixed(1) : 0;

        // Mock avg time to hire for now
        const avgTimeToHire = 14;

        // 2. Get top skills in pool
        // Find all student IDs that applied to this company
        const applicants = await Application.find({ company: req.user._id }).distinct('student');

        const skillFreq = await User.aggregate([
            { $match: { _id: { $in: applicants }, skills: { $exists: true, $not: { $size: 0 } } } },
            { $unwind: '$skills' },
            { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, skill: '$_id', count: 1 } }
        ]);

        // 3. Applications by month
        const byMonthRaw = await Application.aggregate([
            { $match: { company: req.user._id } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const applicationsByMonth = byMonthRaw.map(m => ({
            month: monthNames[m._id - 1] || 'Unknown',
            count: m.count
        }));

        res.json({
            success: true,
            analytics: {
                totalApplicants,
                shortlisted,
                interviewed,
                offered,
                conversionRate: Number(conversionRate),
                avgTimeToHire,
                topSkillsInPool: skillFreq,
                applicationsByMonth
            }
        });

    } catch (err) {
        console.error("Analytics fetch error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch analytics" });
    }
};

const CompanyProfile = require("../models/CompanyProfile");
const User = require("../models/User");
const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");

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

// GET /api/company/public/:id
exports.getPublicCompanyProfile = async (req, res) => {
    try {
        const { id } = req.params; // company userId

        const profile = await CompanyProfile.findOne({ userId: id })
            .select("companyName industry location website about userId")
            .lean();

        if (!profile) {
            return res.status(404).json({ message: "Company profile not found" });
        }

        // Get active approved drives by this company
        const Opportunity = require("../models/Opportunity");
        const activeJobs = await Opportunity.find({
            createdBy: id,
            status: "Active",
            approvalStatus: "approved",
            isDeleted: false
        })
            .select("title type location requiredSkills requiredCGPA deadline")
            .lean();

        // Return only public safe fields — NO email, phone, recruiter details
        res.json({
            companyName: profile.companyName,
            industry: profile.industry,
            location: profile.location,
            website: profile.website,
            about: profile.about,
            activeJobs: activeJobs.map(job => ({
                _id: job._id,
                title: job.title,
                type: job.type,
                location: job.location,
                requiredSkills: job.requiredSkills,
                requiredCGPA: job.requiredCGPA,
                deadline: job.deadline
            })),
            totalActiveJobs: activeJobs.length
        });
    } catch (err) {
        console.error("getPublicCompanyProfile error:", err);
        res.status(500).json({ message: "Failed to fetch company profile" });
    }
};

// GET /api/company/stats — Application status distribution + velocity
exports.getApplicationStats = async (req, res) => {
    try {
        const companyId = req.user.id;
        const collegeId = req.user.collegeId;

        const opportunities = await Opportunity.find({ createdBy: companyId, collegeId }).select('_id');
        const oppIds = opportunities.map(o => o._id);

        const [applied, shortlisted, selected, rejected] = await Promise.all([
            Application.countDocuments({ opportunityId: { $in: oppIds }, status: 'Applied' }),
            Application.countDocuments({ opportunityId: { $in: oppIds }, status: 'Shortlisted' }),
            Application.countDocuments({ opportunityId: { $in: oppIds }, status: 'Selected' }),
            Application.countDocuments({ opportunityId: { $in: oppIds }, status: 'Rejected' })
        ]);

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const start = new Date(d); start.setHours(0, 0, 0, 0);
            const end = new Date(d); end.setHours(23, 59, 59, 999);
            const count = await Application.countDocuments({
                opportunityId: { $in: oppIds },
                createdAt: { $gte: start, $lte: end }
            });
            last7Days.push({
                date: start.toLocaleDateString('en-IN', { weekday: 'short' }),
                count
            });
        }

        res.json({
            statusDistribution: { applied, shortlisted, selected, rejected },
            velocityData: last7Days,
            total: applied + shortlisted + selected + rejected
        });
    } catch (err) {
        console.error("getApplicationStats error:", err);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

// GET /api/company/deadline-alerts — Drives expiring soon or already expired
exports.getDeadlineAlerts = async (req, res) => {
    try {
        const companyId = req.user.id;
        const collegeId = req.user.collegeId;
        const now = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(now.getDate() + 3);

        const [urgentDrives, expiredDrives] = await Promise.all([
            Opportunity.find({
                createdBy: companyId, collegeId,
                status: 'Active', approvalStatus: 'approved',
                deadline: { $gte: now, $lte: threeDaysLater }
            }).select('title deadline'),
            Opportunity.find({
                createdBy: companyId, collegeId,
                status: 'Active',
                deadline: { $lt: now }
            }).select('title deadline')
        ]);

        const alerts = [
            ...expiredDrives.map(d => ({
                type: 'expired',
                title: d.title,
                message: `"${d.title}" deadline has passed — consider closing this drive`,
                color: 'red'
            })),
            ...urgentDrives.map(d => {
                const daysLeft = Math.ceil((new Date(d.deadline) - now) / (1000 * 60 * 60 * 24));
                return {
                    type: 'urgent',
                    title: d.title,
                    message: `"${d.title}" deadline in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
                    color: daysLeft <= 1 ? 'red' : 'orange',
                    daysLeft
                };
            })
        ];

        res.json({ alerts });
    } catch (err) {
        console.error("getDeadlineAlerts error:", err);
        res.status(500).json({ message: 'Failed to fetch alerts' });
    }
};

// GET /api/company/recent-activity — Last 15 application events
exports.getRecentActivity = async (req, res) => {
    try {
        const companyId = req.user.id;
        const collegeId = req.user.collegeId;

        const opportunities = await Opportunity.find({ createdBy: companyId, collegeId }).select('_id title');
        const oppIds = opportunities.map(o => o._id);

        const recentApplications = await Application.find({ opportunityId: { $in: oppIds } })
            .sort({ updatedAt: -1 })
            .limit(15)
            .populate('studentId', 'name email')
            .populate('opportunityId', 'title');

        const activities = recentApplications.map(app => ({
            studentName: app.studentId?.name || 'Unknown Student',
            jobTitle: app.opportunityId?.title || 'Unknown Position',
            status: app.status,
            time: app.updatedAt,
            type: app.status === 'Applied' ? 'applied' :
                app.status === 'Shortlisted' ? 'shortlisted' :
                    app.status === 'Selected' ? 'selected' : 'rejected'
        }));

        res.json({ activities });
    } catch (err) {
        console.error("getRecentActivity error:", err);
        res.status(500).json({ message: 'Failed to fetch activity' });
    }
};

// GET /api/company/dashboard-stats — 6 stat card values
exports.getDashboardStats = async (req, res) => {
    try {
        const companyId = req.user.id;
        const collegeId = req.user.collegeId;

        const allOppIds = await Opportunity.find({ createdBy: companyId, collegeId }).distinct('_id');

        const [activeJobs, pendingApproval, closedJobs, totalApplicants, shortlisted, selected] = await Promise.all([
            Opportunity.countDocuments({ createdBy: companyId, collegeId, status: 'Active', approvalStatus: 'approved' }),
            Opportunity.countDocuments({ createdBy: companyId, collegeId, approvalStatus: 'pending' }),
            Opportunity.countDocuments({ createdBy: companyId, collegeId, status: 'Closed' }),
            Application.countDocuments({ opportunityId: { $in: allOppIds } }),
            Application.countDocuments({ opportunityId: { $in: allOppIds }, status: 'Shortlisted' }),
            Application.countDocuments({ opportunityId: { $in: allOppIds }, status: 'Selected' })
        ]);

        res.json({ activeJobs, pendingApproval, closedJobs, totalApplicants, shortlisted, selected });
    } catch (err) {
        console.error("getDashboardStats error:", err);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

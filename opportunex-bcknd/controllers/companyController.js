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
        const companyId = req.user.id;
        const collegeId = req.user.collegeId;

        // ✅ Step 1: Find all opportunities belonging to this company
        const opportunities = await Opportunity.find({ createdBy: companyId, collegeId })
            .select('_id title');
        const opportunityIds = opportunities.map(o => o._id);

        if (opportunityIds.length === 0) {
            return res.json({
                success: true,
                analytics: {
                    totalApplicants: 0,
                    shortlisted: 0,
                    interviewed: 0,
                    offered: 0,
                    conversionRate: 0,
                    avgTimeToHire: 0,
                    topSkillsInPool: [],
                    applicationsByMonth: []
                }
            });
        }

        // ✅ Step 2: Fetch all applications for those opportunities
        const applications = await Application.find({ opportunityId: { $in: opportunityIds } }).lean();

        const totalApplicants = applications.length;
        const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
        const interviewed = 0; // "Interview" is not a status in the schema — reserved for future
        const offered = applications.filter(a => a.status === 'Selected').length;

        const conversionRate = totalApplicants > 0
            ? ((offered / totalApplicants) * 100).toFixed(1)
            : 0;

        // ✅ Step 3: Calculate real average time to hire (days from Applied → Selected)
        const hiredApps = applications.filter(a => a.status === 'Selected' && a.createdAt && a.updatedAt);
        const avgTimeToHire = hiredApps.length > 0
            ? Math.round(
                hiredApps.reduce((sum, a) =>
                    sum + (new Date(a.updatedAt) - new Date(a.createdAt)) / (1000 * 60 * 60 * 24), 0
                ) / hiredApps.length
              )
            : 0;

        // ✅ Step 4: Top skills in applicant pool — from StudentProfile (where skills actually live)
        const studentIds = [...new Set(applications.map(a => a.studentId?.toString()).filter(Boolean))];
        const StudentProfile = require('../models/StudentProfile');
        const profiles = await StudentProfile.find({ userId: { $in: studentIds } }).select('skills').lean();

        const skillFreqMap = {};
        profiles.forEach(p => {
            (p.skills || []).forEach(s => {
                const key = (s?.name || s || '').toLowerCase();
                if (key) skillFreqMap[key] = (skillFreqMap[key] || 0) + 1;
            });
        });
        const topSkillsInPool = Object.entries(skillFreqMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));

        // ✅ Step 5: Applications by month — from real data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthMap = {};
        applications.forEach(a => {
            const monthIndex = new Date(a.createdAt).getMonth();
            const key = monthNames[monthIndex];
            monthMap[key] = (monthMap[key] || 0) + 1;
        });
        const applicationsByMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

        res.json({
            success: true,
            analytics: {
                totalApplicants,
                shortlisted,
                interviewed,
                offered,
                conversionRate: Number(conversionRate),
                avgTimeToHire,
                topSkillsInPool,
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

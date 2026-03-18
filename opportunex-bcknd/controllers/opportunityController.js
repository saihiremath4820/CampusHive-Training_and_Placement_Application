const Opportunity = require("../models/Opportunity");
const StudentProfile = require("../models/StudentProfile");
const Application = require("../models/Application");
const User = require("../models/User");
const paginate = require("../utils/paginate");
const { createNotification } = require("./notificationController");

// ===============================
// CREATE OPPORTUNITY
// ===============================
exports.createOpportunity = async (req, res) => {
  try {
    // 🔐 Block unapproved companies
    const user = await User.findById(req.user.id);
    if (user && user.role === "company" && user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval. You cannot post drives yet."
      });
    }

    const { title, description, requiredSkills, requiredDegree, requiredCGPA, minTenth, minTwelfth, deadline, type, duration, eligibility } = req.body;

    if (!title || !type || !requiredDegree || !requiredCGPA || !deadline || !requiredSkills) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      requiredSkills,
      requiredDegree,
      requiredCGPA,
      minTenth: minTenth || 0,
      minTwelfth: minTwelfth || 0,
      deadline,
      type,
      duration,
      eligibility,
      createdBy: req.user.id,
      collegeId: req.user.collegeId,
      approvalStatus: "pending",   // Always starts pending admin approval
    });

    // 🔔 Notify Admin about new drive
    await createNotification({
      collegeId: req.user.collegeId,
      role: "admin",
      title: "New Drive Submitted for Approval",
      message: `A company has submitted a new placement drive "${title}" for your review.`,
      type: "info",
      link: "/admin/opportunities",
      eventName: "drive_submitted"
    });

    return res.status(201).json({
      success: true,
      message: "Opportunity submitted for admin approval",
      data: opportunity,
    });
  } catch (error) {
    console.error("CREATE OPPORTUNITY ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to create opportunity", error: error.message });
  }
};

// ===============================
// GET ALL OPPORTUNITIES (Company/Faculty/Admin view)
// ===============================
exports.getAllOpportunities = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { collegeId, id: userId, role } = req.user;

    const matchQuery = { collegeId, isDeleted: false };
    if (role === "company") matchQuery.createdBy = new (require('mongoose').Types.ObjectId)(userId);

    const [opportunitiesWithCounts, total] = await Promise.all([
      Opportunity.aggregate([
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'opportunityId',
            as: 'applicants'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creatorInfo'
          }
        },
        {
          $addFields: {
            applicantCount: { $size: '$applicants' },
            createdBy: { $arrayElemAt: ['$creatorInfo', 0] }
          }
        },
        { $project: { creatorInfo: 0, 'createdBy.password': 0 } }
      ]),
      Opportunity.countDocuments(matchQuery)
    ]);

    return res.status(200).json({
      success: true,
      count: opportunitiesWithCounts.length,
      data: opportunitiesWithCounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch opportunities", error: error.message });
  }
};

// ===============================
// UPDATE OPPORTUNITY
// ===============================
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findOne({ _id: id, createdBy: req.user.id });
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found or unauthorized" });
    }

    const allowedFields = ["title", "description", "requiredSkills", "requiredDegree", "requiredCGPA", "minTenth", "minTwelfth", "deadline", "type", "duration", "eligibility", "dataRequirements"];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) opportunity[field] = req.body[field];
    });

    // Reset approval on edit — must be re-approved
    opportunity.approvalStatus = "pending";
    opportunity.rejectionReason = "";

    await opportunity.save();

    // Notify admin about the update
    await createNotification({
      collegeId: req.user.collegeId,
      role: "admin",
      title: "Drive Updated — Needs Re-Approval",
      message: `A company has updated their drive "${opportunity.title}" and it requires re-approval.`,
      type: "info",
      link: "/admin/opportunities",
      eventName: "drive_submitted"
    });

    return res.status(200).json({ success: true, message: "Opportunity updated and pending re-approval", data: opportunity });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update opportunity", error: error.message });
  }
};

// ===============================
// CLOSE OPPORTUNITY
// ===============================
exports.closeOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    // Verify this resource belongs to the requesting company
    if (opportunity.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    opportunity.status = "Closed";
    await opportunity.save();

    return res.status(200).json({ success: true, message: "Opportunity closed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to close opportunity", error: error.message });
  }
};

// ===============================
// DELETE OPPORTUNITY
// ===============================
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findOne({ _id: id, createdBy: req.user.id });
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found or unauthorized" });
    }

    await Application.deleteMany({ opportunityId: id });
    await Opportunity.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Opportunity and related applications deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete opportunity", error: error.message });
  }
};

// ===============================
// GET COMPANY ANALYTICS
// ===============================
exports.getCompanyAnalytics = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const opportunities = await Opportunity.find({ createdBy: userId, isDeleted: false });
    const oppIds = opportunities.map(o => o._id);

    const activeCount = opportunities.filter(o => o.status === "Active").length;
    const closedCount = opportunities.filter(o => o.status === "Closed").length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applications = await Application.find({
      opportunityId: { $in: oppIds },
      createdAt: { $gte: sevenDaysAgo }
    });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const engagementMap = {};
    const recentDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      engagementMap[dayName] = 0;
      recentDays.push(dayName);
    }

    applications.forEach(app => {
      const dayName = days[new Date(app.createdAt).getDay()];
      if (engagementMap[dayName] !== undefined) engagementMap[dayName]++;
    });

    const engagementData = recentDays.map(day => ({ day, apps: engagementMap[day] }));

    res.json({
      activeCount,
      closedCount,
      totalApplicants: await Application.countDocuments({ opportunityId: { $in: oppIds } }),
      engagementData
    });
  } catch (error) {
    res.status(500).json({ message: "Analytics failed", error: error.message });
  }
};

// ===============================
// GET OPPORTUNITIES FOR STUDENT (only approved + active)
// ===============================
exports.getStudentOpportunities = async (req, res) => {
  try {
    const { collegeId, id: userId } = req.user;

    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return res.json({ success: true, data: [], message: "Complete profile to view opportunities" });
    }

    // 🔐 Students only see APPROVED + ACTIVE drives
    const opportunitiesRaw = await Opportunity.find({
      collegeId: collegeId.toString(),
      status: "Active",
      approvalStatus: "approved",
      isDeleted: false,
      type: { $in: ["Internship", "Full-Time", "Project", "Contract"] }
    }).populate("createdBy", "name email").lean();

    // 1. Extract unified creator IDs
    const createdByIds = [...new Set(opportunitiesRaw.map(o => o.createdBy?._id?.toString()).filter(Boolean))];

    // 2. Query all corresponding Company Profiles
    const CompanyProfile = require("../models/CompanyProfile");
    const companyProfiles = await CompanyProfile.find({
      userId: { $in: createdByIds }
    }).select("userId companyName industry location website about").lean();

    // 3. Build lookup map
    const profileMap = {};
    companyProfiles.forEach(p => {
      profileMap[p.userId.toString()] = p;
    });

    // 4. Enrich opportunities with comprehensive profile data
    const opportunities = opportunitiesRaw.map(opp => {
      const profile = profileMap[opp.createdBy?._id?.toString()];
      return {
        ...opp,
        companyName: profile?.companyName || opp.createdBy?.name || "Corporate Partner",
        companyIndustry: profile?.industry || "",
        companyLocation: profile?.location || opp.location || "",
        companyWebsite: profile?.website || "",
        companyAbout: profile?.about || "",
        companyProfileId: opp.createdBy?._id || null,
        dataRequirements: opp.dataRequirements || []
      };
    });

    const studentCGPA = parseFloat(profile.cgpa) || 0;
    const studentDegree = (profile.degree || "").toLowerCase().replace(/[^a-z]/g, "");

    const eligibleOpps = opportunities.filter(opp => {
      // Check 10th criteria - do not exclude if marks not entered
      if (opp.minTenth && opp.minTenth > 0) {
        if (profile.tenth !== null && profile.tenth !== undefined && profile.tenth < opp.minTenth) {
          return false;
        }
      }
      // Check 12th criteria
      if (opp.minTwelfth && opp.minTwelfth > 0) {
        if (profile.twelfth !== null && profile.twelfth !== undefined && profile.twelfth < opp.minTwelfth) {
          return false;
        }
      }

      const reqCGPA = opp.requiredCGPA || 0;
      if (reqCGPA > 0) {
        if (profile.cgpa !== null && profile.cgpa !== undefined && studentCGPA < reqCGPA) {
          return false;
        }
      }

      const reqDegree = (opp.requiredDegree || "").toLowerCase().replace(/[^a-z]/g, "");
      const degreeCheck = !reqDegree || reqDegree === "any" || reqDegree.includes(studentDegree) || studentDegree.includes(reqDegree);
      return degreeCheck;
    });

    const studentSkills = profile.skills || [];

    const enrichedOpps = eligibleOpps.map(opp => {
      const required = opp.requiredSkills || [];
      const missingSkills = [];
      let fitPercentage = null;

      if (studentSkills.length > 0 && required.length > 0) {
        const studentSkillsLower = studentSkills.map(s => (s?.name || s || "").toLowerCase());
        const matched = required.filter(s => studentSkillsLower.includes(s.toLowerCase()));
        fitPercentage = Math.round((matched.length / required.length) * 100);
        required.forEach(s => {
          if (!studentSkillsLower.includes(s.toLowerCase())) missingSkills.push(s);
        });
      } else if (required.length > 0) {
        required.forEach(s => missingSkills.push(s));
        fitPercentage = 0;
      }

      return {
        ...opp,
        companyName: opp.createdBy?.name || "Corporate Partner",
        fitPercentage,
        missingSkills
      };
    });

    res.json({ success: true, data: enrichedOpps });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

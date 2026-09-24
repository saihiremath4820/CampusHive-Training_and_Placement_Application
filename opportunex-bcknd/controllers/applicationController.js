// Controller logic will be added step by step

const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const paginate = require("../utils/paginate");
const { createNotification } = require("./notificationController");

// Apply to an opportunity
exports.applyToOpportunity = async (req, res) => {
  try {
    const { opportunityId, githubUrl, linkedinUrl, hasBacklog, statementOfPurpose } = req.body;
    const studentId = req.user.id;

    const opportunity = await Opportunity.findOne({
      _id: opportunityId,
      collegeId: req.user.collegeId
    });

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    if (opportunity.status !== "Active") {
      return res.status(400).json({
        message: "Opportunity is closed",
      });
    }

    const StudentProfile = require("../models/StudentProfile");
    const student = await StudentProfile.findOne({ userId: req.user.id });

    const ineligibilityReasons = [];

    if (opportunity.minTenth > 0 && (!student.tenth || student.tenth < opportunity.minTenth)) {
      ineligibilityReasons.push(`Minimum 10th percentage required: ${opportunity.minTenth}%`);
    }
    if (opportunity.minTwelfth > 0 && (!student.twelfth || student.twelfth < opportunity.minTwelfth)) {
      ineligibilityReasons.push(`Minimum 12th percentage required: ${opportunity.minTwelfth}%`);
    }
    if (opportunity.requiredCGPA > 0 && (!student.cgpa || student.cgpa < opportunity.requiredCGPA)) {
      ineligibilityReasons.push(`Minimum CGPA required: ${opportunity.requiredCGPA}`);
    }

    if (ineligibilityReasons.length > 0) {
      return res.status(403).json({
        message: "You do not meet the eligibility criteria for this opportunity",
        reasons: ineligibilityReasons
      });
    }

    // Check what data is required
    const required = opportunity.dataRequirements || [];
    const missingFields = [];

    if (required.includes('GitHub/Portfolio') && !githubUrl) {
      missingFields.push('GitHub/Portfolio URL');
    }
    if (required.includes('LinkedIn Profile') && !linkedinUrl) {
      missingFields.push('LinkedIn Profile URL');
    }
    if (required.includes('Statement of Purpose') && !statementOfPurpose) {
      missingFields.push('Statement of Purpose');
    }
    if (required.includes('Backlog History') && hasBacklog === undefined) {
      missingFields.push('Backlog status');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Please provide all required information: ' + missingFields.join(', '),
        missingFields
      });
    }

    const existingApplication = await Application.findOne({
      opportunityId,
      studentId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this opportunity",
      });
    }

    const application = new Application({
      opportunityId,
      studentId,
      submittedData: {
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        hasBacklog: hasBacklog ?? null,
        statementOfPurpose: statementOfPurpose || null
      }
    });

    await application.save();

    // 🔔 Notify Recruiter/Creator
    await createNotification({
      collegeId: opportunity.collegeId,
      recipient: opportunity.createdBy,
      title: "New Application",
      message: `A student has applied for "${opportunity.title}"`,
      type: "info",
      link: "/applicants",
      eventName: "new_application",
      socketData: {
        applicationId: application._id,
        jobTitle: opportunity.title
      }
    });

    try {
      const { getIO } = require('../config/socket');
      getIO().to('admin').emit('application_update', {
        message: 'New application received'
      });
    } catch(err) {
      console.error("Socket error mapping application update to admin:", err.message);
    }

    res.status(201).json({
      message: "Applied successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to apply",
      error: error.message,
    });
  }
};


// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, newStatus } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const currentStatus = application.status;

    const allowedTransitions = {
      Applied: ["Shortlisted", "Rejected"],
      Shortlisted: ["Selected", "Rejected"],
    };

    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus].includes(newStatus)
    ) {
      return res.status(400).json({
        message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
      });
    }

    // Fetch opportunity to verify ownership and title
    const opportunity = await Opportunity.findById(application.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    if (opportunity.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    application.status = newStatus;
    await application.save();

    // 🔔 Notify Student
    await createNotification({
      collegeId: opportunity.collegeId,
      recipient: application.studentId,
      title: `Application ${newStatus}`,
      message: `Your application for "${opportunity.title}" has been updated to: ${newStatus}`,
      type: newStatus === "Rejected" ? "error" : "success",
      link: "/applications",
      eventName: "application_status_update",
      socketData: {
        jobTitle: opportunity.title,
        newStatus: newStatus
      }
    });

    res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

// Get applications for a specific opportunity
exports.getApplicationsByOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    // Verify this resource belongs to the requesting company
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    if (req.user.role !== 'admin' && opportunity.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const applications = await Application.find({ opportunityId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const StudentProfile = require("../models/StudentProfile");

    const studentIds = applications.map(a => a.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } })
      .select("userId resumePath skills branch year cgpa").lean();
    const profileMap = Object.fromEntries(profiles.map(p => [p.userId.toString(), p]));

    const enrichedApplications = applications.map(app => ({
      ...app,
      studentProfile: profileMap[app.studentId?._id?.toString()] || null
    }));

    res.status(200).json({
      count: enrichedApplications.length,
      applications: enrichedApplications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// Get all applications for the logged-in student
exports.getStudentApplications = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const studentId = req.user.id;
    const Project = require("../models/Project");

    // 1. Fetch Opportunity Applications with pagination
    const [applications, projectsList] = await Promise.all([
      Application.find({ studentId })
        .populate({ path: "opportunityId", populate: { path: "createdBy", select: "name" } })
        .sort({ createdAt: -1 })
        .lean(),
      Project.find({ "applicants.student": studentId })
        .populate("createdBy", "name")
        .lean()
    ]);

    // 2. Format Opportunities
    const formattedApps = applications.map(app => ({
      _id: app._id,
      title: app.opportunityId?.title || "Unknown Opportunity",
      company: app.opportunityId?.createdBy?.name || "Institution Partner",
      status: app.status,
      type: "Corporate Opportunity",
      appliedAt: app.createdAt
    }));

    // 3. Format Projects
    const formattedProjects = projectsList.map(p => {
      const applicant = p.applicants.find(a => a.student.toString() === studentId);
      return {
        _id: p._id,
        title: p.title,
        company: p.createdBy?.name || "Faculty Supervisor",
        status: applicant?.status || "Pending",
        type: "Research Project",
        appliedAt: applicant?.appliedAt || p.createdAt
      };
    });

    // 4. Merge, Sort, Paginate
    const all = [...formattedApps, ...formattedProjects].sort((a, b) =>
      new Date(b.appliedAt) - new Date(a.appliedAt)
    );
    const total = all.length;
    const paginated = all.slice(skip, skip + limit);

    res.status(200).json({
      applications: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};


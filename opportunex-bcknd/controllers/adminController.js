const User = require("../models/User");
const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");
const Setting = require("../models/Setting");
const { createNotification } = require("./notificationController");

/* ================= COMPANY APPROVALS ================= */

exports.getPendingCompanies = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const companies = await User.find({ role: "company", status: "pending", collegeId });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch companies" });
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    await createNotification({
      collegeId: user.collegeId,
      recipient: user._id,
      title: "Account Approved",
      message: "Your company account has been approved. You can now post opportunities.",
      type: "success",
      link: "/dashboard",
      eventName: "account_update"
    });
    res.json({ message: "Company approved" });
  } catch (err) {
    res.status(500).json({ message: "Approve company failed" });
  }
};

exports.rejectCompany = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ message: "Company rejected" });
  } catch (err) {
    res.status(500).json({ message: "Reject company failed" });
  }
};

/* ================= FACULTY APPROVALS ================= */

exports.getPendingFaculty = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const faculty = await User.find({ role: "faculty", status: "pending", collegeId });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch faculty" });
  }
};

exports.approveFaculty = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    await createNotification({
      collegeId: user.collegeId,
      recipient: user._id,
      title: "Account Approved",
      message: "Your faculty account has been approved. You can now manage projects.",
      type: "success",
      link: "/dashboard",
      eventName: "account_update"
    });
    res.json({ message: "Faculty approved" });
  } catch (err) {
    res.status(500).json({ message: "Approve faculty failed" });
  }
};

exports.rejectFaculty = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ message: "Faculty rejected" });
  } catch (err) {
    res.status(500).json({ message: "Reject faculty failed" });
  }
};

/* ================= DRIVE APPROVALS ================= */

exports.getPendingDrives = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const drives = await Opportunity.find({ collegeId, approvalStatus: "pending", isDeleted: false })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending drives" });
  }
};

exports.approveDrive = async (req, res) => {
  try {
    const drive = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "approved", rejectionReason: "" },
      { new: true }
    ).populate("createdBy", "name email");

    if (!drive) return res.status(404).json({ message: "Drive not found" });

    // Notify the company
    await createNotification({
      collegeId: drive.collegeId,
      recipient: drive.createdBy._id,
      title: "Placement Drive Approved",
      message: `Your drive "${drive.title}" has been approved and is now live for students.`,
      type: "success",
      link: "/dashboard",
      eventName: "drive_approved"
    });

    res.json({ message: "Drive approved", drive });
  } catch (err) {
    res.status(500).json({ message: "Approve drive failed" });
  }
};

exports.rejectDrive = async (req, res) => {
  try {
    const { reason } = req.body;
    const drive = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "rejected", rejectionReason: reason || "" },
      { new: true }
    ).populate("createdBy", "name email");

    if (!drive) return res.status(404).json({ message: "Drive not found" });

    await createNotification({
      collegeId: drive.collegeId,
      recipient: drive.createdBy._id,
      title: "Placement Drive Rejected",
      message: `Your drive "${drive.title}" was not approved.${reason ? " Reason: " + reason : ""}`,
      type: "error",
      link: "/dashboard",
      eventName: "drive_rejected"
    });

    res.json({ message: "Drive rejected", drive });
  } catch (err) {
    res.status(500).json({ message: "Reject drive failed" });
  }
};

/* ================= OPPORTUNITIES ================= */

exports.getAllOpportunities = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const opportunities = await Opportunity.find({ collegeId, isDeleted: false })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // Attach applicant count per drive
    const withCounts = await Promise.all(
      opportunities.map(async (opp) => {
        const count = await Application.countDocuments({ opportunityId: opp._id });
        return { ...opp.toObject(), applicantCount: count };
      })
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch opportunities" });
  }
};

exports.disableOpportunity = async (req, res) => {
  try {
    const op = await Opportunity.findById(req.params.id);
    if (!op) return res.status(404).json({ message: "Opportunity not found" });
    op.status = op.status === "Active" ? "Closed" : "Active";
    await op.save();
    res.json({ message: "Opportunity status updated" });
  } catch (err) {
    res.status(500).json({ message: "Toggle opportunity failed" });
  }
};

/* ================= DASHBOARD COUNTS ================= */

exports.getCounts = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const [students, faculty, companies, opportunities, applications] = await Promise.all([
      User.countDocuments({ role: "student", collegeId }),
      User.countDocuments({ role: "faculty", collegeId }),
      User.countDocuments({ role: "company", collegeId }),
      Opportunity.countDocuments({ collegeId, isDeleted: false }),
      Application.countDocuments({})  // All apps — opportunity scoped below
    ]);

    // Scope applications to this college via opportunities
    const oppIds = await Opportunity.find({ collegeId }).distinct("_id");
    const collegeApplications = await Application.countDocuments({ opportunityId: { $in: oppIds } });

    res.json({ students, faculty, companies, opportunities, applications: collegeApplications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch counts" });
  }
};

exports.getPendingCounts = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const [pendingDrives, pendingAccounts, newApplications] = await Promise.all([
      Opportunity.countDocuments({ collegeId, approvalStatus: "pending", isDeleted: false }),
      User.countDocuments({ collegeId, status: "pending", role: { $in: ["company", "faculty"] } }),
      Application.countDocuments({ collegeId, status: "Applied" })
    ]);
    res.json({ pendingDrives, pendingAccounts, newApplications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending counts" });
  }
};

/* ================= ALL APPLICATIONS (Admin View) ================= */

exports.getAllApplications = async (req, res) => {
  try {
    const { collegeId } = req.user;

    // Get all opportunities in this college
    const oppIds = await Opportunity.find({ collegeId, isDeleted: false }).distinct("_id");

    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate("studentId", "name email")
      .populate({
        path: "opportunityId",
        select: "title type approvalStatus",
        populate: { path: "createdBy", select: "name" }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* ================= USERS ================= */

exports.getAllUsers = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const users = await User.find({ collegeId }).select("-password").lean();

    const StudentProfile = require("../models/StudentProfile");
    const CompanyProfile = require("../models/CompanyProfile");

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        if (user.role === "student") {
          const profile = await StudentProfile.findOne({ userId: user._id }).select("mobile");
          if (profile && profile.mobile) {
            user.mobile = profile.mobile;
          }
        } else if (user.role === "company") {
          const profile = await CompanyProfile.findOne({ userId: user._id }).select("companyName website contactNumber");
          if (profile) {
            if (profile.companyName) user.companyName = profile.companyName;
            if (profile.website) user.website = profile.website;
            if (profile.contactNumber) user.mobile = profile.contactNumber;
          }
        }
        return user;
      })
    );

    res.json(enrichedUsers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, mobile, companyName, website } = req.body;

    const userPayload = {};
    if (name) userPayload.name = name;
    if (email) userPayload.email = email;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      userPayload,
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "student") {
      const StudentProfile = require("../models/StudentProfile");
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        { mobile },
        { new: true, upsert: true }
      );
    } else if (user.role === "company") {
      const CompanyProfile = require("../models/CompanyProfile");
      const companyPayload = {};
      if (companyName) companyPayload.companyName = companyName;
      if (mobile) companyPayload.contactNumber = mobile;
      if (website) companyPayload.website = website;

      await CompanyProfile.findOneAndUpdate(
        { userId: user._id },
        companyPayload,
        { new: true, upsert: true }
      );
    }

    res.json({ success: true, message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot deactivate yourself" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deactivated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to deactivate user" });
  }
};

exports.reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    await createNotification({
      collegeId: user.collegeId,
      recipient: user._id,
      title: "Account Reactivated",
      message: "Your account has been reactivated by the administrator. You can now log in.",
      type: "success",
      link: "/",
      eventName: "account_update"
    });

    res.json({ message: "User reactivated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to reactivate user" });
  }
};

/* ================= SETTINGS ================= */

exports.getSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({});
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) setting = new Setting({});

    const allowedKeys = [
      "studentRegistration", "companyRegistration", "facultyRegistration",
      "placementEnabled", "trainingEnabled", "recruitersVisible", "showAnalytics",
    ];

    allowedKeys.forEach(key => {
      if (req.body[key] !== undefined) setting[key] = req.body[key];
    });

    await setting.save();
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: "Failed to update settings" });
  }
};

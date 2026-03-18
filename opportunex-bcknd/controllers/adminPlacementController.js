const PlacementOverview = require("../models/PlacementOverview");
const PlacementObjective = require("../models/PlacementObjective");
const PlacementProcess = require("../models/PlacementProcess");
const PlacementStat = require("../models/PlacementStat");
const TrainingActivity = require("../models/TrainingActivity");
const PlacementReport = require("../models/PlacementReport");
const Recruiter = require("../models/Recruiter");
const IndustryCollaboration = require("../models/IndustryCollaboration");
const TpoContact = require("../models/TpoContact");
const AuditLog = require("../models/AuditLog");
const paginate = require("../utils/paginate");

/* ================= OVERVIEW ================= */

exports.getOverview = async (req, res) => {
  const data = await PlacementOverview.findOne({
    collegeId: req.user.collegeId,
  });
  res.json(data);
};

exports.upsertOverview = async (req, res) => {
  const existing = await PlacementOverview.findOne({
    collegeId: req.user.collegeId,
  });

  const updated = await PlacementOverview.findOneAndUpdate(
    { collegeId: req.user.collegeId },
    { ...req.body, updatedBy: req.user.id },
    { new: true, upsert: true }
  );

  await AuditLog.create({
    adminId: req.user.id,
    collegeId: req.user.collegeId,
    module: "PlacementOverview",
    action: existing ? "UPDATE" : "CREATE",
    recordId: updated._id,
    oldValue: existing,
    newValue: updated,
  });

  res.json(updated);
};

/* ================= OBJECTIVES ================= */

exports.getObjectives = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { collegeId: req.user.collegeId };
  const [data, total] = await Promise.all([
    PlacementObjective.find(filter).skip(skip).limit(limit).lean(),
    PlacementObjective.countDocuments(filter)
  ]);
  res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
};

exports.addObjective = async (req, res) => {
  const created = await PlacementObjective.create({
    collegeId: req.user.collegeId,
    updatedBy: req.user.id,
    objective: req.body.objective,
  });

  await AuditLog.create({
    adminId: req.user.id,
    collegeId: req.user.collegeId,
    module: "PlacementObjective",
    action: "CREATE",
    recordId: created._id,
    oldValue: null,
    newValue: created,
  });

  res.status(201).json(created);
};

exports.deleteObjective = async (req, res) => {
  const deleted = await PlacementObjective.findOneAndDelete({
    _id: req.params.id,
    collegeId: req.user.collegeId,
  });

  await AuditLog.create({
    adminId: req.user.id,
    collegeId: req.user.collegeId,
    module: "PlacementObjective",
    action: "DELETE",
    recordId: deleted?._id,
    oldValue: deleted,
    newValue: null,
  });

  res.json({ message: "Objective deleted" });
};

/* ================= PROCESS ================= */

exports.getProcess = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { collegeId: req.user.collegeId };
  const [data, total] = await Promise.all([
    PlacementProcess.find(filter).sort({ stepNumber: 1 }).skip(skip).limit(limit).lean(),
    PlacementProcess.countDocuments(filter)
  ]);
  res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
};

exports.upsertProcess = async (req, res) => {
  const existing = await PlacementProcess.findOne({
    collegeId: req.user.collegeId,
    stepNumber: req.body.stepNumber,
  });

  const updated = await PlacementProcess.findOneAndUpdate(
    { collegeId: req.user.collegeId, stepNumber: req.body.stepNumber },
    { ...req.body, updatedBy: req.user.id },
    { new: true, upsert: true }
  );

  await AuditLog.create({
    adminId: req.user.id,
    collegeId: req.user.collegeId,
    module: "PlacementProcess",
    action: existing ? "UPDATE" : "CREATE",
    recordId: updated._id,
    oldValue: existing,
    newValue: updated,
  });

  res.json(updated);
};

exports.deleteProcess = async (req, res) => {
  const deleted = await PlacementProcess.findOneAndDelete({
    _id: req.params.id,
    collegeId: req.user.collegeId,
  });

  await AuditLog.create({
    adminId: req.user.id,
    collegeId: req.user.collegeId,
    module: "PlacementProcess",
    action: "DELETE",
    recordId: deleted?._id,
    oldValue: deleted,
    newValue: null,
  });

  res.json({ message: "Process step deleted" });
};

/* ================= STATS ================= */

exports.getStats = async (req, res) => {
  res.json(await PlacementStat.find({ collegeId: req.user.collegeId }));
};

exports.upsertStat = async (req, res) => {
  const existing = await PlacementStat.findOne({
    collegeId: req.user.collegeId,
    academicYear: req.body.academicYear,
  });

  const updated = await PlacementStat.findOneAndUpdate(
    {
      collegeId: req.user.collegeId,
      academicYear: req.body.academicYear,
    },
    {
      ...req.body,
      deptWisePlaced: req.body.deptWisePlaced || {},
      updatedBy: req.user.id,
    },
    { new: true, upsert: true }
  );

  await AuditLog.create({
    adminId: req.user.id,
    collegeId: req.user.collegeId,
    module: "PlacementStat",
    action: existing ? "UPDATE" : "CREATE",
    recordId: updated._id,
    oldValue: existing,
    newValue: updated,
  });

  res.json(updated);
};

exports.deleteStat = async (req, res) => {
  const deleted = await PlacementStat.findOneAndDelete({
    _id: req.params.id,
    collegeId: req.user.collegeId,
  });

  await AuditLog.create({
    adminId: req.user.id,
    collegeId: req.user.collegeId,
    module: "PlacementStat",
    action: "DELETE",
    recordId: deleted?._id,
    oldValue: deleted,
    newValue: null,
  });

  res.json({ message: "Stat deleted" });
};

/* ================= TRAININGS ================= */

exports.getTrainings = async (req, res) => {
  res.json(
    await TrainingActivity.find({ collegeId: req.user.collegeId }).sort({
      date: -1,
    })
  );
};

exports.addTraining = async (req, res) => {
  const { title, date, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ message: "Title and date are required" });
  }

  const created = await TrainingActivity.create({
    title,
    description: description || "",
    date: new Date(date),
    category: "Training",
    collegeId: req.user.collegeId,
    updatedBy: req.user.id,
  });

  res.status(201).json(created);
};

exports.deleteTraining = async (req, res) => {
  await TrainingActivity.findOneAndDelete({
    _id: req.params.id,
    collegeId: req.user.collegeId,
  });

  res.json({ message: "Training deleted" });
};

exports.updateTraining = async (req, res) => {
  try {
    const { title, date, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    const updated = await TrainingActivity.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      {
        title,
        date: new Date(date),
        description: description || "",
        updatedBy: req.user.id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update training error:", err);
    res.status(500).json({ message: "Failed to update training" });
  }
};

/* ================= REPORTS ================= */

exports.getReports = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { collegeId: req.user.collegeId };
  const [data, total] = await Promise.all([
    PlacementReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    PlacementReport.countDocuments(filter)
  ]);
  res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
};

exports.addReport = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const { title, academicYear } = req.body;

    if (!title || !academicYear) {
      return res.status(400).json({ message: "Title and academic year are required" });
    }

    const created = await PlacementReport.create({
      title,
      academicYear,
      reportFileUrl: `/uploads/reports/${req.file.filename}`,
      collegeId: req.user.collegeId,
      updatedBy: req.user.id,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Add report error:", err);
    res.status(500).json({ message: "Failed to add report" });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { title, academicYear } = req.body;

    if (!title || !academicYear) {
      return res.status(400).json({ message: "Title and academic year are required" });
    }

    const updated = await PlacementReport.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      {
        title,
        academicYear,
        updatedBy: req.user.id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update report error:", err);
    res.status(500).json({ message: "Failed to update report" });
  }
};

exports.deleteReport = async (req, res) => {
  await PlacementReport.findOneAndDelete({
    _id: req.params.id,
    collegeId: req.user.collegeId,
  });

  res.json({ message: "Report deleted" });
};

exports.updateReport = async (req, res) => {
  try {
    const { title, academicYear } = req.body;

    if (!title || !academicYear) {
      return res.status(400).json({ message: "Title and academic year are required" });
    }

    const updated = await PlacementReport.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      {
        title,
        academicYear,
        updatedBy: req.user.id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update report error:", err);
    res.status(500).json({ message: "Failed to update report" });
  }
};

/* ================= RECRUITERS ================= */

exports.getRecruiters = async (req, res) => {
  res.json(await Recruiter.find({ collegeId: req.user.collegeId }));
};

exports.addRecruiter = async (req, res) => {
  const { companyName, role, package: pkg, description } = req.body;

  const created = await Recruiter.create({
    companyName,
    role: role || "-",
    package: pkg || "-",
    description: description || "",
    collegeId: req.user.collegeId,
    updatedBy: req.user.id,
  });

  res.status(201).json(created);
};

exports.deleteRecruiter = async (req, res) => {
  await Recruiter.findOneAndDelete({
    _id: req.params.id,
    collegeId: req.user.collegeId,
  });

  res.json({ message: "Recruiter deleted" });
};


exports.updateRecruiter = async (req, res) => {
  try {
    const { companyName, role, package: pkg, description } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const updated = await Recruiter.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      {
        companyName,
        role: role || "-",
        package: pkg || "-",
        description: description || "",
        updatedBy: req.user.id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    await AuditLog.create({
      adminId: req.user.id,
      collegeId: req.user.collegeId,
      module: "Recruiter",
      action: "UPDATE",
      recordId: updated._id,
      newValue: updated,
    });

    res.json(updated);
  } catch (err) {
    console.error("Update recruiter error:", err);
    res.status(500).json({ message: "Failed to update recruiter" });
  }
};

/* ================= COLLABORATIONS ================= */

exports.getCollaborations = async (req, res) => {
  res.json(await IndustryCollaboration.find({ collegeId: req.user.collegeId }));
};

exports.addCollaboration = async (req, res) => {
  const { organization, type, description } = req.body; // ✅ ADDED description

  if (!organization || !type) {
    return res.status(400).json({ message: "Organization and type required" });
  }

  const created = await IndustryCollaboration.create({
    organizationName: organization,
    purpose: type,
    description: description || "", // ✅ ADDED this line
    collegeId: req.user.collegeId,
    updatedBy: req.user.id,
  });

  res.status(201).json(created);
};

exports.deleteCollaboration = async (req, res) => {
  await IndustryCollaboration.findOneAndDelete({
    _id: req.params.id,
    collegeId: req.user.collegeId,
  });

  res.json({ message: "Collaboration deleted" });
};

exports.updateCollaboration = async (req, res) => {
  try {
    const { organization, type, description } = req.body;

    if (!organization || !type) {
      return res.status(400).json({ message: "Organization and type are required" });
    }

    const updated = await IndustryCollaboration.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      {
        organizationName: organization,
        purpose: type,
        description: description || "",
        updatedBy: req.user.id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Collaboration not found" });
    }

    await AuditLog.create({
      adminId: req.user.id,
      collegeId: req.user.collegeId,
      module: "IndustryCollaboration",
      action: "UPDATE",
      recordId: updated._id,
      newValue: updated,
    });

    res.json(updated);
  } catch (err) {
    console.error("Update collaboration error:", err);
    res.status(500).json({ message: "Failed to update collaboration" });
  }
};

/* ================= TPO CONTACTS ================= */

exports.getContacts = async (req, res) => {
  const contacts = await TpoContact.find({
    collegeId: req.user.collegeId,
  }).sort({ createdAt: -1 });

  res.json(contacts);
};

exports.addContact = async (req, res) => {
  const { name, role, email, phone } = req.body;

  if (!name || !role || !email || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const created = await TpoContact.create({
    name,
    role,
    email,
    phone,
    collegeId: req.user.collegeId,
    updatedBy: req.user.id,
  });

  res.status(201).json(created);
};

exports.deleteContact = async (req, res) => {
  await TpoContact.findOneAndDelete({
    _id: req.params.id,
    collegeId: req.user.collegeId,
  });

  res.json({ message: "Contact deleted" });
};

exports.updateContact = async (req, res) => {
  try {
    const { name, role, email, phone } = req.body;

    if (!name || !role || !email || !phone) {
      return res.status(400).json({
        message: "Name, role, email and phone are required",
      });
    }

    const updated = await TpoContact.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      {
        name,
        role,
        email,
        phone,
        updatedBy: req.user.id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update contact error:", err);
    res.status(500).json({ message: "Failed to update contact" });
  }
};
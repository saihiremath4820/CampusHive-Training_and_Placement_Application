const Project = require("../models/Project");
const { createNotification } = require("./notificationController");

exports.createProject = async (req, res) => {
    try {
        const { title, description, domain, duration, milestones } = req.body;
        const { id: userId, collegeId } = req.user;

        const project = await Project.create({
            title,
            description,
            domain,
            duration,
            milestones: milestones.map(m => ({ text: m })),
            createdBy: userId,
            collegeId
        });

        // 🔔 Notify Students
        await createNotification({
            collegeId,
            role: "student",
            title: "New Research Project",
            message: `Faculty has posted a new project: ${title}`,
            type: "info",
            link: "/teams"
        });

        res.status(201).json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: "Failed to create project", error: err.message });
    }
};

exports.getCollegeProjects = async (req, res) => {
    try {
        const { collegeId } = req.user;
        // console.log("Fetching projects for college:", collegeId);
        const projects = await Project.find({ collegeId, status: "Active" })
            .populate("createdBy", "name branch year")
            .populate("applicants.student", "name branch year")
            .sort({ createdAt: -1 }); // Added sort for better UX

        res.json(projects);
    } catch (err) {
        console.error("Fetch Projects Error:", err);
        res.status(500).json({ message: "Fetch failed" });
    }
};

exports.getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ createdBy: req.user.id })
            .populate("applicants.student", "name email branch year");
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: "Fetch failed" });
    }
};

exports.applyToProject = async (req, res) => {
    try {
        const { projectId } = req.body;
        const studentId = req.user.id;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const alreadyApplied = project.applicants.some(a => a.student.toString() === studentId);
        if (alreadyApplied) return res.status(400).json({ message: "Already applied" });

        project.applicants.push({ student: studentId });
        await project.save();

        await createNotification({
            collegeId: project.collegeId,
            recipient: project.createdBy,
            title: "New Project Application",
            message: "A student has applied to your project.",
            type: "info",
            link: "/dashboard" // Redirect to faculty dashboard
        });

        res.status(200).json({ message: "Applied successfully" });
    } catch (err) {
        res.status(500).json({ message: "Application failed", error: err.message });
    }
};

exports.updateProjectApplicationStatus = async (req, res) => {
    try {
        const { projectId, studentId, status, rejectionReason } = req.body;
        const project = await Project.findOne({ _id: projectId, createdBy: req.user.id });

        if (!project) return res.status(404).json({ message: "Project not found or unauthorized" });

        const applicant = project.applicants.find(a => a.student.toString() === studentId);
        if (!applicant) return res.status(404).json({ message: "Applicant not found" });

        applicant.status = status;
        if (rejectionReason) applicant.rejectionReason = rejectionReason;

        await project.save();

        await createNotification({
            collegeId: project.collegeId,
            recipient: studentId,
            title: `Project Application ${status}`,
            message: `Your application for "${project.title}" was ${status}.`,
            type: status === "Rejected" ? "error" : "success",
            link: "/projects"
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};

exports.getFacultyApplications = async (req, res) => {
    try {
        const StudentProfile = require("../models/StudentProfile");

        // Find all projects created by this faculty
        const projects = await Project.find({ createdBy: req.user.id })
            .populate("applicants.student", "name email");

        // Flatten the list: [Project] -> [Application]
        let rawApplications = [];
        projects.forEach(p => {
            p.applicants.forEach(app => {
                if (app.student) {
                    rawApplications.push({
                        projectId: p._id,
                        projectTitle: p.title,
                        projectDomain: p.domain || "",
                        projectDescription: p.description || "",
                        studentId: app.student._id,
                        name: app.student.name,
                        status: app.status,
                        rejectionReason: app.rejectionReason,
                        appliedAt: app.appliedAt
                    });
                }
            });
        });

        // Enrich each application with StudentProfile data (branch, year, skills, resume, cgpa)
        const allApplications = await Promise.all(
            rawApplications.map(async (app) => {
                const profile = await StudentProfile.findOne({ userId: app.studentId })
                    .select("branch year skills resumePath cgpa").lean();
                return {
                    ...app,
                    branch: profile?.branch || "N/A",
                    year: profile?.year || "N/A",
                    skills: profile?.skills || [],
                    resumePath: profile?.resumePath || null,
                    cgpa: profile?.cgpa || null
                };
            })
        );

        res.json(allApplications);
    } catch (err) {
        res.status(500).json({ message: "Fetch failed", error: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findOneAndDelete({ _id: id, createdBy: req.user.id });

        if (!project) return res.status(404).json({ message: "Project not found or unauthorized" });

        res.json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
};

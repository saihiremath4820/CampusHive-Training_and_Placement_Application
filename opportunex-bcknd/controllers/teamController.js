const Team = require("../models/Team");
const Project = require("../models/Project");

// Create a new Team
exports.createTeam = async (req, res) => {
    try {
        const { name, projectId, studentIds } = req.body;

        if (!name || !projectId || !studentIds || studentIds.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Verify project ownership
        const project = await Project.findOne({ _id: projectId, createdBy: req.user.id });
        if (!project) {
            return res.status(404).json({ message: "Project not found or unauthorized" });
        }

        const team = new Team({
            name,
            project: projectId,
            members: studentIds,
            createdBy: req.user.id
        });

        await team.save();

        res.status(201).json(team);
    } catch (err) {
        res.status(500).json({ message: "Failed to create team", error: err.message });
    }
};

// Get all teams for the faculty
exports.getMyTeams = async (req, res) => {
    try {
        const teams = await Team.find({ createdBy: req.user.id })
            .populate("project", "title")
            .populate("members", "name email branch year")
            .sort({ createdAt: -1 });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch teams", error: err.message });
    }
};

// Get all teams for a student
exports.getStudentTeams = async (req, res) => {
    try {
        const teams = await Team.find({ members: req.user.id })
            .populate("project", "title domain")
            .sort({ createdAt: -1 });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch student teams", error: err.message });
    }
};

// Get approved but unassigned students for a specific project
exports.getApprovedStudentsForProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // 1. Get the project and its approved applicants
        const project = await Project.findOne({ _id: projectId, createdBy: req.user.id })
            .populate("applicants.student", "name email branch year");

        if (!project) return res.status(404).json({ message: "Project not found" });

        const approvedApplicants = project.applicants
            .filter(app => app.status === "Approved")
            .map(app => app.student);

        // 2. Filter out students who are ALREADY in a team for this project
        // Find existing teams for this project
        const existingTeams = await Team.find({ project: projectId }).select("members");

        // Flatten array of member IDs already in teams
        const assignedStudentIds = existingTeams.flatMap(t => t.members.map(m => m.toString()));

        // 3. Return only unassigned students
        const availableStudents = approvedApplicants.filter(
            student => !assignedStudentIds.includes(student._id.toString())
        );

        res.json(availableStudents);

    } catch (err) {
        res.status(500).json({ message: "Fetch failed", error: err.message });
    }
};

// Evaluate a Team
exports.evaluateTeam = async (req, res) => {
    try {
        const { teamId, status, grade, feedback } = req.body;

        if (!teamId || !status || !grade || !feedback) {
            return res.status(400).json({ message: "Missing required evaluation fields" });
        }

        const team = await Team.findOne({ _id: teamId, createdBy: req.user.id });
        if (!team) {
            return res.status(404).json({ message: "Team not found or unauthorized" });
        }

        team.status = status;
        team.grade = grade;
        team.feedback = feedback;
        team.evaluatedAt = new Date();

        await team.save();

        res.json({ message: "Evaluation saved successfully", team });
    } catch (err) {
        res.status(500).json({ message: "Failed to save evaluation", error: err.message });
    }
};

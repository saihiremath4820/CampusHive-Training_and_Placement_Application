require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("./models/User");
const StudentProfile = require("./models/StudentProfile");
const CompanyProfile = require("./models/CompanyProfile");
const Opportunity = require("./models/Opportunity");
const Application = require("./models/Application");
const Project = require("./models/Project");
const Team = require("./models/Team");

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // All seeded users must be registered under the same College ID
        const collegeId = "PICT2028";

        // Clear all existing non-admin data
        await User.deleteMany({ role: { $ne: "admin" } });
        await StudentProfile.deleteMany({});
        await CompanyProfile.deleteMany({});
        await Opportunity.deleteMany({});
        await Application.deleteMany({});
        await Project.deleteMany({});
        await Team.deleteMany({});
        console.log("🧹 Cleared all existing non-admin data.");

        // HASH PASSWORDS
        const studentPassword = await bcrypt.hash("Student@123", 10);
        const companyPassword = await bcrypt.hash("Company@123", 10);
        const facultyPassword = await bcrypt.hash("Faculty@123", 10);

        // -----------------------------------------------------
        // 1. STUDENTS
        // -----------------------------------------------------
        const std1Id = new mongoose.Types.ObjectId();
        const std2Id = new mongoose.Types.ObjectId();
        const std3Id = new mongoose.Types.ObjectId();

        const std4Id = new mongoose.Types.ObjectId(); // deactivated student demo

        const students = [
            { _id: std1Id, name: "Rahul Sharma", email: "rahul@student.com", password: studentPassword, role: "student", status: "approved", collegeId },
            { _id: std2Id, name: "Priya Patel", email: "priya@student.com", password: studentPassword, role: "student", status: "approved", collegeId },
            { _id: std3Id, name: "Amit Desai", email: "amit@student.com", password: studentPassword, role: "student", status: "approved", collegeId },
            { _id: std4Id, name: "Test Deactivated", email: "deactivated@student.com", password: studentPassword, role: "student", status: "rejected", collegeId }
        ];

        const studentProfiles = [
            {
                userId: std1Id,
                fullName: "Rahul Sharma",
                email: "rahul@student.com",
                branch: "Computer Engineering",
                year: "Final Year",
                cgpa: "8.5",
                skills: ["React", "Node.js", "MongoDB", "JavaScript"],
                resumePath: "uploads/resumes/dummy.pdf"
            },
            {
                userId: std2Id,
                fullName: "Priya Patel",
                email: "priya@student.com",
                branch: "Information Technology",
                year: "Final Year",
                cgpa: "9.1",
                skills: ["Python", "Machine Learning", "TensorFlow", "Data Science"]
            },
            {
                userId: std3Id,
                fullName: "Amit Desai",
                email: "amit@student.com",
                branch: "Electronics Engineering",
                year: "Final Year",
                cgpa: "7.8",
                skills: ["C++", "Embedded Systems", "RTOS", "Automotive Protocols"]
            }
        ];

        await User.insertMany(students);
        await StudentProfile.insertMany(studentProfiles);
        console.log("✅ Seeded 3 Students");

        // -----------------------------------------------------
        // 2. COMPANIES
        // -----------------------------------------------------
        const comp1Id = new mongoose.Types.ObjectId();
        const comp2Id = new mongoose.Types.ObjectId();
        const comp3Id = new mongoose.Types.ObjectId(); // Pending company — demo admin approval

        const companies = [
            { _id: comp1Id, name: "TechCorp Solutions", email: "hr@techcorp.com", password: companyPassword, role: "company", status: "approved", collegeId, profileCompleted: true },
            { _id: comp2Id, name: "DataMinds AI", email: "recruit@dataminds.com", password: companyPassword, role: "company", status: "approved", collegeId, profileCompleted: true },
            { _id: comp3Id, name: "NewStartup Inc", email: "hello@newstartup.com", password: companyPassword, role: "company", status: "pending", collegeId, profileCompleted: false }  // ⚠️ Pending approval
        ];

        const companyProfiles = [
            { userId: comp1Id, companyName: "TechCorp Solutions", industry: "Information Technology", location: "Pune, Maharashtra", about: "Leading IT solutions company" },
            { userId: comp2Id, companyName: "DataMinds AI", industry: "Artificial Intelligence", location: "Bangalore, Karnataka", about: "AI and ML focused product company" }
        ];

        await User.insertMany(companies);
        await CompanyProfile.insertMany(companyProfiles);
        console.log("✅ Seeded 3 Companies (1 pending demo)");

        // -----------------------------------------------------
        // 3. FACULTY
        // -----------------------------------------------------
        const fac1Id = new mongoose.Types.ObjectId();
        const fac2Id = new mongoose.Types.ObjectId();

        const faculties = [
            {
                _id: fac1Id,
                name: "Dr. Sneha Kulkarni",
                email: "sneha@faculty.com",
                password: facultyPassword,
                role: "faculty",
                department: "Computer Engineering",
                position: "Associate Professor",
                status: "approved",
                collegeId
            },
            {
                _id: fac2Id,
                name: "Prof. Rajesh Mehta",
                email: "rajesh@faculty.com",
                password: facultyPassword,
                role: "faculty",
                department: "Information Technology",
                position: "Assistant Professor",
                status: "approved",
                collegeId
            }
        ];

        await User.insertMany(faculties);
        console.log("✅ Seeded 2 Faculty");

        // -----------------------------------------------------
        // 4. JOB OPPORTUNITIES
        // -----------------------------------------------------
        const job1Id = new mongoose.Types.ObjectId();
        const job2Id = new mongoose.Types.ObjectId();
        const job3Id = new mongoose.Types.ObjectId();
        const job4Id = new mongoose.Types.ObjectId();
        const job5Id = new mongoose.Types.ObjectId(); // pending drive demo
        const job6Id = new mongoose.Types.ObjectId(); // rejected drive demo

        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 30);

        const opportunities = [
            // ✅ APPROVED drives — visible to students
            { _id: job1Id, title: "Full Stack Developer", type: "Full-Time", location: "Pune", requiredSkills: ["React", "Node.js", "MongoDB"], requiredCGPA: 7.0, requiredDegree: "BE/B.Tech", description: "Build and maintain web applications", status: "Active", approvalStatus: "approved", deadline: deadlineDate, createdBy: comp1Id, collegeId },
            { _id: job2Id, title: "Backend Developer", type: "Full-Time", location: "Pune", requiredSkills: ["Node.js", "Express", "MongoDB"], requiredCGPA: 7.5, requiredDegree: "BE/B.Tech", description: "Design scalable backend systems", status: "Active", approvalStatus: "approved", deadline: deadlineDate, createdBy: comp1Id, collegeId },
            { _id: job3Id, title: "ML Engineer", type: "Full-Time", location: "Bangalore", requiredSkills: ["Python", "TensorFlow", "ML"], requiredCGPA: 7.5, requiredDegree: "BE/B.Tech", description: "Build and deploy ML models at scale", status: "Active", approvalStatus: "approved", deadline: deadlineDate, createdBy: comp2Id, collegeId },
            { _id: job4Id, title: "Embedded Systems Engineer", type: "Full-Time", location: "Pune", requiredSkills: ["C++", "RTOS", "Embedded Systems"], requiredCGPA: 6.5, requiredDegree: "BE/B.Tech", description: "Develop firmware for automotive systems", status: "Active", approvalStatus: "approved", deadline: deadlineDate, createdBy: comp2Id, collegeId },

            // ⏳ PENDING drive — awaiting admin approval (will NOT show to students)
            { _id: job5Id, title: "DevOps Engineer (Pending Approval)", type: "Full-Time", location: "Remote", requiredSkills: ["Docker", "Kubernetes", "CI/CD"], requiredCGPA: 7.0, requiredDegree: "BE/B.Tech", description: "Maintain cloud infrastructure", status: "Active", approvalStatus: "pending", deadline: deadlineDate, createdBy: comp2Id, collegeId },

            // ❌ REJECTED drive — admin rejected (NOT visible to students)
            { _id: job6Id, title: "Data Analyst (Rejected)", type: "Internship", location: "Pune", requiredSkills: ["SQL", "Excel", "Tableau"], requiredCGPA: 6.0, requiredDegree: "BE/B.Tech", description: "Analyse business data", status: "Active", approvalStatus: "rejected", rejectionReason: "Insufficient details provided. Please resubmit with proper JD.", deadline: deadlineDate, createdBy: comp1Id, collegeId }
        ];

        await Opportunity.insertMany(opportunities);
        console.log("✅ Seeded 6 Drives (4 approved, 1 pending, 1 rejected)");

        // -----------------------------------------------------
        // 5. APPLICATIONS
        // -----------------------------------------------------
        const applications = [
            { opportunityId: job1Id, studentId: std1Id, status: "Shortlisted" },  // Rahul -> Full Stack (shortlisted)
            { opportunityId: job3Id, studentId: std1Id, status: "Applied" },      // Rahul -> ML Eng
            { opportunityId: job3Id, studentId: std2Id, status: "Selected" },     // Priya -> ML Eng ✅ SELECTED DEMO
            { opportunityId: job1Id, studentId: std2Id, status: "Rejected" },     // Priya -> Full Stack (rejected)
            { opportunityId: job4Id, studentId: std3Id, status: "Applied" },      // Amit -> Embedded
            { opportunityId: job2Id, studentId: std3Id, status: "Applied" }       // Amit -> Backend
        ];

        await Application.insertMany(applications);
        console.log("✅ Seeded 6 Applications (1 Selected demo, 1 Shortlisted)");

        // -----------------------------------------------------
        // 6. PROJECTS & TEAMS (EVALUATIONS)
        // -----------------------------------------------------
        const proj1Id = new mongoose.Types.ObjectId();
        const proj2Id = new mongoose.Types.ObjectId();

        const projects = [
            {
                _id: proj1Id,
                title: "AI Powered Attendance System",
                description: "Face recognition based automated attendance",
                domain: "Python, OpenCV, Deep Learning",
                duration: "1 Semester",
                milestones: [
                    { text: "Data Collection", isCompleted: true },
                    { text: "Model Training", isCompleted: true },
                    { text: "Deployment", isCompleted: true }
                ],
                status: "Active",
                createdBy: fac1Id, // Assigned Faculty: Dr. Sneha Kulkarni
                collegeId,
                applicants: [
                    { student: std1Id, status: "Approved" },
                    { student: std2Id, status: "Approved" }
                ]
            },
            {
                _id: proj2Id,
                title: "Smart Campus IoT Dashboard",
                description: "Real time IoT sensor monitoring for campus",
                domain: "Node.js, MQTT, React, MongoDB",
                duration: "2 Semesters",
                milestones: [
                    { text: "Hardware Setup", isCompleted: false },
                    { text: "Backend API", isCompleted: false },
                    { text: "Frontend Dashboard", isCompleted: false }
                ],
                status: "Active",
                createdBy: fac2Id, // Assigned Faculty: Prof. Rajesh Mehta
                collegeId,
                applicants: [
                    { student: std3Id, status: "Approved" }
                ]
            }
        ];

        await Project.insertMany(projects);

        const teams = [
            {
                name: "AI Attendance Team",
                project: proj1Id,
                members: [std1Id, std2Id], // Rahul, Priya
                createdBy: fac1Id, // Assigned Faculty
                status: "Completed", // Evaluation info
                grade: "A (Very Good)",
                feedback: "Excellent implementation of face recognition with good documentation and on-time delivery.",
                evaluatedAt: new Date()
            },
            {
                name: "IoT Dashboard Team",
                project: proj2Id,
                members: [std3Id], // Amit
                createdBy: fac2Id, // Assigned Faculty
                status: "Ongoing"
            }
        ];

        await Team.insertMany(teams);
        console.log("✅ Seeded 2 Projects");
        console.log("✅ Seeded 1 Evaluation");

        console.log("🎉 Campus Hive database seeded successfully!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Seed failed:", err);
        mongoose.connection.close();
        process.exit(1);
    }
}

seedDatabase();

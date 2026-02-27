export const HARDCODED_OPPORTUNITIES = [
    {
        _id: "hc-job-1",
        title: "Embedded ADAS Engineer",
        type: "Full Time",
        location: "Pune, India (On-site)",
        status: "Active",
        applicantsCount: 42,
        requiredSkills: ["C/C++", "RTOS", "Automotive Protocols (CAN/LIN)", "Microcontrollers"],
        description: "Join our core engineering team to develop and integrate next-generation ADAS algorithms into embedded hardware."
    },
    {
        _id: "hc-job-2",
        title: "Deep Learning Engineer (Computer Vision)",
        type: "Full Time",
        location: "Pune, India",
        status: "Active",
        applicantsCount: 128,
        requiredSkills: ["Python", "PyTorch/TensorFlow", "Computer Vision", "Sensor Fusion"],
        description: "Work on cutting-edge object detection and classification models based on camera and radar sensor data."
    },
    {
        _id: "hc-job-3",
        title: "Field Testing & Validation Engineer",
        type: "Contract",
        location: "Pan India",
        status: "Closed",
        applicantsCount: 15,
        requiredSkills: ["Vehicle Testing", "Data Logging", "Analysis Tools", "Driving License (HMV)"],
        description: "Conduct rigorous field tests for our ADAS systems across diverse Indian road conditions."
    }
];

export const HARDCODED_ANALYTICS = {
    totalApplicants: 185,
    statusDistribution: [
        { status: "Active", count: 2 },
        { status: "Closed", count: 1 },
        { status: "Archived", count: 0 }
    ],
    applicationVelocity: [
        { date: "Feb 14", count: 5 },
        { date: "Feb 15", count: 12 },
        { date: "Feb 16", count: 25 },
        { date: "Feb 17", count: 18 },
        { date: "Feb 18", count: 32 },
        { date: "Feb 19", count: 28 },
        { date: "Feb 20", count: 45 }
    ],
    applicantPoolByRole: [
        { role: "Embedded ADAS Engineer", totalApplicants: 85 },
        { role: "Deep Learning Engineer (CV)", totalApplicants: 45 },
        { role: "Field Testing Engineer", totalApplicants: 30 },
        { role: "Systems Engineer", totalApplicants: 25 }
    ]
};

export const HARDCODED_APPLICANTS = [
    {
        _id: "app-1",
        name: "Aditya Kulkarni",
        email: "aditya.k@pict.edu",
        branch: "Computer Engineering",
        year: "4th Year",
        skills: ["Java", "Spring Boot", "SQL"],
        status: "Shortlisted",
        appliedDate: "2024-02-18"
    },
    {
        _id: "app-2",
        name: "Ananya Sharma",
        email: "ananya.s@vit.edu",
        branch: "IT",
        year: "3rd Year",
        skills: ["Python", "Django", "React"],
        status: "Pending",
        appliedDate: "2024-02-19"
    },
    {
        _id: "app-3",
        name: "Rohan Deshmukh",
        email: "rohan.d@coep.edu",
        branch: "AIDS",
        year: "4th Year",
        skills: ["Machine Learning", "FastAPI", "Docker"],
        status: "Rejected",
        appliedDate: "2024-02-17"
    }
];

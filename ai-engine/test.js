import { runAIEngine } from "./engine.js";

const student = {
  branch: "CSE",
  year: 2,
  cgpa: 8.1,
  skills: ["python", "machine learning"],
  courses: ["DSA", "DBMS"],
  projects: ["ML Project"],
  github: true
};

const project = {
  requiredSkills: ["python", "machine learning", "opencv"],
  minCGPA: 7.5,
  allowedBranches: ["CSE", "IT"],
  minYear: 2
};

console.log(
  JSON.stringify(runAIEngine(student, project), null, 2)
);

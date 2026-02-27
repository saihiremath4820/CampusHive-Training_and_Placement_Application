export function checkEligibility(student, project) {
  if (student.cgpa < project.minCGPA) {
    return { eligible: false, reason: "CGPA below requirement" };
  }

  if (!project.allowedBranches.includes(student.branch)) {
    return { eligible: false, reason: "Branch not allowed" };
  }

  if (student.year < project.minYear) {
    return { eligible: false, reason: "Year not eligible" };
  }

  return { eligible: true, reason: "Eligible" };
}

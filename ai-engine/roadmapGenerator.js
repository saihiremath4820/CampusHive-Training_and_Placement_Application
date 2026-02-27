export function generateRoadmap(missingSkills) {
  return missingSkills.map(skill => ({
    skill,
    steps: [
      `Learn fundamentals of ${skill}`,
      `Build 1 mini project using ${skill}`,
      `Add ${skill} project to resume`
    ],
   /* duration: "2–3 weeks" */
  }));
}

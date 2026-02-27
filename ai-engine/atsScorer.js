import { loadJson } from "./loadJson.js";

const courseSkillMap = loadJson("courseSkillMap.json");

export function atsScore(student) {
  let score = 0;

  score += Math.min(student.skills.length * 5, 40);

  student.courses?.forEach(course => {
    if (courseSkillMap[course]) score += 5;
  });

  if (student.projects?.length > 0) score += 20;
  if (student.github) score += 10;

  return Math.min(score, 100);
}

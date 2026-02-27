import { loadJson } from "./loadJson.js";

const skillOntology = loadJson("skillOntology.json");

export function matchSkills(studentSkills, requiredSkills) {
  const student = studentSkills.map(s => s.toLowerCase());

  const matched = [];
  const missing = [];

  for (const req of requiredSkills) {
    const r = req.toLowerCase();

    if (student.includes(r)) {
      matched.push(req);
      continue;
    }

    let similarFound = false;

    for (const [core, related] of Object.entries(skillOntology)) {
      if (r === core && related.some(s => student.includes(s))) {
        similarFound = true;
      }
      if (student.includes(core) && related.includes(r)) {
        similarFound = true;
      }
    }

    if (similarFound) matched.push(req);
    else missing.push(req);
  }

  return {
    matchedSkills: matched,
    missingSkills: missing,
    skillMatchPercentage: Math.round(
      (matched.length / requiredSkills.length) * 100
    )
  };
}

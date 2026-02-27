const SKILL_KEYWORDS = [
  "python",
  "java",
  "c++",
  "machine learning",
  "deep learning",
  "computer vision",
  "nlp",
  "react",
  "node",
  "mongodb",
  "sql",
  "dsa",
  "data structures",
  "algorithms"
];

export function extractResumeSkills(text) {
  const lowerText = text.toLowerCase();
  const extracted = [];

  for (const skill of SKILL_KEYWORDS) {
    if (lowerText.includes(skill)) {
      extracted.push(skill);
    }
  }

  // remove duplicates
  return [...new Set(extracted)];
}

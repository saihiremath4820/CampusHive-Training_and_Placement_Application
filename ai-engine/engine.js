import fs from "fs";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import pdf from "pdf-parse-fork";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ------------------------------------------------------------------ */
/*  LEGACY KEYWORD MATCHER  (Fallback — only used if Groq is down)     */
/*  Personalised: checks actual resume text vs student's known skills  */
/* ------------------------------------------------------------------ */
const ROLE_SKILLS = {
  ml: ["python", "machine learning", "ml", "data science", "sql", "git", "problem solving", "tensorflow", "keras", "pandas", "numpy", "scikit-learn"],
  frontend: ["javascript", "react", "html", "css", "git", "typescript", "tailwind", "next.js", "figma"],
  backend: ["node", "express", "sql", "mongodb", "api", "git", "docker", "redis", "postgresql"],
  devops: ["docker", "kubernetes", "ci/cd", "aws", "linux", "terraform", "ansible", "git"],
  "data-scientist": ["python", "machine learning", "statistics", "sql", "pandas", "tableau", "spark", "nlp"],
  "software-engineer": ["java", "c++", "python", "data structures", "algorithms", "git", "sql", "system design"],
  embedded: ["c", "c++", "microcontrollers", "rtos", "embedded linux", "arm", "uart", "spi", "i2c"]
};

async function keywordMatchingAnalysis(text, role, studentSkills = []) {
  const normalizedStudentSkills = studentSkills.map(s => s.toLowerCase());
  const roleSkills = ROLE_SKILLS[role] || ROLE_SKILLS["software-engineer"];

  let atsScore = 0;
  const extractedSkills = [];
  const missingSkills = [];
  const suggestions = [];

  for (const skill of roleSkills) {
    const inResume = text.includes(skill.toLowerCase());
    if (inResume) {
      atsScore += Math.floor(100 / roleSkills.length);
      extractedSkills.push(skill.toUpperCase());
    } else {
      const alreadyKnown = normalizedStudentSkills.some(s =>
        s.includes(skill) || skill.includes(s)
      );
      if (!alreadyKnown) {
        missingSkills.push(skill.toUpperCase());
        suggestions.push(
          `Your resume is missing ${skill.toUpperCase()} — add a dedicated Skills section or a project using it.`
        );
      } else {
        suggestions.push(
          `You know ${skill.toUpperCase()} but it's not visible in your resume — add it to your Skills section.`
        );
      }
    }
  }

  // Structural suggestions based on actual resume content
  if (!text.includes("project")) {
    suggestions.push("No projects section detected — add 2–3 projects with tech stack, impact metrics, and a GitHub link.");
  }
  if (!text.includes("github") && !text.includes("gitlab")) {
    suggestions.push("No GitHub/GitLab profile found — include your profile URL to show real work to recruiters.");
  }
  if (!text.includes("intern") && !text.includes("experience")) {
    suggestions.push("No internship or work experience detected — add any relevant experience, even freelance or college projects.");
  }
  if (text.length < 800) {
    suggestions.push("Resume seems thin — aim for a well-structured 1-page resume with clear sections: Summary, Skills, Projects, Education.");
  }

  if (atsScore > 100) atsScore = 100;

  return {
    atsScore,
    extractedSkills,
    missingSkills,
    suggestions: suggestions.slice(0, 6),
    mode: "LEGACY_KEYWORDS"
  };
}

/* ------------------------------------------------------------------ */
/*  GROQ AI — RESUME ANALYSIS  (Primary path)                          */
/* ------------------------------------------------------------------ */
async function groqAnalysis(resumeText, role, studentProfile = {}) {
  const knownSkills = Array.isArray(studentProfile.skills)
    ? studentProfile.skills.join(", ")
    : "None provided";

  const prompt = `You are an expert ATS resume analyzer for engineering campus placements in India.

STUDENT PROFILE:
- Branch: ${studentProfile.branch || "Engineering"}
- Year: ${studentProfile.year || "Final Year"}
- CGPA: ${studentProfile.cgpa || "Not specified"}
- Declared Skills: ${knownSkills}
- Target Role: ${role}

RESUME TEXT:
"""
${resumeText.substring(0, 4000)}
"""

Analyze this SPECIFIC resume for the target role "${role}".
Return ONLY valid JSON with this exact structure:

{
  "overallScore": <number 0-100, score this specific resume for role "${role}">,
  "verifiedSkills": ["skills actually found in the resume text above"],
  "missingSkills": ["skills important for ${role} that are NOT in the resume text above"],
  "optimizationSuggestions": [
    {
      "priority": "high",
      "suggestion": "specific suggestion referencing THIS resume content",
      "reason": "why this matters for ${role}"
    },
    {
      "priority": "medium",
      "suggestion": "another specific suggestion for this resume",
      "reason": "why this matters"
    },
    {
      "priority": "low",
      "suggestion": "another specific suggestion",
      "reason": "why this matters"
    }
  ],
  "strengths": ["specific strengths visible in this resume"],
  "resumeSummary": "2 sentence summary of what this specific resume demonstrates"
}

STRICT RULES:
1. Every suggestion must be SPECIFIC to this resume content — reference actual sections, projects, or missing items
2. verifiedSkills must only list skills you can actually see in the resume text
3. Never suggest skills already listed in verifiedSkills
4. overallScore must reflect actual fit for ${role}
5. Minimum 3 optimizationSuggestions, maximum 7
6. Return ONLY the JSON object — no other text`;

  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1500,
    response_format: { type: "json_object" }
  });

  const responseText = result.choices[0].message.content;
  const parsed = JSON.parse(responseText);

  if (typeof parsed.overallScore !== "number" || !Array.isArray(parsed.verifiedSkills)) {
    throw new Error("Incomplete Groq response — missing required fields");
  }

  return parsed;
}

/* ------------------------------------------------------------------ */
/*  MAIN ANALYZER                                                       */
/* ------------------------------------------------------------------ */
export async function analyzeResume(filePath, role = "software-engineer", studentProfile = {}) {
  try {
    let buffer;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      console.log(`☁️ Fetching resume from Cloudinary (remote): ${filePath}`);
      const res = await fetch(filePath);
      if (!res.ok) throw new Error(`Failed to fetch cloud file: ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = fs.readFileSync(filePath);
    }

    // Extract text from PDF
    let text = "";
    try {
      const data = await pdf(buffer);
      text = data.text.toLowerCase();
    } catch (e) {
      console.error("PDF Parse Error:", e);
      text = buffer.toString("utf-8").toLowerCase();
    }

    console.log(`📄 Resume text length: ${text.length} chars`);

    if (text.trim().length < 100) {
      console.warn("⚠️ Resume text too short — possibly a scanned/image PDF");
      return {
        atsScore: 0,
        extractedSkills: [],
        missingSkills: [],
        suggestions: [
          "Your resume appears to be a scanned image PDF — ATS systems cannot read it.",
          "Please re-upload your resume as a text-based PDF (created from Word, Google Docs, or LaTeX).",
          "Scanned resumes are automatically rejected by most company ATS systems."
        ],
        mode: "ERROR_SCANNED_PDF"
      };
    }

    // 1. Try Groq AI
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("🤖 Attempting Groq AI analysis...");
        const aiResult = await groqAnalysis(text, role, studentProfile);
        console.log("🧠 ENGINE RESULT: GROQ_AI | Score:", aiResult.overallScore);
        return {
          atsScore: aiResult.overallScore,
          extractedSkills: aiResult.verifiedSkills || [],
          missingSkills: aiResult.missingSkills || [],
          suggestions: aiResult.optimizationSuggestions || [],
          strengths: aiResult.strengths || [],
          resumeSummary: aiResult.resumeSummary || "",
          mode: "GROQ_AI"
        };
      } catch (groqErr) {
        console.error("Groq Failure:", groqErr.message);
        console.warn("⚠️ Groq failed — falling back to keyword analysis");
      }
    } else {
      console.warn("⚠️ No GROQ_API_KEY — using legacy keyword matcher");
    }

    // 2. Fallback to personalised keyword analysis
    const studentSkills = Array.isArray(studentProfile.skills) ? studentProfile.skills : [];
    return await keywordMatchingAnalysis(text, role, studentSkills);

  } catch (err) {
    console.error("ENGINE ERROR:", err);
    return {
      atsScore: 0,
      extractedSkills: [],
      missingSkills: [],
      suggestions: ["Resume could not be parsed. Please ensure it is a valid text-based PDF."],
      mode: "ERROR"
    };
  }
}

/* ------------------------------------------------------------------ */
/*  GROQ AI — SKILL MATCHING  (Student vs Project)                     */
/* ------------------------------------------------------------------ */
async function groqSkillMatching(student, project) {
  const prompt = `You are an expert recruiter evaluating a student for a project.

Student Skills: ${JSON.stringify(student.skills)}
Project Required Skills: ${JSON.stringify(project.requiredSkills)}
Project Description: "${project.description || "No description provided"}"

Return a JSON object ONLY with this exact structure:
{
  "matchScore": <number 0-100>,
  "matchedSkills": ["overlapping skills between student and project"],
  "missingSkills": ["required skills the student is missing"],
  "reasoning": "short explanation of the match score"
}`;

  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 500,
    response_format: { type: "json_object" }
  });

  const jsonText = result.choices[0].message.content;
  const data = JSON.parse(jsonText);
  return { ...data, mode: "GROQ_AI" };
}

/* ------------------------------------------------------------------ */
/*  STUDENT — PROJECT MATCHING                                          */
/* ------------------------------------------------------------------ */
export async function runAIEngine(student, project) {
  try {
    // 1. Try Groq matching
    if (process.env.GROQ_API_KEY) {
      try {
        const aiResult = await groqSkillMatching(student, project);
        if (aiResult) return aiResult;
      } catch (groqErr) {
        console.error("Groq Match Failure:", groqErr.message);
      }
    }

    // 2. Fallback to simple logic
    console.log("⚠️ Using Simple Matcher (No API Key or AI Failed)");
    const studentSkills = student?.skills || [];
    const projectSkills = project?.requiredSkills || [];

    const matched = [];
    const missing = [];
    const sSkills = studentSkills.map(s => s.toLowerCase());

    for (const req of projectSkills) {
      if (sSkills.includes(req.toLowerCase())) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    }

    const score = projectSkills.length > 0
      ? Math.round((matched.length / projectSkills.length) * 100)
      : 0;

    return {
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      mode: "SIMPLE_LOGIC"
    };

  } catch (err) {
    console.error("MATCHING ERROR:", err);
    return { error: "Matching failed", matchScore: 0, mode: "ERROR" };
  }
}

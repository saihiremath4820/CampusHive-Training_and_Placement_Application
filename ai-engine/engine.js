import fs from "fs";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import pdf from "pdf-parse-fork";

dotenv.config();

let groq;
try {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log('Groq SDK initialized successfully');
} catch (err) {
  console.error('Failed to initialize Groq SDK:', err.message);
  process.exit(1);
}

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

/* ------------------------------------------------------------------ */
/*  SHARED HELPER — PDF TEXT EXTRACTION                                 */
/* ------------------------------------------------------------------ */
async function extractPDFText(filePath) {
  let buffer;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    console.log(`☁️ Fetching resume from URL: ${filePath}`);
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = fs.readFileSync(filePath);
  }

  try {
    const data = await pdf(buffer);
    return data.text.toLowerCase();
  } catch (e) {
    console.error("PDF Parse Error:", e);
    return buffer.toString("utf-8").toLowerCase();
  }
}

/* ------------------------------------------------------------------ */
/*  COMPANY ATS — Resume vs Job Opening                                 */
/* ------------------------------------------------------------------ */
export async function analyzeResumeForJob(resumePath, studentProfile, opportunity) {
  const resumeText = await extractPDFText(resumePath);

  if (resumeText.trim().length < 100) {
    return {
      overallScore: 0,
      breakdown: { skillsMatch: 0, cgpaScore: 0, resumeRelevance: 0, profileScore: 0 },
      skillMatch: { matched: [], missing: opportunity.requiredSkills || [], extra: [] },
      cgpaCheck: { studentCGPA: studentProfile.cgpa || 0, requiredCGPA: opportunity.requiredCGPA || 0, meets: false },
      strengths: [],
      concerns: ["Resume appears to be a scanned/image PDF — text could not be extracted."],
      recommendation: "NO",
      summary: "Unable to analyze: the resume is a scanned image PDF that ATS systems cannot read. The student should re-upload a text-based PDF.",
      mode: "ERROR_SCANNED_PDF"
    };
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) for campus placements in India.
Evaluate this student's fit for the job opening below.

FAIRNESS RULES (STRICT — follow always):
- Evaluate fairly regardless of resume writing style or language quality
- Focus on WHAT they did not HOW they wrote it
- React, ReactJS, React.js = same skill. Node, Node.js, NodeJS = same skill.
- A student who built a React project HAS React skills even if written simply
- Give benefit of doubt for implied skills from project descriptions
- Do not penalize for simple or brief descriptions

JOB REQUIREMENTS:
Title: ${opportunity.title}
Description: ${opportunity.description}
Required Skills: ${(opportunity.requiredSkills || []).join(", ")}
Minimum CGPA: ${opportunity.requiredCGPA}
Required Degree: ${opportunity.requiredDegree}
Job Type: ${opportunity.type}

STUDENT PROFILE:
Branch: ${studentProfile.branch}
Year: ${studentProfile.year}
CGPA: ${studentProfile.cgpa}
Declared Skills: ${(studentProfile.skills || []).join(", ")}

RESUME TEXT:
"""
${resumeText.substring(0, 4000)}
"""

Return ONLY valid JSON — no explanation, no markdown:
{
  "overallScore": <0-100>,
  "breakdown": {
    "skillsMatch": <0-40>,
    "cgpaScore": <0-20>,
    "resumeRelevance": <0-25>,
    "profileScore": <0-15>
  },
  "skillMatch": {
    "matched": ["skills in resume AND required"],
    "missing": ["required skills NOT in resume"],
    "extra": ["bonus skills not required but valuable"]
  },
  "cgpaCheck": {
    "studentCGPA": <number>,
    "requiredCGPA": <number>,
    "meets": <true/false>
  },
  "strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1"],
  "recommendation": "STRONG_YES | YES | MAYBE | NO",
  "summary": "3 sentence fair assessment of candidate for this specific role"
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 1200,
    response_format: { type: "json_object" }
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return { ...parsed, mode: "GROQ_AI" };
}

/* ------------------------------------------------------------------ */
/*  FACULTY ATS — Resume vs Research Project                            */
/* ------------------------------------------------------------------ */
export async function analyzeResumeForProject(resumePath, studentProfile, project) {
  const resumeText = await extractPDFText(resumePath);

  if (resumeText.trim().length < 100) {
    return {
      fitScore: 0,
      breakdown: { domainRelevance: 0, skillAlignment: 0, academicStrength: 0, initiative: 0 },
      skills: { relevant: [], missing: [], transferable: [] },
      academicStrength: "NEEDS_SUPPORT",
      strengths: [],
      growthAreas: ["Resume appears to be a scanned/image PDF — text could not be extracted."],
      recommendation: "NOT_RECOMMENDED",
      summary: "Unable to analyze: the resume is a scanned image PDF. The student should re-upload a text-based PDF.",
      mode: "ERROR_SCANNED_PDF"
    };
  }

  const prompt = `You are an expert academic advisor evaluating a student for a research project.

FAIRNESS RULES (STRICT):
- Evaluate fairly regardless of writing style
- Focus on demonstrated skills and initiative
- Give benefit of doubt for implied or related skills
- Academic projects count as real experience for students

PROJECT DETAILS:
Title: ${project.title}
Domain: ${project.domain}
Description: ${project.description}

STUDENT PROFILE:
Branch: ${studentProfile.branch}
Year: ${studentProfile.year}
CGPA: ${studentProfile.cgpa}
Declared Skills: ${(studentProfile.skills || []).join(", ")}

RESUME TEXT:
"""
${resumeText.substring(0, 4000)}
"""

Return ONLY valid JSON — no explanation, no markdown:
{
  "fitScore": <0-100>,
  "breakdown": {
    "domainRelevance": <0-40>,
    "skillAlignment": <0-30>,
    "academicStrength": <0-20>,
    "initiative": <0-10>
  },
  "skills": {
    "relevant": ["student skills useful for project"],
    "missing": ["skills they would need to learn"],
    "transferable": ["skills that apply indirectly"]
  },
  "academicStrength": "STRONG | MODERATE | NEEDS_SUPPORT",
  "strengths": ["strength 1", "strength 2"],
  "growthAreas": ["area 1", "area 2"],
  "recommendation": "HIGHLY_RECOMMENDED | RECOMMENDED | CONDITIONAL | NOT_RECOMMENDED",
  "summary": "3 sentence academic assessment of student fit for this project"
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 1200,
    response_format: { type: "json_object" }
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return { ...parsed, mode: "GROQ_AI" };
}


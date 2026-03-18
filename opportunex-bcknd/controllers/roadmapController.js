const Roadmap = require('../models/Roadmap');
const axios = require('axios');

exports.generateRoadmap = async (req, res) => {
    try {
        const { missingSkills, targetRole, studentProfile, opportunityId } = req.body;

        if (!missingSkills || !Array.isArray(missingSkills) || missingSkills.length === 0) {
            return res.status(400).json({ success: false, message: "Missing skills array is required" });
        }

        const { branch, year, cgpa } = studentProfile || {};
        const role = targetRole || "software-engineer";

        // 1. Check Cache
        const sortedSkills = [...missingSkills].sort();

        // Find a valid unexpired roadmap with exact matching sorted skills, role, and student
        // For simplicity of caching, we consider exact match of missing skills logic
        const cachedRoadmap = await Roadmap.findOne({
            student: req.user.id,
            opportunityId: opportunityId || null,
            expiresAt: { $gt: new Date() }
        }).populate('opportunityId', 'title companyName');

        if (cachedRoadmap) {
            console.log('🔄 Returning cached roadmap');
            return res.json({ success: true, roadmapDoc: cachedRoadmap, roadmap: cachedRoadmap.roadmap });
        }

        // 2. Prepare prompt
        const prompt = `You are a career counselor for engineering students in India.
  
Student Profile:
- Branch: ${branch || 'Engineering'}
- Year: ${year || 'Any'}
- Target Role: ${role}
- Missing Skills: ${missingSkills.join(', ')}

Generate a personalized learning roadmap for each missing skill.
You must absolutely include REAL, CLICKABLE, HIGH-QUALITY RESOURCES. Provide actual URLs to YouTube (e.g. FreeCodeCamp, Programming with Mosh, NPTEL, CS50), Udemy, or official documentation. DO NOT return blank URLs. Do NOT return placeholders like "https://youtube.com". Be specific.

Return ONLY valid JSON:
{
  "roadmap": [
    {
      "skill": "skill name",
      "priority": "high|medium|low",
      "estimatedHours": 20,
      "resources": [
        {
          "title": "Specific Course/Video Name",
          "type": "course|tutorial|documentation|book",
          "platform": "YouTube|Udemy|NPTEL|Coursera",
          "url": "https://actual-link-to-the-resource.com",
          "duration": "X hours"
        }
      ],
      "projects": [
        {
          "title": "project name",
          "description": "what to build",
          "difficulty": "beginner|intermediate|advanced"
        }
      ]
    }
  ]
}`;

        // 3. Extract the roadmap directly with Groq
        let aiRoadmapData;

        try {
            const Groq = require('groq-sdk');
            const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: "You strictly return valid JSON output only." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.2, // low temperature to avoid hallucinated fake URLs
                response_format: { type: "json_object" }
            });

            const text = completion.choices[0]?.message?.content;
            aiRoadmapData = JSON.parse(text);
        } catch (e) {
            console.error("Groq generation failed directly, sending fallback.", e);
            aiRoadmapData = generateFallback(missingSkills);
        }

        if (!aiRoadmapData || !aiRoadmapData.roadmap) {
            throw new Error("Failed to parse roadmap from AI response");
        }

        // 4. Save to cache
        const savedRoadmap = await Roadmap.findOneAndUpdate(
            { student: req.user.id, opportunityId: opportunityId || null },
            { 
                missingSkills: sortedSkills, 
                targetRole: role, 
                roadmap: aiRoadmapData.roadmap,
                generatedAt: Date.now(),
                expiresAt: new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
            },
            { new: true, upsert: true }
        ).populate('opportunityId', 'title companyName');

        try {
            const { getIO } = require('../config/socket');
            getIO().to(req.user.id.toString()).emit('roadmap_ready', {
                type: 'roadmap_ready',
                message: 'Your skill roadmap has been generated',
                timestamp: new Date()
            });
        } catch(err) {
            console.error("Socket error on roadmap ready:", err.message);
        }

        // 5. Return Response
        res.json({
            success: true,
            roadmapDoc: savedRoadmap,
            roadmap: aiRoadmapData.roadmap
        });

    } catch (error) {
        console.error("❌ Roadmap generation error:", error);
        res.status(500).json({ success: false, message: "Failed to generate roadmap", error: error.message });
    }
};

exports.getRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ student: req.user.id })
            .populate('opportunityId', 'title companyName')
            .sort({ createdAt: -1 });
        res.json({ roadmaps });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch roadmaps", error: err.message });
    }
};


// Fallback mechanism just in case AI is completely down
const fallbackResourceUrls = {
    'javascript': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    'react': 'https://react.dev',
    'node': 'https://nodejs.org/en/docs',
    'python': 'https://docs.python.org/3',
    'mongodb': 'https://www.mongodb.com/docs',
    'sql': 'https://www.w3schools.com/sql',
    'typescript': 'https://www.typescriptlang.org/docs',
    'express': 'https://expressjs.com',
    'git': 'https://git-scm.com/doc',
    'docker': 'https://docs.docker.com',
    'css': 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    'html': 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    'default': 'https://developer.mozilla.org'
};

const getResourceUrl = (skill) => {
    const key = skill.toLowerCase();
    const match = Object.keys(fallbackResourceUrls).find(k => key.includes(k));
    return match ? fallbackResourceUrls[match] : fallbackResourceUrls['default'];
};

function generateFallback(missingSkills) {
    return {
        roadmap: missingSkills.map(skill => ({
            skill,
            priority: "high",
            estimatedHours: 20,
            resources: [{ title: `Learn ${skill} Docs`, type: "documentation", platform: "Official", url: getResourceUrl(skill), duration: "10 hours" }],
            projects: [{ title: `Basic ${skill} app`, description: `Implement ${skill}`, difficulty: "beginner" }]
        }))
    }
}

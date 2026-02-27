const Roadmap = require('../models/Roadmap');
const axios = require('axios');

exports.generateRoadmap = async (req, res) => {
    try {
        const { missingSkills, targetRole, studentProfile } = req.body;

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
            targetRole: role,
            missingSkills: { $all: sortedSkills, $size: sortedSkills.length },
            expiresAt: { $gt: new Date() }
        });

        if (cachedRoadmap) {
            console.log('🔄 Returning cached roadmap');
            return res.json({ success: true, roadmap: cachedRoadmap.roadmap });
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
        const newRoadmap = new Roadmap({
            student: req.user.id,
            missingSkills: sortedSkills,
            targetRole: role,
            roadmap: aiRoadmapData.roadmap
        });

        await newRoadmap.save();

        if (global.io) {
            global.io.to(req.user.id.toString()).emit('roadmap_ready', {
                type: 'roadmap_ready',
                message: 'Your skill roadmap has been generated',
                timestamp: new Date()
            });
        }

        // 5. Return Response
        res.json({
            success: true,
            roadmap: aiRoadmapData.roadmap
        });

    } catch (error) {
        console.error("❌ Roadmap generation error:", error);
        res.status(500).json({ success: false, message: "Failed to generate roadmap", error: error.message });
    }
};


// Fallback mechanism just in case AI is completely down
function generateFallback(missingSkills) {
    return {
        roadmap: missingSkills.map(skill => ({
            skill,
            priority: "high",
            estimatedHours: 20,
            resources: [{ title: `Learn ${skill} Docs`, type: "documentation", platform: "Official", url: "#", duration: "10 hours" }],
            projects: [{ title: `Basic ${skill} app`, description: `Implement ${skill}`, difficulty: "beginner" }]
        }))
    }
}

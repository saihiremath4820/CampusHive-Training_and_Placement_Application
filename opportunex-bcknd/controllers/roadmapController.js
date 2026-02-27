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
Return ONLY valid JSON:
{
  "roadmap": [
    {
      "skill": "skill name",
      "priority": "high|medium|low",
      "estimatedHours": number,
      "resources": [
        {
          "title": "resource name",
          "type": "course|tutorial|documentation|book",
          "platform": "platform name",
          "url": "real URL if known",
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

        // 3. Call Groq API via standard HTTP endpoint, matching typical LLM chat completion structures
        // Using axios direct POST to the specified Groq API endpoint
        // Fallback: If local proxy exists, use it. Otherwise direct to groq.

        let aiRoadmapData;

        // Check if groq sdk was installed and try to use it
        let Groq;
        try {
            Groq = require('groq-sdk');
        } catch (e) {
            // Ignored
        }

        if (Groq && process.env.GROQ_API_KEY) {
            console.log('Using official Groq SDK');
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You strictly return valid JSON output only." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            const text = completion.choices[0]?.message?.content;
            try {
                aiRoadmapData = JSON.parse(text);
            } catch (e) {
                throw new Error("Invalid JSON returned from Groq SDK");
            }
        } else {
            console.log('Falling back to direct HTTP or local proxy');
            // We can use the Local proxy logic requested if API key is in other service
            // The user mentioned: Groq API base URL: http://localhost:5001/groq
            try {
                const aiResponse = await axios.post('http://localhost:5001/groq/chat', { prompt, format: 'json' }, { timeout: 30000 });
                aiRoadmapData = aiResponse.data.roadmap ? aiResponse.data : JSON.parse(aiResponse.data.text || '{}');
            } catch (proxyError) {
                console.log('Proxy failed, building fallback static roadmap');
                aiRoadmapData = generateFallback(missingSkills);
            }
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

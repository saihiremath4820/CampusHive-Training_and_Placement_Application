const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opportunityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity'
    },
    missingSkills: [{
        type: String
    }],
    targetRole: String,
    roadmap: [mongoose.Schema.Types.Mixed],
    generatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
});

roadmapSchema.index({ student: 1, opportunityId: 1 }, { unique: true });
// TTL index to automatically delete expired documents
roadmapSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Roadmap', roadmapSchema);

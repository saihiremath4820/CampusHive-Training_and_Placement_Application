const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentRegistration: { type: Boolean, default: true },
    companyRegistration: { type: Boolean, default: true },
    facultyRegistration: { type: Boolean, default: true },
    placementEnabled: { type: Boolean, default: true },
    trainingEnabled: { type: Boolean, default: true },
    recruitersVisible: { type: Boolean, default: true },
    showAnalytics: { type: Boolean, default: true },
}, { timestamps: true });

settingSchema.index({ collegeId: 1 });

module.exports = mongoose.model("Setting", settingSchema);

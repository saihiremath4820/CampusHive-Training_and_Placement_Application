const mongoose = require("mongoose");

const CompanyProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        companyName: {
            type: String,
            default: ""
        },
        industry: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        contactNumber: {
            type: String,
            default: ""
        },
        website: {
            type: String,
            default: ""
        },
        about: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("CompanyProfile", CompanyProfileSchema);

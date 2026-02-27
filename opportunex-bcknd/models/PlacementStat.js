const mongoose = require("mongoose");

const placementStatSchema = new mongoose.Schema(
  {
    // 🏫 College isolation
    collegeId: {
      type: String,
      required: true,
    },

    // 👤 Admin who added/updated
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📅 Academic year (e.g. 2023-24)
    academicYear: {
      type: String,
      required: true,
    },

    // 📊 Overall numbers (Old fields for frontend compatibility)
    studentsEnrolled: { type: Number },
    studentsPlaced: { type: Number },
    placementPercentage: { type: Number },
    deptWisePlaced: { type: Map, of: Number, default: {} },
    averageSalary: { type: Number, default: null },
    medianSalary: { type: Number, default: null },
    status: { type: String, enum: ["In Progress", "Completed"], default: "Completed" },

    // 🚀 NEW FIELDS (From PICT Data)
    totalRegistered: { type: Number },
    totalPlaced: { type: Number },
    highestCtc: { type: Number },
    averageCtc: { type: Number },
    medianCtc: { type: Number },
    companiesVisited: { type: Number },
    topRecruiter: { type: String },
    groupOneTotal: { type: Number },
    groupOneAvgSalary: { type: Number },
    groupTwoTotal: { type: Number },
    groupTwoAvgSalary: { type: Number },
    overallAvgSalary: { type: Number },

    branchWise: [
      {
        branch: { type: String },
        placed: { type: Number },
        avgSalary: { type: Number }
      }
    ],

    topCompanies: [
      {
        companyName: { type: String },
        studentsPlaced: { type: Number },
        avgCtc: { type: Number },
        sector: { type: String }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate percentage and sync new fields for frontend
placementStatSchema.pre('save', function () {
  // Sync fields
  if (this.totalRegistered) this.studentsEnrolled = this.totalRegistered;
  if (this.totalPlaced) this.studentsPlaced = this.totalPlaced;
  if (this.averageCtc) this.averageSalary = this.averageCtc;
  if (this.medianCtc) this.medianSalary = this.medianCtc;

  // Auto-calculate percentage
  if (this.studentsEnrolled > 0) {
    this.placementPercentage = parseFloat(((this.studentsPlaced / this.studentsEnrolled) * 100).toFixed(2));
  } else {
    this.placementPercentage = 0;
  }

  // Populate deptWisePlaced map from branchWise array
  if (this.branchWise && this.branchWise.length > 0) {
    this.branchWise.forEach(b => {
      this.deptWisePlaced.set(b.branch, b.placed);
    });
  }
});

module.exports = mongoose.model("PlacementStat", placementStatSchema);

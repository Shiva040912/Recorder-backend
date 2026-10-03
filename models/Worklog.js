const mongoose = require("mongoose");

const workLogSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },

    workDate: {
      type: Date,
      required: [true, "Work date is required"],
    },

    pageName: {
      type: String,
      required: [true, "Page name is required"],
      trim: true,
    },

    work: {
      type: String,
      required: [true, "Work is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: {
        values: [
          "In Progress",
          "Pending",
          "Completed",
          "Pushed",
        ],
        message: "Invalid status",
      },
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const WorkLog = mongoose.model("WorkLog", workLogSchema);

module.exports = WorkLog;
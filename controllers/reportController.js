const Project = require("../models/Project");
const WorkLog = require("../models/WorkLog");

const {
  translateWorkToEnglish,
} = require("../services/translationservice");

const {
  generateProjectReportPdf,
} = require("../services/reportPdfService");

const generateProjectReport = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workLogs = await WorkLog.find({
      projectName: project.projectName,
    }).sort({
      workDate: 1,
      createdAt: 1,
    });

    if (workLogs.length === 0) {
      return res.status(404).json({
        message: "No work logs found for this project",
      });
    }

    const translatedWorks = [];

    for (const workLog of workLogs) {
      try {
        const translated = await translateWorkToEnglish(
          workLog.work
        );

        translatedWorks.push(translated);
      } catch (translationError) {
        console.error(
          "Translation failed:",
          translationError.message
        );

        translatedWorks.push(workLog.work);
      }
    }

    generateProjectReportPdf({
      projectName: project.projectName,
      workLogs,
      translatedWorks,
      res,
    });
  } catch (error) {
    console.error("Project report error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate project report",
        error: error.message,
      });
    }
  }
};

module.exports = {
  generateProjectReport,
};
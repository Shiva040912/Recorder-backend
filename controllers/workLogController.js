const WorkLog = require("../models/WorkLog");

const STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Pushed",
];

const getAllWorkLogs = async (req, res) => {
  try {
    const { projectName, status, date } = req.query;

    const filter = {};

    if (projectName) {
      filter.projectName = projectName;
    }

    if (status) {
      filter.status = status;
    }

    if (date) {
      const startDate = new Date(`${date}T00:00:00`);
      const endDate = new Date(`${date}T23:59:59.999`);

      filter.workDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const workLogs = await WorkLog.find(filter).sort({
      createdAt: 1,
    });

    res.status(200).json(workLogs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch work logs",
      error: error.message,
    });
  }
};

const getWorkLogById = async (req, res) => {
  try {
    const workLog = await WorkLog.findById(req.params.id);

    if (!workLog) {
      return res.status(404).json({
        message: "Work log not found",
      });
    }

    res.status(200).json(workLog);
  } catch (error) {
    res.status(400).json({
      message: "Invalid work log ID",
      error: error.message,
    });
  }
};

const createWorkLog = async (req, res) => {
  try {
    const {
      projectName,
      workDate,
      pageName,
      work,
      status,
    } = req.body;

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    if (!workDate) {
      return res.status(400).json({
        message: "Work date is required",
      });
    }

    if (!pageName || !pageName.trim()) {
      return res.status(400).json({
        message: "Page name is required",
      });
    }

    if (!work || !work.trim()) {
      return res.status(400).json({
        message: "Work is required",
      });
    }

    const workLog = new WorkLog({
      projectName: projectName.trim(),
      workDate,
      pageName: pageName.trim(),
      work: work.trim(),
      status: status || "Pending",
    });

    const savedWorkLog = await workLog.save();

    res.status(201).json(savedWorkLog);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create work log",
      error: error.message,
    });
  }
};

const updateWorkLog = async (req, res) => {
  try {
    const workLog = await WorkLog.findById(req.params.id);

    if (!workLog) {
      return res.status(404).json({
        message: "Work log not found",
      });
    }

    // ---------------------------------------------
    // PUSHED STATUS LOCK
    // ---------------------------------------------

    if (
      workLog.status === "Pushed" &&
      req.body.status &&
      req.body.status !== "Pushed"
    ) {
      return res.status(400).json({
        message:
          "Pushed work status cannot be changed.",
      });
    }

    // ---------------------------------------------
    // STATUS PROGRESSION
    // ---------------------------------------------

    if (
      req.body.status &&
      req.body.status !== workLog.status
    ) {
      const currentIndex = STATUSES.indexOf(
        workLog.status
      );

      const newIndex = STATUSES.indexOf(
        req.body.status
      );

      if (newIndex === -1) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      if (newIndex !== currentIndex + 1) {
        return res.status(400).json({
          message: `Status can only move from ${workLog.status} to ${STATUSES[currentIndex + 1] || "Pushed"}.`,
        });
      }
    }

    // ---------------------------------------------
    // UPDATE FIELDS
    // ---------------------------------------------

    if (req.body.pageName !== undefined) {
      if (
        typeof req.body.pageName !== "string" ||
        !req.body.pageName.trim()
      ) {
        return res.status(400).json({
          message: "Page name is required",
        });
      }

      workLog.pageName = req.body.pageName.trim();
    }

    if (req.body.work !== undefined) {
      if (
        typeof req.body.work !== "string" ||
        !req.body.work.trim()
      ) {
        return res.status(400).json({
          message: "Work is required",
        });
      }

      workLog.work = req.body.work.trim();
    }

    if (req.body.projectName !== undefined) {
      if (
        typeof req.body.projectName !== "string" ||
        !req.body.projectName.trim()
      ) {
        return res.status(400).json({
          message: "Project name is required",
        });
      }

      workLog.projectName =
        req.body.projectName.trim();
    }

    if (req.body.workDate !== undefined) {
      workLog.workDate = req.body.workDate;
    }

    if (req.body.status !== undefined) {
      workLog.status = req.body.status;
    }

    const updatedWorkLog = await workLog.save();

    res.status(200).json(updatedWorkLog);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update work log",
      error: error.message,
    });
  }
};

const deleteWorkLog = async (req, res) => {
  try {
    const deletedWorkLog =
      await WorkLog.findByIdAndDelete(req.params.id);

    if (!deletedWorkLog) {
      return res.status(404).json({
        message: "Work log not found",
      });
    }

    res.status(200).json({
      message: "Work log deleted successfully",
      deletedWorkLog,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete work log",
      error: error.message,
    });
  }
};

const getWorkLogSummary = async (req, res) => {
  try {
    const total = await WorkLog.countDocuments();

    const completed = await WorkLog.countDocuments({
      status: "Completed",
    });

    const inProgress = await WorkLog.countDocuments({
      status: "In Progress",
    });

    const pending = await WorkLog.countDocuments({
      status: "Pending",
    });

    const pushed = await WorkLog.countDocuments({
      status: "Pushed",
    });

    res.status(200).json({
      total,
      completed,
      inProgress,
      pending,
      pushed,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch work log summary",
      error: error.message,
    });
  }
};

module.exports = {
  getAllWorkLogs,
  getWorkLogById,
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
  getWorkLogSummary,
};
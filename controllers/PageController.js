const Page = require("../models/Page");
const Project = require("../models/Project");
const WorkLog = require("../models/WorkLog");

// Get all pages
const getAllPages = async (req, res) => {
  try {
    const { projectName } = req.query;

    const filter = {};

    if (projectName) {
      filter.projectName = projectName;
    }

    const pages = await Page.find(filter).sort({
      createdAt: 1,
    });

    res.status(200).json(pages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pages",
      error: error.message,
    });
  }
};

// Get single page
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    res.status(200).json(page);
  } catch (error) {
    res.status(400).json({
      message: "Invalid page ID",
      error: error.message,
    });
  }
};

// Create page
const createPage = async (req, res) => {
  try {
    const { projectName, pageName } = req.body;

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    if (!pageName || !pageName.trim()) {
      return res.status(400).json({
        message: "Page name is required",
      });
    }

    const project = await Project.findOne({
      projectName: projectName.trim(),
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const existingPage = await Page.findOne({
      projectName: projectName.trim(),
      pageName: pageName.trim(),
    });

    if (existingPage) {
      return res.status(409).json({
        message: "Page already exists in this project",
      });
    }

    const page = new Page({
      projectName: projectName.trim(),
      pageName: pageName.trim(),
    });

    const savedPage = await page.save();

    res.status(201).json(savedPage);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create page",
      error: error.message,
    });
  }
};

// Update page
const updatePage = async (req, res) => {
  try {
    const { pageName } = req.body;

    if (!pageName || !pageName.trim()) {
      return res.status(400).json({
        message: "Page name is required",
      });
    }

    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    const oldPageName = page.pageName;
    const newPageName = pageName.trim();

    const existingPage = await Page.findOne({
      projectName: page.projectName,
      pageName: newPageName,
      _id: {
        $ne: req.params.id,
      },
    });

    if (existingPage) {
      return res.status(409).json({
        message: "Page already exists in this project",
      });
    }

    page.pageName = newPageName;

    const updatedPage = await page.save();

    // Update related work logs
    await WorkLog.updateMany(
      {
        projectName: page.projectName,
        pageName: oldPageName,
      },
      {
        $set: {
          pageName: newPageName,
        },
      }
    );

    res.status(200).json(updatedPage);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update page",
      error: error.message,
    });
  }
};

// Delete page + its work
const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    await WorkLog.deleteMany({
      projectName: page.projectName,
      pageName: page.pageName,
    });

    await Page.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Page and its work logs deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete page",
      error: error.message,
    });
  }
};

module.exports = {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
};
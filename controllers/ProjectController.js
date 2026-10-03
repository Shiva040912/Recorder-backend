const Project = require("../models/Project");
const WorkLog = require("../models/WorkLog");

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// Get single project
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({
      message: "Invalid project ID",
      error: error.message,
    });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { projectName } = req.body;

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const existingProject = await Project.findOne({
      projectName: projectName.trim(),
    });

    if (existingProject) {
      return res.status(409).json({
        message: "Project already exists",
      });
    }

    const project = new Project({
      projectName: projectName.trim(),
    });

    const savedProject = await project.save();

    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { projectName } = req.body;

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const existingProject = await Project.findOne({
      projectName: projectName.trim(),
      _id: { $ne: req.params.id },
    });

    if (existingProject) {
      return res.status(409).json({
        message: "Project already exists",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const oldProjectName = project.projectName;
    const newProjectName = projectName.trim();

    project.projectName = newProjectName;

    const updatedProject = await project.save();

    // Update related work logs with the new project name
    await WorkLog.updateMany(
      {
        projectName: oldProjectName,
      },
      {
        $set: {
          projectName: newProjectName,
        },
      }
    );

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Delete project + its work logs
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await WorkLog.deleteMany({
      projectName: project.projectName,
    });

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Project and its work logs deleted successfully",
      deletedProject: project,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
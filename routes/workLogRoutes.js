const express = require("express");

const {
  getAllWorkLogs,
  getWorkLogById,
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
  getWorkLogSummary,
} = require("../controllers/workLogController");

const router = express.Router();

router.get("/summary", getWorkLogSummary);
router.get("/", getAllWorkLogs);
router.get("/:id", getWorkLogById);
router.post("/", createWorkLog);
router.put("/:id", updateWorkLog);
router.delete("/:id", deleteWorkLog);

module.exports = router;
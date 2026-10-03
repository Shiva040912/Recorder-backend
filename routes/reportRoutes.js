const express = require("express");

const {
  generateProjectReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/project/:id", generateProjectReport);

module.exports = router;
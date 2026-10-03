const express = require("express");

const {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
} = require("../controllers/PageController");

const router = express.Router();

router.get("/", getAllPages);
router.get("/:id", getPageById);
router.post("/", createPage);
router.put("/:id", updatePage);
router.delete("/:id", deletePage);

module.exports = router;
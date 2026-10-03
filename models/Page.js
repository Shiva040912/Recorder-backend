const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },

    pageName: {
      type: String,
      required: [true, "Page name is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

pageSchema.index(
  {
    projectName: 1,
    pageName: 1,
  },
  {
    unique: true,
  }
);

const Page = mongoose.model("Page", pageSchema);

module.exports = Page;
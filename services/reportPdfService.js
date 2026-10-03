const PDFDocument = require("pdfkit");

const generateProjectReportPdf = ({
  projectName,
  workLogs,
  translatedWorks,
  res,
}) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 45,
  });

  const safeFileName = projectName
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_");

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename="${safeFileName}_Project_Report.pdf"`
  );

  doc.pipe(res);

  // Header
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("RECORDER", {
      align: "center",
    });

  doc
    .moveDown(0.3)
    .fontSize(16)
    .text("Project Work Report", {
      align: "center",
    });

  doc.moveDown(1);

  // Project
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Project: ", {
      continued: true,
    });

  doc
    .font("Helvetica")
    .text(projectName);

  doc.moveDown(0.3);

  // Generated date
  doc
    .font("Helvetica-Bold")
    .text("Generated On: ", {
      continued: true,
    });

  doc
    .font("Helvetica")
    .text(
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    );

  doc.moveDown(1);

  // Summary
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Work Summary");

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Total Work Items: ${workLogs.length}`);

  doc.moveDown(1);

  // Work items
  workLogs.forEach((workLog, index) => {
    const translatedWork =
      translatedWorks[index] || workLog.work;

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`${index + 1}. ${workLog.pageName}`);

    doc.moveDown(0.2);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Date: ${new Date(
          workLog.workDate
        ).toLocaleDateString("en-IN")}`
      );

    doc.moveDown(0.15);

    doc
      .fontSize(9)
      .text(`Status: ${workLog.status}`);

    doc.moveDown(0.2);

    doc
      .fontSize(10)
      .text(translatedWork, {
        width: 500,
        align: "left",
      });

    doc.moveDown(0.8);

    doc
      .moveTo(45, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(0.8);

    if (doc.y > 720 && index !== workLogs.length - 1) {
      doc.addPage();
    }
  });

  // Footer
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(
      "Generated using Recorder",
      45,
      770,
      {
        width: 500,
        align: "center",
      }
    );

  doc.end();
};

module.exports = {
  generateProjectReportPdf,
};
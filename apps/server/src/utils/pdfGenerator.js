import PDFDocument from "pdfkit";

const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument({
    size: [288, 600], // 4 inch width in points, height can be dynamic
    margins: { top: 10, bottom: 10, left: 10, right: 10 },
  });

  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Header
    doc.fontSize(14).text("My Grocery Store", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Invoice ID: ${invoice._id}`, { align: "left" });
    doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`, {
      align: "left",
    });
    doc.moveDown(1);

    // Customer
    doc.fontSize(12).text(`Customer: ${invoice.customerName || "N/A"}`);
    if (invoice.customerPhone) doc.text(`Phone: ${invoice.customerPhone}`);
    if (invoice.customerAddress)
      doc.text(`Address: ${invoice.customerAddress}`);
    doc.moveDown(1);

    // Table header
    doc.fontSize(10).text("Item", 10, doc.y, { width: 120 });
    doc.text("Qty", 140, doc.y, { width: 40, align: "right" });
    doc.text("Price", 190, doc.y, { width: 50, align: "right" });
    doc.text("Total", 250, doc.y, { width: 50, align: "right" });
    doc.moveDown(0.5);
    doc.moveTo(10, doc.y).lineTo(278, doc.y).stroke();

    // Items
    invoice.items.forEach((item) => {
      doc.text(item.name, 10, doc.y, { width: 120 });
      doc.text(item.quantity.toString(), 140, doc.y, {
        width: 40,
        align: "right",
      });
      doc.text(item.sellingPrice.toFixed(2), 190, doc.y, {
        width: 50,
        align: "right",
      });
      const total = item.quantity * item.sellingPrice;
      doc.text(total.toFixed(2), 250, doc.y, { width: 50, align: "right" });
      doc.moveDown(0.5);
    });

    doc.moveTo(10, doc.y).lineTo(278, doc.y).stroke();

    // Total amount
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Total: ₹${invoice.totalAmount.toFixed(2)}`, { align: "right" });

    doc.end();
  });
};

export { generateInvoicePDF };

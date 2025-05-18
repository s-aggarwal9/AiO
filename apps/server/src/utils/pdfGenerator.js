import PDFDocument from "pdfkit";

const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument({
    size: [288, 600], // 4-inch width, dynamic height
    margins: { top: 20, bottom: 20, left: 15, right: 15 },
    bufferPages: true,
  });

  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on("error", reject);

    // Fonts
    doc.registerFont("Helvetica", "Helvetica");
    doc.registerFont("Helvetica-Bold", "Helvetica-Bold");

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("black")
      .text("My Grocery Store", { align: "center" });
    doc
      .font("Helvetica")
      .fontSize(9)
      .text("123 Market Street, Your City, India", { align: "center" })
      .text("Phone: +91 123-456-7890 | Email: contact@grocerystore.com", {
        align: "center",
      });
    doc.moveDown(0.5);
    doc.moveTo(15, doc.y).lineTo(273, doc.y).stroke("black");
    doc.moveDown(1);

    // Invoice Details
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`Invoice #${invoice.invoiceNumber}`, 15, doc.y)
      .text(
        `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`,
        150,
        doc.y - 10
      );
    doc.moveDown(0.5);

    // Customer Details
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Customer Details:", 15, doc.y);
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(`Name: ${invoice.customerName || "Walk-in Customer"}`)
      .text(`Phone: ${invoice.customerPhone || "N/A"}`)
      .text(`Address: ${invoice.customerAddress || "N/A"}`);
    doc.moveDown(1);

    // Table Setup
    const tableTop = doc.y;
    const tableWidth = 258;
    const colWidths = {
      sno: 25,
      item: 90,
      qty: 30,
      rate: 35,
      amount: 35,
      valueOfSupply: 43,
    };
    const colPositions = {
      sno: 15,
      item: 15 + colWidths.sno,
      qty: 15 + colWidths.sno + colWidths.item,
      rate: 15 + colWidths.sno + colWidths.item + colWidths.qty,
      amount:
        15 + colWidths.sno + colWidths.item + colWidths.qty + colWidths.rate,
      valueOfSupply:
        15 +
        colWidths.sno +
        colWidths.item +
        colWidths.qty +
        colWidths.rate +
        colWidths.amount,
    };

    // Table Header
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("black")
      .text("S.No", colPositions.sno, tableTop, { width: colWidths.sno })
      .text("Item", colPositions.item, tableTop, { width: colWidths.item })
      .text("Qty", colPositions.qty, tableTop, {
        width: colWidths.qty,
        align: "right",
      })
      .text("Rate", colPositions.rate, tableTop, {
        width: colWidths.rate,
        align: "right",
      })
      .text("Amount", colPositions.amount, tableTop, {
        width: colWidths.amount,
        align: "right",
      })
      .text("Value of Supply", colPositions.valueOfSupply, tableTop, {
        width: colWidths.valueOfSupply,
        align: "right",
      });
    doc
      .moveTo(15, doc.y + 5)
      .lineTo(15 + tableWidth, doc.y + 5)
      .stroke("black");

    // Table Rows
    let y = doc.y + 10;
    invoice.items.forEach((item, index) => {
      if (y + 20 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      const rowHeight = 15;
      const amount = item.quantity * item.sellingPrice;
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("black")
        .text((index + 1).toString(), colPositions.sno, y, {
          width: colWidths.sno,
        })
        .text(item.name, colPositions.item, y, {
          width: colWidths.item,
        })
        .text(item.quantity.toString(), colPositions.qty, y, {
          width: colWidths.qty,
          align: "right",
        })
        .text(item.sellingPrice.toFixed(2), colPositions.rate, y, {
          width: colWidths.rate,
          align: "right",
        })
        .text(amount.toFixed(2), colPositions.amount, y, {
          width: colWidths.amount,
          align: "right",
        })
        .text(amount.toFixed(2), colPositions.valueOfSupply, y, {
          width: colWidths.valueOfSupply,
          align: "right",
        });
      doc
        .fontSize(9)
        .text("₹", colPositions.rate - 10, y, { width: 10 })
        .text("₹", colPositions.amount - 10, y, { width: 10 })
        .text("₹", colPositions.valueOfSupply - 10, y, { width: 10 });
      y += rowHeight;
    });

    doc
      .moveTo(15, y)
      .lineTo(15 + tableWidth, y)
      .stroke("black");

    // Totals
    y += 10;
    if (y + 80 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    const totalXLabel = 15; // Start labels closer to the left
    const totalXValue = 180; // Position values to the right
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("black")
      .text("Subtotal:", totalXLabel, y)
      .text(`₹${invoice.subtotal.toFixed(2)}`, totalXValue, y, {
        align: "right",
        width: 93,
      });
    y += 12;
    doc
      .text("Tax:", totalXLabel, y)
      .text(`₹${invoice.tax.toFixed(2)}`, totalXValue, y, {
        align: "right",
        width: 93,
      });
    y += 12;
    doc
      .text("Discount:", totalXLabel, y)
      .text(`₹${invoice.discount.toFixed(2)}`, totalXValue, y, {
        align: "right",
        width: 93,
      });
    y += 12;
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Total Amount:", totalXLabel, y)
      .text(`₹${invoice.totalAmount.toFixed(2)}`, totalXValue, y, {
        align: "right",
        width: 93,
      });
    y += 12;
    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Payment Method:", totalXLabel, y)
      .text(invoice.paymentMethod, totalXValue, y, {
        align: "right",
        width: 93,
      });

    // Notes
    if (invoice.notes) {
      y += 20;
      if (y + 30 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      doc
        .font("Helvetica")
        .fontSize(9)
        .text("Notes:", 15, y)
        .text(invoice.notes, 15, y + 10, { width: 258 });
      y = doc.y + 10;
    }

    // Footer
    y += 20;
    if (y + 40 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    doc.moveTo(15, y).lineTo(273, y).stroke("black");
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("black")
      .text("Thank you for shopping with us!", 15, y + 10, { align: "center" })
      .text(
        "Contact us at +91 123-456-7890 or contact@grocerystore.com",
        15,
        y + 20,
        {
          align: "center",
        }
      );

    doc.end();
  });
};

export { generateInvoicePDF };

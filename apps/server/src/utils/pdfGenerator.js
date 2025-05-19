import PDFDocument from "pdfkit";

const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument({
    size: [288, 600],
    margins: { top: 20, bottom: 20, left: 15, right: 15 },
    bufferPages: true,
  });

  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on("error", reject);

    doc.registerFont("Helvetica", "Helvetica");
    doc.registerFont("Helvetica-Bold", "Helvetica-Bold");

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("My Grocery Store", { align: "center" });
    doc
      .font("Helvetica")
      .fontSize(9)
      .text("123 Market Street, Your City, India", { align: "center" })
      .text("Phone: +91 123-456-7890 | Email: contact@grocerystore.com", {
        align: "center",
      });
    doc
      .moveDown(0.5)
      .moveTo(15, doc.y)
      .lineTo(273, doc.y)
      .strokeColor("#888")
      .stroke();
    doc.moveDown(1);

    // Invoice Details
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`Invoice #${invoice.invoiceNumber}`, 15, doc.y);
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`,
        {
          align: "right",
        }
      );
    doc.moveDown(0.8);

    // Customer Details
    doc.font("Helvetica-Bold").text("Customer Details:");
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(`Name: ${invoice.customerName || "Walk-in Customer"}`)
      .text(`Phone: ${invoice.customerPhone || "N/A"}`)
      .text(`Address: ${invoice.customerAddress || "N/A"}`);
    doc.moveDown(1);

    // Column layout
    const colWidths = {
      sno: 20,
      item: 75,
      qty: 25,
      rate: 40,
      amount: 50,
      value: 45,
    };

    const colX = {
      sno: 15,
      item: 15 + colWidths.sno,
      qty: 15 + colWidths.sno + colWidths.item,
      rate: 15 + colWidths.sno + colWidths.item + colWidths.qty,
      amount:
        15 + colWidths.sno + colWidths.item + colWidths.qty + colWidths.rate,
      value:
        15 +
        colWidths.sno +
        colWidths.item +
        colWidths.qty +
        colWidths.rate +
        colWidths.amount,
    };

    // Header Row - single line
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("S.No", colX.sno, doc.y, { width: colWidths.sno, lineBreak: false })
      .text("Item", colX.item, doc.y, {
        width: colWidths.item,
        lineBreak: false,
      })
      .text("Qty", colX.qty, doc.y, {
        width: colWidths.qty,
        align: "right",
        lineBreak: false,
      })
      .text("Rate", colX.rate, doc.y, {
        width: colWidths.rate,
        align: "right",
        lineBreak: false,
      })
      .text("Amount", colX.amount, doc.y, {
        width: colWidths.amount,
        align: "right",
        lineBreak: false,
      })
      .text("Value", colX.value, doc.y, {
        width: colWidths.value,
        align: "right",
        lineBreak: false,
      });

    doc
      .moveTo(15, doc.y + 5)
      .lineTo(273, doc.y + 5)
      .strokeColor("#aaa")
      .stroke();
    let y = doc.y + 10;

    // Table rows
    invoice.items.forEach((item, index) => {
      const amount = item.quantity * item.sellingPrice;

      if (y + 20 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(index + 1, colX.sno, y, { width: colWidths.sno })
        .text(item.name, colX.item, y, { width: colWidths.item })
        .text(item.quantity.toString(), colX.qty, y, {
          width: colWidths.qty,
          align: "right",
        })
        .text(item.sellingPrice.toFixed(2), colX.rate, y, {
          width: colWidths.rate,
          align: "right",
        })
        .text(amount.toFixed(2), colX.amount, y, {
          width: colWidths.amount,
          align: "right",
        })
        .text(amount.toFixed(2), colX.value, y, {
          width: colWidths.value,
          align: "right",
        });
      y += 16;
    });

    doc.moveTo(15, y).lineTo(273, y).strokeColor("#aaa").stroke();
    y += 10;

    // Totals
    const labelX = 15;
    const valueX = 180;
    const totalLine = (label, value, bold = false) => {
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 10 : 9)
        .text(label, labelX, y)
        .text(value.toFixed(2), valueX, y, {
          align: "right",
          width: 78,
        });
      y += 14;
    };

    totalLine("Subtotal:", invoice.subtotal);
    totalLine("Tax:", invoice.tax);
    totalLine("Discount:", invoice.discount);
    totalLine("Total Amount:", invoice.totalAmount, true);

    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Payment Method:", labelX, y)
      .text(invoice.paymentMethod, valueX, y, {
        align: "right",
        width: 78,
      });
    y += 20;

    // Notes
    if (invoice.notes) {
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Notes:", 15, y)
        .font("Helvetica")
        .text(invoice.notes, 15, y + 12, { width: 258 });
      y = doc.y + 10;
    }

    // Footer
    if (y + 40 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    doc.moveTo(15, y).lineTo(273, y).strokeColor("#888").stroke();
    y += 10;
    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Thank you for shopping with us!", 15, y, { align: "center" })
      .text(
        "Contact us at +91 123-456-7890 or contact@grocerystore.com",
        15,
        y + 12,
        {
          align: "center",
        }
      );

    doc.end();
  });
};

export { generateInvoicePDF };

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    // credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import invoiceRouter from "./routes/invoice.routes.js";
import purchaseInvoiceRouter from "./routes/purchaseInvoice.routes.js";
import distributorRouter from "./routes/supplier.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/distributors", distributorRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/purchase-invoices", purchaseInvoiceRouter);

app.get("/", (req, res) => {
  res.send("Root route is working! 🚀");
});

export { app };

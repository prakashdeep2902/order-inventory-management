import express from "express";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Order Inventory API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
export default app;

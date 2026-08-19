import express from "express";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Order Inventory API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

export default app;

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

// Enable CORS so the Vite frontend can talk to this server
app.use(cors());
app.use(express.json());

// Log every API request: method, url, status, time taken, and body for writes
app.use("/api", (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const body = ["POST", "PUT"].includes(req.method)
      ? ` ${JSON.stringify(req.body)}`
      : "";
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms${body}`
    );
  });
  next();
});

// API routes
app.use("/api/todos", todoRoutes);

// Catch-all for unknown /api routes
app.all("/api/{*splat}", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Serve the React build (used in production)
const buildPath = path.join(__dirname, "../client/dist");
app.use(express.static(buildPath));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection failed:", err.message));
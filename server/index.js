import "dotenv/config";
import dns from "node:dns";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import apiRoutes from "./routes/api.js";
import companyRoutes from "./routes/companies.js";
import scoreRoutes from "./routes/scores.js";
import studyRoutes from "./routes/study.js";
import  authGate from"./middleware/authGate.js";
import pushRoutes from "./routes/push.js";
import startReminderScheduler from "./utils/reminderScheduler.js";

// Force Node to resolve DNS via Google/Cloudflare instead of your network's
// default DNS server. Fixes "querySrv ETIMEOUT" on networks whose DNS doesn't
// support SRV records (common on college/hostel WiFi).
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [process.env.CLIENT_ORIGIN || "http://localhost:5173", "http://127.0.0.1:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https?:\/\/192\.168\.\d+\.\d+(?::\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());
app.use("/api", authGate);
app.use("/api/push", pushRoutes);
startReminderScheduler();
app.use("/api", apiRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/study", studyRoutes);

app.get("/", (req, res) => res.send("Placement Tracker API is running."));

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Copy .env.example to .env and fill in your real password.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // fail fast with a clear error instead of hanging
    });
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    if (err.message.includes("querySrv") || err.message.includes("ETIMEOUT")) {
      console.error("\nThis is a DNS/network issue with the SRV lookup (common on college/hostel WiFi).");
      console.error("Fix: in .env, use the standard mongodb:// connection string instead of");
      console.error("mongodb+srv:// — see Option B in .env.example. Get it from Atlas:");
      console.error("Database -> Connect -> Drivers -> 'Or Standard connection string' link.");
    }
    process.exit(1);
  }
}

start();

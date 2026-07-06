import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function checkConnection() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  const start = Date.now();

  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    const ms = Date.now() - start;
    console.log(`✅ Connected successfully in ${ms}ms`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.map((c) => c.name).join(", ") || "(none yet)"}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}`);

    if (err.message.includes("querySrv") || err.message.includes("ETIMEOUT")) {
      console.error("\n→ DNS/SRV lookup is being blocked (common on college WiFi).");
      console.error("  Fix: use the standard mongodb:// connection string instead of");
      console.error("  mongodb+srv:// — see Option B in .env.example.");
    } else if (err.message.includes("bad auth") || err.message.includes("Authentication failed")) {
      console.error("\n→ Wrong username or password in MONGODB_URI.");
      console.error("  Check Atlas → Database Access → your user → Edit password.");
      console.error("  If your password has special characters (@ # % /), they must be URL-encoded.");
    } else if (err.message.includes("IP") || err.message.includes("whitelist")) {
      console.error("\n→ Your IP isn't allowed to connect.");
      console.error("  Fix: Atlas → Network Access → Add current IP (or 0.0.0.0/0 while testing).");
    }

    process.exit(1);
  }
}

checkConnection();

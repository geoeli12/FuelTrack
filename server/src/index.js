import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db.js";

import drivers from "./routes/drivers.js";
import fuelReadings from "./routes/fuelReadings.js";
import fuelRefills from "./routes/fuelRefills.js";
import fuelTank from "./routes/fuelTank.js";

await initDb();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// --- Shared-link gate (NO LOGIN) ---
// Anyone with the URL can use the app, but we still block random bots from calling the API directly.
function requireSharedKey(req, res, next) {
  const required = process.env.APP_SHARED_KEY;
  if (!required) return next(); // allow if you choose not to set it
  const got = req.header("x-app-key") || "";
  if (got !== required) return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.use("/api", requireSharedKey);

app.use("/api/drivers", drivers);
app.use("/api/fuel-readings", fuelReadings);
app.use("/api/fuel-refills", fuelRefills);
app.use("/api/fuel-tank", fuelTank);

// --- Static hosting (Vite build) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "../../dist");

app.use(express.static(DIST_DIR));

// SPA fallback (React Router): any non-API route should load index.html
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

const PORT = Number(process.env.PORT || 5050);
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

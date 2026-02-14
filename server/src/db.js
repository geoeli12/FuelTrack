// server/src/db.js
import { createClient } from "@supabase/supabase-js";

export let supabase = null;

/**
 * Fuel Tracker collections
 * - table: Supabase table name
 * - primaryKey: column name
 * - allowed: columns accepted from API (anything else is dropped)
 */
const COLLECTIONS = {
  drivers: {
    table: "drivers",
    primaryKey: "id",
    allowed: ["id", "name", "phone", "status", "created_at"],
  },

  fuel_readings: {
    table: "fuel_readings",
    primaryKey: "id",
    allowed: [
      "id",
      "driver_id",
      "driver_name",
      "before_image",
      "after_image",
      "before_reading",
      "after_reading",
      "gallons_used",
      "date",
      "time",
      "notes",
      "created_at",
    ],
  },

  fuel_refills: {
    table: "fuel_refills",
    primaryKey: "id",
    allowed: [
      "id",
      "gallons_added",
      "date",
      "cost",
      "notes",
      "running_total_after",
      "created_at",
    ],
  },

  fuel_tank: {
    table: "fuel_tank",
    primaryKey: "id",
    allowed: ["id", "current_gallons", "last_updated", "created_at"],
  },
};

function requireCollection(key) {
  const c = COLLECTIONS[key];
  if (!c) throw new Error(`Unknown collection: ${key}`);
  return c;
}

function pickAllowed(collectionKey, payload) {
  const c = requireCollection(collectionKey);
  const out = {};
  for (const k of c.allowed) {
    if (payload && payload[k] !== undefined) out[k] = payload[k];
  }
  return out;
}

export function tableNameFor(collectionKey) {
  return requireCollection(collectionKey).table;
}

/**
 * Normalize incoming payloads from frontend.
 * Returns only allowed columns to prevent Supabase insert/update failures.
 */
export function normalizePayload(collectionKey, payload) {
  if (!payload || typeof payload !== "object") return {};
  const p = { ...payload };

  if (collectionKey === "drivers") {
    // defaults
    if (!p.status) p.status = "active";
    return pickAllowed(collectionKey, p);
  }

  if (collectionKey === "fuel_readings") {
    // Ensure gallons_used is consistent if both readings exist
    if (
      p.gallons_used === undefined &&
      p.before_reading !== undefined &&
      p.after_reading !== undefined
    ) {
      const before = Number(p.before_reading);
      const after = Number(p.after_reading);
      if (!Number.isNaN(before) && !Number.isNaN(after)) {
        p.gallons_used = before - after;
      }
    }
    return pickAllowed(collectionKey, p);
  }

  if (collectionKey === "fuel_refills") {
    return pickAllowed(collectionKey, p);
  }

  if (collectionKey === "fuel_tank") {
    // keep last_updated if provided; otherwise set server-side default
    if (!p.last_updated) p.last_updated = new Date().toISOString();
    return pickAllowed(collectionKey, p);
  }

  return pickAllowed(collectionKey, p);
}

/**
 * Shape outgoing rows for frontend
 */
export function apiShape(collectionKey, row) {
  if (!row || typeof row !== "object") return row;
  return row;
}

export async function initDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Render."
    );
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  // Basic connectivity check (table might not exist yet; that's ok)
  const { error } = await supabase.from("drivers").select("id").limit(1);
  if (error && error.code !== "PGRST116") {
    console.log("Supabase check error:", error);
  }
}

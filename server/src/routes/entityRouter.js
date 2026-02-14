// server/src/routes/entityRouter.js
import { Router } from "express";
import { supabase, normalizePayload, apiShape, tableNameFor } from "../db.js";

export function makeEntityRouter({ collectionKey }) {
  const r = Router();
  const table = tableNameFor(collectionKey);

  r.get("/", async (req, res) => {
    try {
      const q = { ...(req.query || {}) };
      const sort = q.sort;
      const limitRaw = q.limit;
      delete q.sort;
      delete q.limit;

      let query = supabase.from(table).select("*");

      // equality filters
      for (const [k, v] of Object.entries(q)) {
        if (v === undefined) continue;

        // normalize single-field filters too
        const normalized = normalizePayload(collectionKey, { [k]: v });
        const col = Object.keys(normalized)[0] || k;
        const val = normalized[col];

        const realCol = col === "created_date" ? "created_at" : col;
        query = query.eq(realCol, val);
      }

      if (sort) {
        const desc = String(sort).startsWith("-");
        const key = desc ? String(sort).slice(1) : String(sort);
        const realKey = key === "created_date" ? "created_at" : key;
        query = query.order(realKey, { ascending: !desc, nullsFirst: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      if (limitRaw !== undefined) {
        const limit = Math.max(1, Math.min(500, Number(limitRaw) || 0));
        if (limit) query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });

      res.json((data || []).map((row) => apiShape(collectionKey, row)));
    } catch (e) {
      res.status(500).json({ error: e?.message || "Server error" });
    }
  });

  r.post("/", async (req, res) => {
    try {
      const payload = normalizePayload(collectionKey, req.body);

      // Basic required checks
      if (collectionKey === "drivers" && !payload.name) {
        return res.status(400).json({ error: "Missing required field: name" });
      }
      if (collectionKey === "fuel_readings" && (!payload.driver_id || payload.before_reading === undefined || payload.after_reading === undefined || !payload.date)) {
        return res.status(400).json({ error: "Missing required fields for FuelReading" });
      }
      if (collectionKey === "fuel_refills" && (payload.gallons_added === undefined || !payload.date)) {
        return res.status(400).json({ error: "Missing required fields for FuelRefill" });
      }
      if (collectionKey === "fuel_tank" && payload.current_gallons === undefined) {
        return res.status(400).json({ error: "Missing required field: current_gallons" });
      }

      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        console.error("INSERT error:", table, error.message, payload);
        return res.status(400).json({ error: error.message });
      }

      res.json(apiShape(collectionKey, data));
    } catch (e) {
      console.error("POST exception:", table, e);
      res.status(500).json({ error: e?.message || "Server error" });
    }
  });

  r.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const payload = normalizePayload(collectionKey, req.body);

      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("UPDATE error:", table, error.message, payload);
        return res.status(400).json({ error: error.message });
      }

      res.json(apiShape(collectionKey, data));
    } catch (e) {
      console.error("PUT exception:", table, e);
      res.status(500).json({ error: e?.message || "Server error" });
    }
  });

  r.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) return res.status(400).json({ error: error.message });

      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e?.message || "Server error" });
    }
  });

  return r;
}

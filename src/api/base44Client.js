// Replaces the Base44 SDK with a tiny API client that talks to our Render server.
// This keeps the rest of the app code mostly unchanged.

const API_BASE = ""; // same origin

function sharedHeaders() {
  const key = import.meta?.env?.VITE_APP_SHARED_KEY;
  return key ? { "x-app-key": key } : {};
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...sharedHeaders(),
    },
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = body?.error || body?.message || (typeof body === "string" ? body : "Request failed");
    throw new Error(msg);
  }
  return body;
}

function buildListUrl(basePath, sort, limit, filters) {
  const params = new URLSearchParams();
  if (sort) params.set("sort", sort);
  if (limit) params.set("limit", String(limit));
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v === undefined || v === null) continue;
      params.set(k, String(v));
    }
  }
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

function makeEntity(entityPath) {
  return {
    list: (sort, limit, filters) => apiFetch(buildListUrl(entityPath, sort, limit, filters)),
    get: (id) => apiFetch(`${entityPath}?id=${encodeURIComponent(id)}`),
    create: (data) => apiFetch(entityPath, { method: "POST", body: JSON.stringify(data || {}) }),
    update: (id, data) => apiFetch(`${entityPath}/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data || {}) }),
    delete: (id) => apiFetch(`${entityPath}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}

export const base44 = {
  entities: {
    Driver: makeEntity("/api/drivers"),
    FuelReading: makeEntity("/api/fuel-readings"),
    FuelRefill: makeEntity("/api/fuel-refills"),
    FuelTank: makeEntity("/api/fuel-tank"),
  },
};

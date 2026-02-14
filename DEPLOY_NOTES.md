# Fuel Log — Render + Supabase (No Login)

## Render env vars
Set these in Render (Web Service → Environment):

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- APP_SHARED_KEY  (recommended)

## Client env var
Because the frontend calls the API, it sends the shared key via header:

- VITE_APP_SHARED_KEY

On Render, add it as an env var too (Render will inject Vite build-time vars).

## Render commands
This repo is set up like your working Fleet app:

- Build: `npm run install:all && npm run build`
- Start: `npm start`

## API endpoints
- `/api/drivers`
- `/api/fuel-readings`
- `/api/fuel-refills`
- `/api/fuel-tank`

All accept:
- `GET /` with optional `sort=-date` and `limit=50`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

If `APP_SHARED_KEY` is set, the API requires header: `x-app-key: <key>`.

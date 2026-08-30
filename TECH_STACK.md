# Tech Stack & Integration Spec — ISRO Ground Station Telemetry & Anomaly Analytics

## 1. Overview

Three layers, built so they can be developed in parallel and demoed together:

```
[Frontend: React SPA]  <--REST/JSON-->  [Backend API: FastAPI]  <--in-process-->  [ML Layer: Module A + Module B + Explainability]
                                                |
                                          [Data store: CSV/SQLite for the hackathon]
```

The frontend never talks to the ML layer directly — it only calls the backend API. The backend owns loading lot data, running/serving model inference, and shaping responses to match exactly what the UI needs (see contract below), so the frontend stays a pure rendering layer.

## 2. Frontend

- **Framework**: React (Vite) — fast dev server, simple build, good fit for a hackathon timeline. (Next.js is fine too if SSR/routing needs grow, but not required here.)
- **Styling**: Tailwind CSS — matches the dark, utility-driven panel/card system in `DESIGN.md`; define the palette in `tailwind.config` as custom colors (`bg-panel`, `status-red`, etc.) rather than inline hex values.
- **Charts**: Recharts for the scatter (Module A) and multi-series line chart (Module B) and the horizontal bar chart (SHAP factor weighting) — good default styling, easy custom tooltips/labels, works cleanly with Tailwind.
- **Data fetching / caching**: TanStack Query (`react-query`) — handles loading/error states per panel (needed since vehicle-profile changes refetch multiple panels), avoids manual `useEffect` fetch spaghetti.
- **State**: local component state + React Query cache is sufficient; no need for Redux/Zustand at hackathon scale unless the "selected part syncs between register and inspection panel" behavior gets complex — if so, a small Zustand store for `selectedVehicleId` / `selectedPartId` is the lightest fix.
- **HTTP client**: `fetch` or `axios`, wrapped in a small `api/client.ts` with the base URL and auth header injection.
- **Routing**: single route is enough (`/login`, `/dashboard`) — React Router if you want real URLs, otherwise a simple auth-gated conditional render works for a hackathon demo.

## 3. Backend

- **Framework**: FastAPI (Python) — pairs naturally with the ML stack (same language as the model code), auto-generates OpenAPI docs which double as a live contract check between frontend/backend teams, async-friendly.
- **Server**: Uvicorn.
- **Validation**: Pydantic models for every request/response shape in section 6 — this is what keeps the frontend and ML halves honest about the contract while both are being built in parallel.
- **Auth**: minimal — a stub endpoint that accepts any well-formed Operator ID/Key and returns a short-lived token (JWT via `python-jose`, or even a static demo token) — this is a themed gate, not a security deliverable.
- **CORS**: enable `CORSMiddleware` for the frontend's dev origin.

## 4. Data Layer

- **Storage**: CSV (or SQLite if you want querying) holding the burn-in dataset: `part_id, lot_id, vehicle_profile, value_0h, value_24h, value_96h, value_168h_actual, spatial_channel, sensing_channel, emi_db, rain_mm_hr, ...`.
- **Vehicle profiles**: a small static config (JSON or a DB table) of `{ vehicle_id, name, component_count, max_iddq, wind_shear_cap_knots, emi_limit_db, safety_slope }` — drives both the profile-bar display and the thresholds Module A/B use.
- For the hackathon, this can be entirely file-based (no real DB needed) — load once at startup into memory/pandas.

## 5. ML Layer

### 5.1 Module A — Dynamic Spatial Outlier Vector
- **Approach**: per-lot, per-vehicle statistical/contextual outlier scoring rather than the fixed datasheet limit — e.g., robust z-score (median + MAD) or Isolation Forest / Local Outlier Factor (`scikit-learn`) over `value_0h` (and optionally spatial channel) within the lot.
- **Output per part**: `{ part_id, value_0h, dynamic_limit, is_outlier, outlier_score }`.
- **Dynamic limit line** shown on the chart = the computed lot-relative bound (e.g., mean + kσ), explicitly distinct from the vehicle's static datasheet max.

### 5.2 Module B — Time-Series Drift Predictor
- **Approach**: regression model (`scikit-learn` `LinearRegression`/`Ridge` for interpretability, or `XGBoost`/`LightGBM` for accuracy) trained on `(value_0h, value_24h) → value_168h`.
- **Safety slope check**: compare predicted 168h value (or the implied slope `(pred_168h − value_0h) / 168`) against the vehicle's `safety_slope` from its profile; flag if exceeded.
- **Output per part**: `{ part_id, value_0h, value_24h, predicted_168h, safety_slope_limit, exceeds_slope }`.
- **Accuracy tracking**: if/when hidden ground-truth `value_168h_actual` is available, expose MAE (overall or per-lot) via a small `/metrics` endpoint for judging/demo purposes.

### 5.3 Explainability
- **Approach**: SHAP (`shap` library) over whichever model backs Module A/B (tree-based models make this straightforward — e.g., `TreeExplainer`); for linear models, coefficients × feature value gives an equivalent signed contribution.
- **Output per part**: ranked list of `{ feature_name, impact_pct, direction }` — this is exactly what feeds the "Factor Weighting" bar chart in the Deep Inspection panel. Feature names should already be human-readable (e.g., "Thunderstorm EMI Spike Weight") rather than raw column names — do this renaming in the backend response layer, not in the frontend.

### 5.4 Atmospheric Noise Classification
- **Approach**: rule-based or lightweight classifier layered on top of A/B outputs — if a flagged part's drift correlates with `emi_db`/`rain_mm_hr` exceeding a threshold at the same timestamp, reclassify from "hardware reject" to "atmospheric noise (re-screen)" rather than outright reject. This can start as a simple threshold rule for the hackathon and still satisfies the explainability requirement since it's transparent by construction.

## 6. API Contract (Frontend ⇄ Backend)

All responses JSON. Base path: `/api`.

### `POST /api/auth/login`
Request: `{ operator_id: string, security_key: string }`
Response: `{ token: string }`

### `GET /api/vehicle-profiles`
Response:
```json
[
  {
    "id": "lvm3",
    "name": "LVM3 (Heavy Payload Bus - 450 Components)",
    "component_count": 450,
    "max_iddq_uA": 55.0,
    "wind_shear_cap_knots": 45,
    "emi_limit_db": -80
  }
]
```

### `GET /api/lots/{lot_id}/summary?vehicle_id=lvm3`
Response:
```json
{
  "lot_id": "LVM3_STAGE_02",
  "tested_components": 450,
  "passed_screening": 412,
  "hardware_rejects": 26,
  "atmospheric_triggers": 12
}
```

### `GET /api/lots/{lot_id}/module-a?vehicle_id=lvm3`
Response:
```json
{
  "dynamic_limit_uA": 44.0,
  "points": [
    { "part_id": "PART_010", "spatial_index": 12, "value_0h": 48.0, "is_outlier": true }
  ]
}
```

### `GET /api/lots/{lot_id}/module-b?vehicle_id=lvm3`
Response:
```json
{
  "safety_slope_limit_uA": 55.0,
  "series": [
    {
      "part_id": "PART_025",
      "value_0h": 11.0,
      "value_24h": 22.0,
      "predicted_168h": 39.0,
      "exceeds_slope": true
    },
    {
      "part_id": "PART_088",
      "value_0h": 10.2,
      "value_24h": 10.6,
      "predicted_168h": 11.0,
      "exceeds_slope": false
    }
  ]
}
```

### `GET /api/lots/{lot_id}/register?vehicle_id=lvm3`
Response:
```json
[
  {
    "part_id": "PART_010",
    "category": "Spatial Outlier",
    "sensing_channel": "Static Leakage Sensor",
    "factor": "Gate Oxide Pinholes",
    "value_0h": 48.0,
    "predicted_168h": 52.0
  },
  {
    "part_id": "PART_088",
    "category": "Atmospheric Noise",
    "sensing_channel": "Ground EMI Array",
    "factor": "Thunder EMI Pulse (-35 dB) | Rain (18.5 mm/hr)",
    "value_0h": 10.2,
    "predicted_168h": 11.0
  }
]
```

### `GET /api/parts/{part_id}/inspection`
Response:
```json
{
  "part_id": "PART_088",
  "status": "ATMOSPHERIC NOISE (RE-SCREEN)",
  "anomaly_category": "Environmental Noise Drift",
  "sensing_channel": "Ground Station EMI & Weather Sensor Array",
  "physical_factor": "Thunderstorm EMI Pulse (-35 dB) & Rain Rate (18.5 mm/hr) at T=24h",
  "forecast_168h": 11.0,
  "verdict": "Transient Spike - Safe for Flight",
  "factor_weights": [
    { "feature": "Thunderstorm EMI Spike Weight", "impact_pct": -65 },
    { "feature": "Rain Attenuation Humidity Rate", "impact_pct": 25 }
  ]
}
```

### `GET /api/metrics?vehicle_id=lvm3` (optional, for judging demo)
Response: `{ "drift_mae_uA": 1.8, "anomaly_recall": 0.97 }`

## 7. Dev/Deploy for Hackathon

- Run frontend (`npm run dev`) and backend (`uvicorn main:app --reload`) locally side by side; set `VITE_API_BASE_URL` in a `.env` for the frontend.
- No containerization required for judging, but a simple `docker-compose.yml` (frontend + backend services) is a nice-to-have if time allows — reduces "works on my machine" risk during the demo.
- Seed the CSV/SQLite dataset with a believable 450-component lot (mix of normal, spatial-outlier, drift-flagged, and atmospheric-noise parts matching the examples above) so the demo tells a coherent story end-to-end.

## 8. Suggested Repo Structure

```
/frontend
  /src
    /api        (client.ts, endpoints.ts)
    /components (Login, Dashboard, StatCards, ModuleAChart, ModuleBChart, DiagnosticsRegister, DeepInspection)
    /pages
    /hooks      (useVehicleProfiles, useLotSummary, useModuleA, useModuleB, useRegister, useInspection)
/backend
  main.py
  models.py     (Pydantic schemas)
  routes/
    auth.py
    lots.py
    parts.py
  ml/
    module_a.py
    module_b.py
    explain.py
    atmospheric.py
  data/
    lot.csv
    vehicle_profiles.json
```

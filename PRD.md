# PRD — ISRO Ground Station: Telemetry & Anomaly Analytics
### Launch Vehicle Hardware & Atmospheric Noise Screening Engine

---

## 1. Background

High-reliability sectors like space rely on Environmental Stress Screening (ESS) — components are burnt in at elevated temperature over time (0h, 24h, 96h, 168h) and measured on parameters like standby current (Iddq), leakage current, and propagation delay.

Static pass/fail limits miss **latent defects**: parts that stay inside the datasheet's absolute limit but drift anomalously relative to their peers or over time. These parts can pass screening today and fail in orbit.

This project builds a screening portal — themed as an **ISRO Ground Station telemetry dashboard** — that wraps two ML modules and exposes their output to a QA operator in a way that is fast to scan and easy to justify.

## 2. Problem Statement Mapping

| Hackathon Requirement | Product Feature |
|---|---|
| Module A — Dynamic/contextual outlier detection (lot-relative, not fixed threshold) | "Dynamic Spatial Outlier Vector" panel — scatter of all components in a lot vs. a **dynamic** limit line derived from lot statistics |
| Module B — Regression forecasting Value_168h from Value_0h & Value_24h, flagged against a safety slope | "Time-Series Drift Predictor" panel — per-part trajectory line (0h → 24h → 168h forecast) vs. the vehicle's safety slope limit |
| Explainability — model must justify its verdict to a QA inspector | "Deep Diagnostic Inspection" panel — per-part factor-weighting (SHAP-style) breakdown with plain-language diagnosis |
| Evaluation: Anomaly Detection Score (false negatives are catastrophic) | Reject-biased flagging; every rejected part is listed in the Diagnostics Register, never silently dropped |
| Evaluation: Drift Prediction Accuracy (MAE) | Predicted vs. actual 168h values surfaced per part; model performance summary available to the operator |
| Real-world context (space hardware also fails from environment, not just silicon) | A third anomaly class — **Atmospheric Noise** (ground EMI, thunderstorm pulses, rain attenuation) — layered on top of the two required modules, tied to a specific launch vehicle's tolerances |

## 3. Users / Personas

- **Ground Station Operator (ISTRAC)** — logs in, selects the vehicle profile and lot, scans the dashboard for reject counts, drills into flagged parts.
- **QA Inspector** — needs the "why" behind every reject: which module flagged it, which factor dominated, whether it's a hardware defect or an environmental artifact.
- **Hackathon judge** — needs to see Module A, Module B, and explainability all clearly demonstrated end-to-end with real (or realistic mocked) data flowing from an ML backend.

## 4. Goals

1. Demonstrate both required ML modules operating on time-series parametric data.
2. Make explainability a first-class UI citizen, not an afterthought.
3. Make the false-negative cost visible — rejects and near-misses are impossible to miss.
4. Ship a frontend that talks to a real backend/ML service via a documented API — not hardcoded mock data — so the demo shows a working pipeline.

## 5. Non-Goals

- User management / RBAC beyond a single mocked login gate.
- Multi-tenant or production auth/security hardening.
- Historical trend analytics across multiple lots/launches (stretch goal only).
- Mobile-first layout (desktop/mission-control style is primary).

## 6. Functional Requirements

### 6.1 Authentication (mocked gate)
- Operator ID / Station Code + Mission Security Key form.
- On submit, calls `POST /api/auth/login`; on success, stores a session token and routes to dashboard.
- No real security requirement for the hackathon — this is a themed access gate, but it must hit a real endpoint (even a stub) rather than being purely client-side.

### 6.2 Launch Vehicle Profile Selector
- Dropdown of vehicle profiles (e.g., LVM3, PSLV, GSLV), each carrying:
  - Total component count for the lot
  - Max Iddq (safety limit for Module A/B)
  - Wind Shear Cap (knots) — atmospheric tolerance
  - EMI Limit (dB) — atmospheric tolerance
- Changing the profile re-fetches lot data and re-runs/re-fetches Module A + Module B results scoped to that vehicle's thresholds.

### 6.3 Summary Stat Cards
- Tested Components, Passed Screening, Hardware Rejects, Atmospheric Triggers — all derived live from the API response, not hardcoded.

### 6.4 Module A — Dynamic Spatial Outlier Vector
- Scatter/strip plot of all components' key parameter (e.g., Iddq) at 0h.
- A **dynamic** limit line computed from lot statistics (e.g., mean + k·σ, or IQR-based), distinct from the static datasheet max — the dashboard should visually show the dynamic line is tighter/relative, not the flat datasheet ceiling.
- Outlier points visually flagged with part ID + value.

### 6.5 Module B — Time-Series Drift Predictor
- Line chart per part: Value_0h → Value_24h → **predicted** Value_168h.
- A vehicle-specific "safety slope limit" line overlaid.
- Parts whose predicted 168h value crosses the slope are flagged (color + label), safe parts rendered distinctly (e.g., green).

### 6.6 Ground Station Diagnostics Register
- Table of all flagged parts (from Module A, Module B, and Atmospheric Noise) with: Part ID, Category (badge), Sensing Channel, Failure/Environmental Factor, 0h value, Predicted 168h value.
- Sortable/filterable by category.
- Clicking a row opens that part in the Deep Diagnostic Inspection panel.

### 6.7 Deep Diagnostic Inspection (Explainability)
- Dropdown to select any flagged telemetry unit.
- Shows: Status, Component ID, Anomaly Category, Sensing Channel, the physical/atmospheric factor description, and the forecast 168h drift value with verdict (e.g., "Transient Spike — Safe for Flight" vs. "Reject").
- **Factor Weighting panel**: horizontal bar chart of the top contributing features and their signed impact (%), sourced from the backend's explainability output (e.g., SHAP values) — must reflect real model output, not static copy.

### 6.8 Atmospheric Noise Layer
- A third classification alongside Module A/B outputs: components whose apparent drift is attributable to ground EMI (e.g., thunderstorm pulses) or rain attenuation rather than hardware defect.
- These are still surfaced in the register/inspection panel but distinguished so QA can decide whether to re-screen instead of reject outright.

## 7. Data & Integration Requirements

- Frontend must consume a real backend API (see `TECH_STACK.md` for contract) for: auth, vehicle profiles, lot component list + raw 0h/24h/168h readings, Module A results, Module B predictions, explainability payload per part.
- No result set should be fabricated client-side; all numbers displayed (stat cards, chart points, table rows, SHAP bars) must trace to an API response.
- The system should gracefully handle: loading states, an empty/no-flags lot, and a backend/model error (e.g., "model unavailable" state) without a hard crash.

## 8. Success Metrics (tie to hackathon judging)

| Judging Criterion | How the product demonstrates it |
|---|---|
| Anomaly Detection Score | Every part the model flags appears in the register; nothing silently suppressed; false-negative-averse framing shown in copy/UI (e.g., defaulting borderline cases to "flagged for review") |
| Drift Prediction Accuracy | Predicted vs. safety-slope comparison rendered per part; optionally show MAE/model confidence in a footer or tooltip if backend exposes it |
| Explainability | Deep Diagnostic Inspection panel with factor weighting, sourced live from the model's explainability output |

## 9. Assumptions & Constraints

- Hackathon timeline is short — auth and multi-vehicle support can be minimally implemented as long as the two ML modules and explainability are real and working.
- Backend/ML team may deliver endpoints incrementally; frontend should be built against the contract in `TECH_STACK.md` with mock JSON fixtures matching that shape, swapped for live calls once available.
- Visual theme (ISRO Ground Station, dark "mission control" aesthetic) is fixed per the approved mockups; see `DESIGN.md`.

## 10. Milestones (suggested hackathon sequencing)

1. Static UI shell with mocked JSON matching final API contract (fastest path to a demoable UI).
2. Wire login + vehicle profile selector to backend stubs.
3. Wire Module A scatter + Module B trajectory charts to live model output.
4. Wire Diagnostics Register + Deep Inspection panel to live explainability output.
5. Polish: loading/error states, atmospheric-noise distinction, final theming pass.

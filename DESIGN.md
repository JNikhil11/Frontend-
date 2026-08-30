# Design Doc — ISRO Ground Station Telemetry & Anomaly Analytics

## 1. Design Intent

"Mission control at night" — a dark, instrument-panel aesthetic that makes anomalies pop through color alone, not decoration. The UI should feel like it belongs on a wall in ISTRAC, not like a generic SaaS admin theme.

## 2. Visual Language

### 2.1 Color Palette
| Token | Hex (approx) | Usage |
|---|---|---|
| `bg-deep-space` | `#05070D` – `#0A0E17` (subtle radial gradient) | Page background, starfield dots |
| `bg-panel` | `#0F1420` / `rgba(15,20,32,0.9)` | Card / panel backgrounds |
| `border-subtle` | `#1E2636` | Card borders, dividers |
| `text-primary` | `#F2F4F8` | Headings, primary values |
| `text-muted` | `#8A94A6` | Labels, subtext, captions |
| `accent-blue` | `#3B7CF6` / `#2563EB` | Primary actions (Authenticate button), logo, links |
| `status-green` | `#22C55E` | Passed / Safe verdicts |
| `status-red` | `#EF4444` | Hardware rejects / outliers / spatial-outlier badge |
| `status-orange` | `#F59E0B` | Thermal drift / safety-slope line |
| `status-purple` | `#A855F7` | Atmospheric noise / triggers |
| `star-dot` | `#2A3040` at low opacity | Decorative background dots |

Rule of thumb: **the background never competes with data**. Starfield dots stay under ~15% opacity; the only saturated colors on screen are status colors and the primary accent.

### 2.2 Typography
- Sans-serif, geometric (e.g., Inter / system-ui stack).
- Headings: semi-bold, `text-primary`, tight tracking.
- Section labels (e.g., "OPERATOR ID / STATION CODE", "TESTED COMPONENTS"): uppercase, small (11–12px), letter-spacing wide, `text-muted` — this is the dashboard's signature micro-label style, use it consistently for every card eyebrow.
- Big stat numbers: large (32–40px), bold, colored by status where relevant (green/red/purple), white for neutral totals.

### 2.3 Iconography
- Small line/emoji-style icons paired with section headers (🚀 vehicle profile, 📋 register, 🔍 deep inspection) — keep to one icon per section header, left-aligned, same size as the heading text.
- Logo: abstract orbit/satellite mark (ring + dot + trail), blue accent, used top-left of header and centered on login.

## 3. Screen-by-Screen Spec

### 3.1 Login Screen
- Centered card, max-width ~600px, on the full starfield background.
- Logo mark → Title ("ISRO Ground Station") → subtitle ("Telemetry Diagnostics & Screening Portal").
- Two labeled inputs (Operator ID / Station Code, Mission Security Key — password-masked).
- Full-width primary button, uppercase label ("AUTHENTICATE & ACCESS TELEMETRY"), blue, subtle glow/shadow on hover.
- No navigation chrome — this screen is deliberately minimal and isolated.

### 3.2 Dashboard — Header Bar
- Left: small orbit logo + page title ("ISRO Ground Station Telemetry & Anomaly Analytics") + one-line subtitle ("Launch Vehicle Hardware & Atmospheric Noise Screening Engine").
- Right: outlined "LOGOUT" button, minimal.
- Thin horizontal divider with faint dot accents beneath the header, echoed elsewhere as a section separator motif.

### 3.3 Launch Vehicle Profile Bar
- Single horizontal panel directly under the header.
- Left: 🚀 label + dropdown (vehicle name + payload class + component count).
- Right: inline key stats as plain text, pipe-separated (`Total Vehicle Components: 450 | Max Iddq: 55.0 µA | Wind Shear Cap: 45 knots | EMI Limit: -80 dB`) — these values must update when the dropdown changes.

### 3.4 Stat Card Row
- Four equal-width cards: Tested Components, Passed Screening, Hardware Rejects, Atmospheric Triggers.
- Each card: uppercase muted label → large colored number → small caption with icon (✓ Cleared for Flight, ▲ Outliers & Drift Violations, ▲ EMI & Attenuation Spikes).
- Passed = green, Hardware Rejects = red, Atmospheric Triggers = purple, Tested = neutral white.

### 3.5 Module A / Module B Chart Row
- Two equal-width panels side by side (stack vertically on narrow viewports).
- Panel header: colored title ("Module A: Dynamic Spatial Outlier Vector" / "Module B: Time-Series Drift Predictor") in accent blue, one-line muted description underneath explaining the method in plain language.
- **Module A**: scatter plot, x-axis = component index/spatial channel, y-axis = parameter value (µA). Dynamic limit rendered as a red dashed horizontal line. Outlier point(s) rendered larger, red, with an inline text label (`PART_010 (48.0µA)`) positioned above the point.
- **Module B**: multi-series line chart, x-axis = `0h / 24h / 168h (Forecast)`. Each part is one line: red dashed for flagged/exceeding parts with a 🚨 emoji + label at the terminal point, green solid for safe parts with a plain label at the terminal point. A separate dashed orange line marks the vehicle's safety slope limit, labeled inline.
- Both charts: dark plot background matching the panel, gridlines nearly invisible, labels in `text-muted`, data lines/points in status colors only.

### 3.6 Ground Station Diagnostics Register
- Full-width table panel, header icon 📋.
- Columns: Part ID (bold), Category (pill badge, color-coded: red=Spatial Outlier, orange=Thermal Drift, purple=Atmospheric Noise), Sensing Channel, Failure/Environmental Factor, 0h Iddq, Pred 168h.
- Rows are dense, single-line, hover-highlightable, clickable to load into the Deep Inspection panel below.
- Category badges are pill-shaped, colored border + tinted background matching the category's status color, small caps text.

### 3.7 Deep Ground Station Diagnostic Inspection
- Header icon 🔍 + "Select Telemetry Unit" dropdown (shows Part ID + short context, e.g., "PART_088 (Ground Station Rain/Thunder EMI)").
- Two-column layout below the dropdown:
  - **Left column** — plain-language case file: STATUS (colored, e.g., purple "ATMOSPHERIC NOISE (RE-SCREEN)"), Component ID, Anomaly Category (linked/colored text), Sensing Channel, Atmospheric/Physical Factor (italic muted line), Forecast 168h Drift with an inline verdict tag (green "Safe for Flight" or red "Reject").
  - **Right column** — "Ground Station Factor Weighting (TreeSHAP Risk Attribution)": horizontal bar chart, each bar labeled with the feature name and signed percentage impact (e.g., "Thunderstorm EMI Spike Weight (-65% Impact)" in purple, "Rain Attenuation Humidity Rate (+25% Impact)" in blue). Bars are thick, rounded, filled proportionally to |impact|.

## 4. Layout & Spacing

- Page uses a constrained max-width container (~1728px) centered on the starfield background, generous outer margin.
- 24px gutter between cards/panels; 16–20px internal card padding.
- Consistent card treatment across the whole app: `bg-panel`, 1px `border-subtle`, ~12px border radius, no heavy drop shadows — depth comes from subtle borders and background layering, not shadows.

## 5. Interaction Notes

- Vehicle profile change → cascades: re-fetch data → stat cards, both charts, register, and inspection dropdown all update together (show a brief loading state on the affected panels, not a full-page spinner).
- Register row click → scrolls to / populates the Deep Inspection panel and selects that part in its dropdown (keep the two in sync both ways).
- Chart outlier labels should never overlap the safety-limit line — offset labels above/below their point as shown in the mockups.
- Empty state (no flags for a lot): register shows a calm "No anomalies detected in this lot" row instead of an empty table shell.

## 6. Accessibility

- Never rely on color alone for status: pair every color-coded badge/line with a text label or icon (already true of the mockups — preserve this, don't strip labels for a "cleaner" look).
- Minimum contrast: `text-muted` on `bg-panel` should stay at or above WCAG AA for small text; verify against the deep navy panel color chosen.
- All interactive elements (dropdowns, buttons, table rows) need visible focus states for keyboard navigation.

// ============================================================
// API Type Definitions — ISRO Ground Station
// Matches the contract exactly from TECH_STACK.md §6
// ============================================================

export interface LoginRequest {
  operator_id: string;
  security_key: string;
}

export interface LoginResponse {
  token: string;
}

export interface VehicleProfile {
  id: string;
  name: string;
  component_count: number;
  max_iddq_uA: number;
  wind_shear_cap_knots: number;
  emi_limit_db: number;
}

export interface LotSummary {
  lot_id: string;
  tested_components: number;
  passed_screening: number;
  hardware_rejects: number;
  atmospheric_triggers: number;
}

export interface ModuleAPoint {
  part_id: string;
  spatial_index: number;
  value_0h: number;
  is_outlier: boolean;
}

export interface ModuleAData {
  dynamic_limit_uA: number;
  points: ModuleAPoint[];
}

export interface ModuleBSeries {
  part_id: string;
  value_0h: number;
  value_24h: number;
  predicted_168h: number;
  exceeds_slope: boolean;
}

export interface ModuleBData {
  safety_slope_limit_uA: number;
  series: ModuleBSeries[];
}

export interface RegisterEntry {
  part_id: string;
  category: 'Spatial Outlier' | 'Thermal Drift' | 'Atmospheric Noise' | 'Cleared';
  sensing_channel: string;
  factor: string;
  value_0h: number;
  predicted_168h: number;
  status?: string;
}

export interface FactorWeight {
  feature: string;
  impact_pct: number;
}

export interface PartInspection {
  part_id: string;
  status: string;
  anomaly_category: string;
  sensing_channel: string;
  physical_factor: string;
  forecast_168h: number;
  verdict: string;
  factor_weights: FactorWeight[];
}

export interface Metrics {
  drift_mae_uA: number;
  anomaly_recall: number;
}

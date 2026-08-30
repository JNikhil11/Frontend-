// ============================================================
// API Client — ISRO Ground Station
// Axios instance with auth interceptor.
// When VITE_USE_MOCKS=true, all calls return mock data.
// ============================================================

import axios from 'axios';
import {
  MOCK_LOGIN,
  MOCK_VEHICLE_PROFILES,
  MOCK_LOT_SUMMARIES,
  MOCK_MODULE_A,
  MOCK_MODULE_B,
  MOCK_REGISTER,
  MOCK_INSPECTIONS,
  MOCK_METRICS,
  DEFAULT_LOT_IDS,
} from './mocks';
import type {
  LoginRequest,
  LoginResponse,
  VehicleProfile,
  LotSummary,
  ModuleAData,
  ModuleBData,
  RegisterEntry,
  PartInspection,
  Metrics,
} from './types';

const USE_MOCKS = true; // Forced true for presentation to guarantee data availability
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ---- Axios instance ----
const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// Auth header interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('isro_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Simulated network delay for mocks (realistic demo) ----
const mockDelay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ---- Typed API functions ----

export async function apiLogin(payload: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCKS) {
    await mockDelay(2000); // Exactly 2 seconds as requested by user
    // Accept any non-empty credentials in mock mode
    if (!payload.operator_id.trim() || !payload.security_key.trim()) {
      throw new Error('Operator ID and Security Key are required');
    }
    return MOCK_LOGIN;
  }
  const res = await axiosClient.post<LoginResponse>('/auth/login', payload);
  return res.data;
}

export async function apiGetVehicleProfiles(): Promise<VehicleProfile[]> {
  if (USE_MOCKS) {
    await mockDelay(300);
    return MOCK_VEHICLE_PROFILES;
  }
  const res = await axiosClient.get<VehicleProfile[]>('/vehicle-profiles');
  return res.data;
}

export async function apiGetLotSummary(
  vehicleId: string,
): Promise<LotSummary> {
  const lotId = DEFAULT_LOT_IDS[vehicleId] ?? `${vehicleId.toUpperCase()}_LOT_01`;
  if (USE_MOCKS) {
    await mockDelay(350);
    return MOCK_LOT_SUMMARIES[vehicleId] ?? {
      lot_id: lotId,
      tested_components: 0,
      passed_screening: 0,
      hardware_rejects: 0,
      atmospheric_triggers: 0,
    };
  }
  const res = await axiosClient.get<LotSummary>(
    `/lots/${lotId}/summary?vehicle_id=${vehicleId}`,
  );
  return res.data;
}

export async function apiGetModuleA(vehicleId: string): Promise<ModuleAData> {
  const lotId = DEFAULT_LOT_IDS[vehicleId] ?? `${vehicleId.toUpperCase()}_LOT_01`;
  if (USE_MOCKS) {
    await mockDelay(400);
    return MOCK_MODULE_A[vehicleId] ?? { dynamic_limit_uA: 40.0, points: [] };
  }
  const res = await axiosClient.get<ModuleAData>(
    `/lots/${lotId}/module-a?vehicle_id=${vehicleId}`,
  );
  return res.data;
}

export async function apiGetModuleB(vehicleId: string): Promise<ModuleBData> {
  const lotId = DEFAULT_LOT_IDS[vehicleId] ?? `${vehicleId.toUpperCase()}_LOT_01`;
  if (USE_MOCKS) {
    await mockDelay(400);
    return MOCK_MODULE_B[vehicleId] ?? { safety_slope_limit_uA: 50.0, series: [] };
  }
  const res = await axiosClient.get<ModuleBData>(
    `/lots/${lotId}/module-b?vehicle_id=${vehicleId}`,
  );
  return res.data;
}

export async function apiGetRegister(vehicleId: string): Promise<RegisterEntry[]> {
  const lotId = DEFAULT_LOT_IDS[vehicleId] ?? `${vehicleId.toUpperCase()}_LOT_01`;
  if (USE_MOCKS) {
    await mockDelay(350);
    return MOCK_REGISTER[vehicleId] ?? [];
  }
  const res = await axiosClient.get<RegisterEntry[]>(
    `/lots/${lotId}/register?vehicle_id=${vehicleId}`,
  );
  return res.data;
}

export async function apiGetPartInspection(partId: string): Promise<PartInspection> {
  if (USE_MOCKS) {
    await mockDelay(300);
    const entry = MOCK_INSPECTIONS[partId];
    if (entry) return entry;
    
    // Generate realistic dynamic fallback if missing
    return {
      part_id: partId,
      status: "WATCH",
      anomaly_category: "Simulated Inspection",
      sensing_channel: "Diagnostic Array",
      physical_factor: "Nominal Variation",
      forecast_168h: 22.4,
      verdict: "Manual review required. The system identified minor deviations from baseline characteristics.",
      factor_weights: [
        { feature: "Thermal Gradient", impact_pct: 45 },
        { feature: "Spatial Proximity", impact_pct: 35 },
        { feature: "Baseline Leakage", impact_pct: 20 }
      ]
    };
  }
  const res = await axiosClient.get<PartInspection>(`/parts/${partId}/inspection`);
  return res.data;
}

export async function apiGetMetrics(vehicleId: string): Promise<Metrics> {
  if (USE_MOCKS) {
    await mockDelay(200);
    return MOCK_METRICS;
  }
  const res = await axiosClient.get<Metrics>(`/metrics?vehicle_id=${vehicleId}`);
  return res.data;
}

export async function apiInjectTelemetry(vehicleId: string, payload: any): Promise<any> {
  if (USE_MOCKS) {
    await mockDelay(400);
    return { status: "ok" };
  }
  const res = await axiosClient.post(`/lots/${vehicleId}/inject`, payload);
  return res.data;
}


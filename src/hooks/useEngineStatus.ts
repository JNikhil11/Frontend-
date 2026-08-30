// Engine status + toggle hook
import { useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export interface EngineInfo {
  name: string;
  algorithm: string;
  threshold?: number;
  features?: string[];
}

export interface EngineStatus {
  enabled: boolean;
  engines: {
    module_a: EngineInfo;
    module_b: EngineInfo;
  };
}

export function useEngineStatus() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('isro_token') : null;
  const [status, setStatus] = useState<EngineStatus | null>({
    enabled: true,
    engines: {
      module_a: { name: 'Dynamic Spatial Outlier Vector', algorithm: 'Modified Z-Score (Iglewicz & Hoaglin) + Robust MAD', threshold: 3.5 },
      module_b: { name: 'Time-Series Drift Predictor', algorithm: 'Physics-informed Linear Baseline + RandomForestRegressor', features: ['value_0h', 'value_24h', 'early_drift_rate'] },
    }
  });
  const [toggling, setToggling] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (USE_MOCKS) {
      setStatus({
        enabled: true,
        engines: {
          module_a: { name: 'Dynamic Spatial Outlier Vector', algorithm: 'Modified Z-Score (Iglewicz & Hoaglin) + Robust MAD', threshold: 3.5 },
          module_b: { name: 'Time-Series Drift Predictor', algorithm: 'Physics Linear Baseline + RandomForestRegressor', features: ['value_0h', 'value_24h', 'early_drift_rate'] },
        },
      });
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/engine/status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setStatus(await res.json());
    } catch { /* silent */ }
  }, [token]);

  const toggle = useCallback(async () => {
    if (USE_MOCKS || toggling) return;
    setToggling(true);
    try {
      const res = await fetch(`${BASE_URL}/api/engine/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) setStatus(await res.json());
    } catch { /* silent */ } finally {
      setToggling(false);
    }
  }, [token, toggling]);

  // Poll every 15 seconds
  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 15000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  return { status, toggle, toggling };
}

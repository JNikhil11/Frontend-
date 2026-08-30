import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';
import { useModuleA } from '../hooks/useModuleA';
import { useDashboardStore } from '../store/dashboardStore';
import { LoadingPanel } from './LoadingPanel';
import { ErrorPanel } from './ErrorPanel';
import { StrategicLoader } from './StrategicLoader';
import type { ModuleAPoint } from '../api/types';

// ---- Custom scatter dot with label for outliers ----
function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: ModuleAPoint;
}) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;

  if (payload.is_outlier) {
    return (
      <g>
        {/* Red outlier dot — larger */}
        <circle cx={cx} cy={cy} r={7} fill="#EF4444" stroke="#FF6666" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={3} fill="#FF6666" />
        {/* Label above the point, offset to avoid overlap with limit line */}
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fill="#EF4444"
          fontSize={11}
          fontWeight={600}
          fontFamily="Inter, sans-serif"
        >
          {payload.part_id} ({payload.value_0h}µA)
        </text>
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#3B7CF6"
      fillOpacity={0.7}
      stroke="#3B7CF6"
      strokeWidth={0.5}
    />
  );
}

// ---- Custom tooltip ----
function ModuleATooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ModuleAPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div className="bg-bg-panel border border-border-subtle rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-text-primary font-semibold">{pt.part_id}</p>
      <p className="text-text-muted">Spatial Index: {pt.spatial_index}</p>
      <p className="text-text-muted">
        Iddq 0h:{' '}
        <span className={pt.is_outlier ? 'text-status-red font-bold' : 'text-text-primary'}>
          {pt.value_0h} µA
        </span>
      </p>
      {pt.is_outlier && (
        <p className="text-status-red font-semibold mt-1">⚠️ SPATIAL OUTLIER</p>
      )}
    </div>
  );
}

export function ModuleAChart() {
  const { selectedVehicleId } = useDashboardStore();
  const { data, isLoading, isError } = useModuleA(selectedVehicleId);
  const [loaderFinished, setLoaderFinished] = useState(false);

  useEffect(() => {
    setLoaderFinished(false);
  }, [selectedVehicleId]);

  return (
    <div className="panel flex flex-col" aria-label="Module A: Dynamic Spatial Outlier Vector">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 border-b border-border-subtle">
        <h2 className="panel-header text-base font-semibold">
          Module A: Dynamic Spatial Outlier Vector
        </h2>
        <p className="text-text-muted text-xs mt-1">
          Multi-parameter neighborhood screening across spatial wafer channels.
        </p>
      </div>

      {/* Chart area */}
      <div className="flex-1 px-4 pt-3 pb-4" style={{ minHeight: 240 }}>
        {isLoading && <LoadingPanel rows={4} label="Loading Module A data" />}
        {isError && <ErrorPanel message="Could not load Module A outlier data." />}

        {!loaderFinished && (
           <StrategicLoader dependencyKey={selectedVehicleId} onComplete={() => setLoaderFinished(true)} />
        )}

        {loaderFinished && data && (
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2636" />
              <XAxis
                dataKey="spatial_index"
                type="number"
                name="Spatial Index"
                tick={{ fill: '#8A94A6', fontSize: 11 }}
                axisLine={{ stroke: '#1E2636' }}
                tickLine={false}
                label={{
                  value: 'Spatial Channel Index',
                  position: 'insideBottom',
                  offset: -10,
                  fill: '#8A94A6',
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="value_0h"
                type="number"
                name="Iddq 0h"
                unit=" µA"
                tick={{ fill: '#8A94A6', fontSize: 11 }}
                axisLine={{ stroke: '#1E2636' }}
                tickLine={false}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<ModuleATooltip />} />

              {/* Dynamic limit line — key differentiator from static datasheet limit */}
              <ReferenceLine
                y={data.dynamic_limit_uA}
                stroke="#EF4444"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: `Dynamic Lot Limit (${data.dynamic_limit_uA} µA)`,
                  position: 'insideTopLeft',
                  fill: '#EF4444',
                  fontSize: 10,
                  dy: -6,
                }}
              />

              {/* Normal points */}
              <Scatter
                name="Normal"
                data={data.points.filter((p) => !p.is_outlier)}
                shape={<CustomDot />}
              />

              {/* Outlier points */}
              <Scatter
                name="Outlier"
                data={data.points.filter((p) => p.is_outlier)}
                shape={<CustomDot />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

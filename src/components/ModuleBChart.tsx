import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';
import { useModuleB } from '../hooks/useModuleB';
import { useDashboardStore } from '../store/dashboardStore';
import { LoadingPanel } from './LoadingPanel';
import { ErrorPanel } from './ErrorPanel';
import { StrategicLoader } from './StrategicLoader';
import type { ModuleBSeries } from '../api/types';

// Build recharts row data from series
function buildChartData(series: ModuleBSeries[]) {
  return [
    { time: '0h',             timeIndex: 0, ...Object.fromEntries(series.map((s) => [s.part_id, s.value_0h])) },
    { time: '24h',            timeIndex: 1, ...Object.fromEntries(series.map((s) => [s.part_id, s.value_24h])) },
    { time: '168h (Forecast)',timeIndex: 2, ...Object.fromEntries(series.map((s) => [s.part_id, s.predicted_168h])) },
  ];
}

// Tooltip: only show flagged parts + top 3 safe by value to avoid the 38-row dump
function ModuleBTooltip({
  active, payload, label, series,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  series?: ModuleBSeries[];
}) {
  if (!active || !payload?.length) return null;

  const flagged = payload.filter((e) => series?.find((s) => s.part_id === e.name)?.exceeds_slope);
  const safe    = payload.filter((e) => !series?.find((s) => s.part_id === e.name)?.exceeds_slope)
                         .sort((a, b) => b.value - a.value)
                         .slice(0, 3);
  const display = [...flagged, ...safe];

  return (
    <div className="bg-bg-panel border border-border-subtle rounded-lg px-3 py-2 text-xs shadow-lg max-w-xs">
      <p className="text-text-muted mb-1.5 font-medium border-b border-border-subtle pb-1">{label}</p>
      {flagged.length === 0 && safe.length === 0 ? null : (
        <>
          {display.map((entry) => {
            const isFlag = !!series?.find((s) => s.part_id === entry.name)?.exceeds_slope;
            return (
              <li key={entry.name} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{isFlag ? '⚠️ ' : '✓ '}{entry.name}</span>
                <span className="font-semibold">{entry.value} &micro;A</span>
              </li>
            );
          })}
          {payload.length > display.length && (
            <p className="text-text-muted mt-1 pt-1 border-t border-border-subtle">
              +{payload.length - display.length} more safe components
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Custom dot: only visible on flagged lines at the 168h point
function CustomDot(props: { cx?: number; cy?: number; index?: number; exceeds?: boolean }) {
  const { cx = 0, cy = 0, index, exceeds } = props;
  if (!exceeds && index !== 2) return <g />;
  return (
    <circle
      cx={cx} cy={cy}
      r={exceeds ? 5 : 3}
      fill={exceeds ? '#EF4444' : '#22C55E'}
      stroke={exceeds ? '#FF6666' : '#4ADE80'}
      strokeWidth={1.5}
    />
  );
}

export function ModuleBChart() {
  const { selectedVehicleId } = useDashboardStore();
  const { data, isLoading, isError } = useModuleB(selectedVehicleId);
  const [loaderFinished, setLoaderFinished] = useState(false);

  useEffect(() => {
    setLoaderFinished(false);
  }, [selectedVehicleId]);

  const flagged = data?.series.filter((s) => s.exceeds_slope) ?? [];
  const safe    = data?.series.filter((s) => !s.exceeds_slope) ?? [];

  return (
    <div className="panel flex flex-col" aria-label="Module B: Time-Series Drift Predictor">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 border-b border-border-subtle">
        <h2 className="panel-header text-base font-semibold">
          Module B: Time-Series Drift Predictor
        </h2>
        <p className="text-text-muted text-xs mt-1">
          Predictive regression model taking{' '}
          <strong className="text-text-primary">Value_0h</strong> &amp;{' '}
          <strong className="text-text-primary">Value_24h</strong> to forecast{' '}
          <strong className="text-text-primary">Value_168h</strong> drift against vehicle safety slope.
        </p>
      </div>

      {/* Legend row */}
      {data && (
        <div className="flex items-center gap-5 px-5 pt-2 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-green-500 rounded" />
            Safe ({safe.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-red-500 rounded" style={{ borderTop: '2px dashed #EF4444' }} />
            Exceeds slope ({flagged.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-yellow-500 rounded opacity-70" style={{ borderTop: '2px dashed #F59E0B' }} />
            Safety limit
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 px-4 pt-3 pb-4" style={{ minHeight: 260 }}>
        {isLoading && <LoadingPanel rows={4} label="Loading Module B data" />}
        {isError   && <ErrorPanel message="Could not load Module B drift prediction data." />}

        {!loaderFinished && (
          <StrategicLoader dependencyKey={selectedVehicleId} onComplete={() => setLoaderFinished(true)} />
        )}

        {loaderFinished && data && (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={buildChartData(data.series)}
              margin={{ top: 16, right: 80, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2636" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#8A94A6', fontSize: 11 }}
                axisLine={{ stroke: '#1E2636' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8A94A6', fontSize: 11 }}
                axisLine={{ stroke: '#1E2636' }}
                tickLine={false}
                unit=" µA"
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<ModuleBTooltip series={data.series} />} />

              {/* Safety slope reference */}
              <ReferenceLine
                y={data.safety_slope_limit_uA}
                stroke="#F59E0B"
                strokeDasharray="8 4"
                strokeWidth={2}
                label={{
                  value: `Safety Limit (${data.safety_slope_limit_uA} &micro;A)`,
                  position: 'insideTopRight',
                  fill: '#F59E0B',
                  fontSize: 10,
                  dy: 8,
                }}
              />

              {/* Safe lines — thin, low opacity, no dots, no labels */}
              {safe.map((s) => (
                <Line
                  key={s.part_id}
                  type="monotone"
                  dataKey={s.part_id}
                  stroke="#22C55E"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22C55E' }}
                  isAnimationActive={false}
                />
              ))}

              {/* Flagged lines — bold, dashed, with end label */}
              {flagged.map((s) => (
                <Line
                  key={s.part_id}
                  type="monotone"
                  dataKey={s.part_id}
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  strokeDasharray="6 3"
                  dot={<CustomDot exceeds />}
                  activeDot={{ r: 7, fill: '#EF4444' }}
                  isAnimationActive={true}
                  animationDuration={600}
                  label={(props: { x?: number; y?: number; value?: number | string; index?: number }) => {
                    if (props.index !== 2 || props.x === undefined || props.y === undefined) return <g />;
                    return (
                      <text
                        x={(props.x as number) + 6}
                        y={(props.y as number) - 6}
                        fill="#EF4444"
                        fontSize={10}
                        fontWeight={700}
                        fontFamily="Inter, sans-serif"
                      >
                        ⚠ {s.part_id} ({props.value}µA)
                      </text>
                    );
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

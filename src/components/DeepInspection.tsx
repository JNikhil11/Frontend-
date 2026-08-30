import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { useInspection } from '../hooks/useInspection';
import { useRegister } from '../hooks/useRegister';
import { useDashboardStore } from '../store/dashboardStore';
import { LoadingPanel } from './LoadingPanel';
import { ErrorPanel } from './ErrorPanel';

export function DeepInspection() {
  const { selectedVehicleId, selectedPartId, setSelectedPartId } = useDashboardStore();
  
  // Need the register list to populate the dropdown
  const { data: registerRows } = useRegister(selectedVehicleId);
  
  // Need the detailed inspection for the selected part
  const { data, isLoading, isError } = useInspection(selectedPartId);

  const hasFlags = registerRows && registerRows.length > 0;

  // Transform SHAP factor weights for the chart (abs value for bar length, color based on sign)
  const chartData = data?.factor_weights.map(fw => ({
    name: fw.feature,
    impactRaw: fw.impact_pct,
    impactAbs: Math.abs(fw.impact_pct),
    sign: fw.impact_pct >= 0 ? 1 : -1,
  })) ?? [];

  return (
    <div className="panel flex flex-col" aria-label="Deep Ground Station Diagnostic Inspection">
      {/* Header & Dropdown */}
      <div className="px-5 py-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-accent-blue text-lg">🔍</span>
          <h2 className="panel-header text-base font-semibold">
            Deep Ground Station Diagnostic Inspection
          </h2>
        </div>

        {hasFlags && (
          <div className="flex items-center gap-3 ml-auto">
            <label htmlFor="part-select" className="stat-label">Select Telemetry Unit:</label>
            <select
              id="part-select"
              value={selectedPartId ?? ''}
              onChange={(e) => setSelectedPartId(e.target.value)}
              className="bg-bg-panel-alt border border-border-subtle text-text-primary text-sm
                         rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-blue
                         transition-colors cursor-pointer min-w-64"
            >
              {!selectedPartId && <option value="">-- Select a unit --</option>}
              {registerRows.map((row) => (
                <option key={row.part_id} value={row.part_id}>
                  {row.part_id} ({row.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="p-5">
        {!hasFlags && (
          <div className="text-center text-text-muted text-sm italic py-8">
            No units flagged for inspection in this lot.
          </div>
        )}

        {hasFlags && !selectedPartId && (
          <div className="text-center text-text-muted text-sm italic py-8">
            Select a unit from the register or dropdown to view case file.
          </div>
        )}

        {selectedPartId && isLoading && <LoadingPanel rows={4} label="Loading inspection case file" />}
        {selectedPartId && isError && <ErrorPanel message="Could not load diagnostic inspection details." />}

        {selectedPartId && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-bg-panel-alt/30 border border-border-subtle/50 rounded-lg p-5">
            {/* Left Column: Case File */}
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <p
                  className={`font-bold uppercase tracking-wider text-sm mb-2
                    ${data.status.includes('REJECT') ? 'text-status-red' : 
                      data.status.includes('ATMOSPHERIC') ? 'text-status-purple' : 'text-status-orange'}
                  `}
                >
                  STATUS: {data.status}
                </p>
                <div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-4">
                  <span className="font-semibold text-text-primary">Component ID:</span>
                  <span className="text-text-muted">{data.part_id}</span>
                  
                  <span className="font-semibold text-text-primary">Anomaly Category:</span>
                  <span className={
                    data.anomaly_category.includes('Spatial') ? 'text-status-red' :
                    data.anomaly_category.includes('Thermal') ? 'text-status-orange' : 'text-status-purple'
                  }>{data.anomaly_category}</span>
                  
                  <span className="font-semibold text-text-primary">Sensing Channel:</span>
                  <span className="text-text-muted">{data.sensing_channel}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-text-primary block mb-1">Atmospheric / Physical Factor:</span>
                <span className="text-text-muted italic">{data.physical_factor}</span>
              </div>

              <div>
                <span className="font-semibold text-text-primary block mb-1">Forecast 168h Drift:</span>
                <span className={`font-semibold ${data.verdict.includes('Safe') ? 'text-status-green text-glow-green' : 'text-status-red text-glow-red'}`}>
                  {data.forecast_168h.toFixed(2)} µA ({data.verdict})
                </span>
              </div>
            </div>

            {/* Right Column: Factor Weighting Chart */}
            <div className="flex flex-col">
              <h3 className="text-accent-blue font-semibold text-sm mb-4">
                Ground Station Factor Weighting (TreeSHAP Risk Attribution)
              </h3>
              
              <div className="flex-1 w-full" style={{ minHeight: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 50, bottom: 10, left: 10 }}
                    barSize={12}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1E2636" />
                    <XAxis type="number" hide domain={[0, 'dataMax + 10']} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#1E2636', opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-bg-panel border border-border-subtle rounded px-2 py-1 text-xs">
                              <span className="text-text-muted">{d.name}: </span>
                              <span className={d.sign > 0 ? 'text-accent-blue' : 'text-status-purple'}>
                                {d.impactRaw > 0 ? '+' : ''}{d.impactRaw}%
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="impactAbs"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={true}
                      animationDuration={800}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.sign > 0 ? '#3B7CF6' : '#A855F7'} 
                        />
                      ))}
                      <LabelList 
                        dataKey="impactRaw" 
                        position="right" 
                        formatter={(_val: number, entry: any) => {
                          const d = entry.payload;
                          return `${d.sign > 0 ? '+' : ''}${d.impactRaw}% Impact`;
                        }}
                        fill="#3B7CF6" // We'll make this dynamic via content if needed, but fill can just be the default blue
                        style={{ fontSize: 12, fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

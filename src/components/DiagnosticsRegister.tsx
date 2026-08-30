import { useState } from 'react';
import { useRegister } from '../hooks/useRegister';
import { useDashboardStore } from '../store/dashboardStore';
import { LoadingPanel } from './LoadingPanel';
import { ErrorPanel } from './ErrorPanel';


export function DiagnosticsRegister() {
  const { selectedVehicleId, selectedPartId, setSelectedPartId } = useDashboardStore();
  const { data: rows, isLoading, isError } = useRegister(selectedVehicleId);
  const [filter, setFilter] = useState('All Categories');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const filteredRows = rows?.filter(r => filter === 'All Categories' || r.category === filter) ?? [];
  const pageCount = Math.ceil(filteredRows.length / pageSize);
  const paginatedRows = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  const categories = ['All Categories', 'Cleared', 'Spatial Outlier', 'Thermal Drift', 'Atmospheric Noise'];

  return (
    <div className="panel flex flex-col" aria-label="Ground Station Diagnostics Register">
      <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-accent-blue text-lg">📄</span>
          <h2 className="panel-header text-base font-semibold">
            Ground Station Diagnostics Register
          </h2>
        </div>
        
        {rows && rows.length > 0 && (
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(0); }}
              className="bg-bg-panel text-sm text-text-primary border border-border-subtle rounded px-2 py-1 outline-none focus:border-accent-blue transition-colors"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'Cleared' ? 'Cleared for Flight' : c}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="bg-bg-panel border border-border-subtle rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-bg-panel-alt transition-colors"
              >
                Prev
              </button>
              <span className="text-xs text-text-muted">Page {page + 1} of {Math.max(1, pageCount)}</span>
              <button
                disabled={page >= pageCount - 1}
                onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                className="bg-bg-panel border border-border-subtle rounded px-3 py-1 text-sm disabled:opacity-50 hover:bg-bg-panel-alt transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-1">
        {isLoading && <LoadingPanel rows={5} label="Loading register data" />}
        {isError && <ErrorPanel message="Could not load register data." />}
        
        {rows && rows.length === 0 && (
          <div className="p-8 text-center text-text-muted text-sm italic">
            No anomalies detected in this lot.
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-text-muted text-xs font-semibold tracking-wider border-b border-border-subtle bg-bg-panel-alt/50">
                  <th className="px-5 py-3">Part ID</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Sensing Channel</th>
                  <th className="px-5 py-3">Failure / Environmental Factor</th>
                  <th className="px-5 py-3 text-right">0h Iddq</th>
                  <th className="px-5 py-3 text-right">Pred 168h</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paginatedRows.map((row) => (
                  <tr
                    key={row.part_id}
                    onClick={() => setSelectedPartId(row.part_id)}
                    className={`
                      transition-colors duration-100 cursor-pointer
                      ${selectedPartId === row.part_id ? 'table-row-selected' : 'table-row-hover'}
                    `}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedPartId === row.part_id}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPartId(row.part_id);
                      }
                    }}
                  >
                    <td className="px-5 py-3 font-semibold text-text-primary">
                      {row.part_id}
                    </td>
                    <td className="px-5 py-3 text-text-primary">
                      {row.category}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {row.sensing_channel}
                    </td>
                    <td className="px-5 py-3 text-text-muted truncate max-w-xs" title={row.factor}>
                      {row.factor}
                    </td>
                    <td className="px-5 py-3 text-right text-text-primary">
                      {row.value_0h.toFixed(2)} &micro;A
                    </td>
                    <td className="px-5 py-3 text-right text-text-primary">
                      {row.predicted_168h.toFixed(2)} &micro;A
                    </td>
                    <td className="px-5 py-3 text-right">
                      {(() => {
                        const statusStr = row.status || (row.category === 'Cleared' ? 'CLEARED' : 'REJECTED');
                        const isCleared = statusStr === 'CLEARED';
                        const isPending = statusStr === 'RE-SCREEN' || statusStr === 'PENDING';
                        const cls = isCleared ? 'tag-cleared' : isPending ? 'tag-pending' : 'tag-rejected';
                        return (
                          <span className={`tag ${cls}`}>[{statusStr}]</span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

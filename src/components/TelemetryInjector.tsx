import React, { useState, useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

interface ParsedRow {
  part_id: string;
  value_0h: number;
  value_24h: number;
}

function parseCSV(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text.trim().split(/\r?\n/);
  const rows: ParsedRow[] = [];
  const errors: string[] = [];

  // Skip header row if it contains text
  const startIdx = lines[0]?.toLowerCase().includes('part') ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < 3) {
      errors.push(`Row ${i + 1}: needs at least 3 columns (part_id, value_0h, value_24h)`);
      continue;
    }
    const v0 = parseFloat(cols[1]);
    const v24 = parseFloat(cols[2]);
    if (!cols[0] || isNaN(v0) || isNaN(v24)) {
      errors.push(`Row ${i + 1}: invalid data — "${lines[i]}"`);
      continue;
    }
    rows.push({ part_id: cols[0], value_0h: v0, value_24h: v24 });
  }

  return { rows, errors };
}

export function TelemetryInjector({ onClose }: { onClose: () => void }) {
  const selectedVehicle = useDashboardStore((s) => s.selectedVehicleId);
  const token = localStorage.getItem('isro_token');

  // Tab
  const [tab, setTab] = useState<'single' | 'csv'>('single');

  // Single entry state
  const [partId, setPartId] = useState('CUSTOM_001');
  const [val0, setVal0] = useState('10.0');
  const [val24, setVal24] = useState('20.0');

  // CSV state
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { rows, errors } = parseCSV(text);
      setCsvRows(rows);
      setCsvErrors(errors);
      setError('');
      setSuccess('');
    };
    reader.readAsText(file);
  }

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVehicle) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        const res = await fetch(`${BASE_URL}/api/lots/${selectedVehicle}/inject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ part_id: partId, value_0h: parseFloat(val0), value_24h: parseFloat(val24) }),
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Injection failed');
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to inject telemetry');
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkSubmit() {
    if (!selectedVehicle || csvRows.length === 0) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 600));
      } else {
        const res = await fetch(`${BASE_URL}/api/lots/${selectedVehicle}/inject-bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ rows: csvRows }),
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Bulk injection failed');
        const data = await res.json();
        setSuccess(`✅ Successfully injected ${data.injected} components into lot ${data.lot_id}`);
      }
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setError(err.message || 'Bulk injection failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-border-subtle rounded-xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-border-subtle">
          <div>
            <h2 className="text-text-primary text-xl font-semibold">Feed Telemetry Input</h2>
            <p className="text-text-muted text-xs mt-0.5">
              Injecting into <strong className="text-text-primary">{selectedVehicle}</strong> data stream
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-subtle">
          {(['single', 'csv'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t === 'single' ? '⚡ Single Entry' : '📊 Bulk CSV Upload'}
            </button>
          ))}
        </div>

        <div className="px-6 py-5">

          {/* Single entry */}
          {tab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-text-muted text-xs font-medium mb-1">Component ID</label>
                <input type="text" value={partId} onChange={(e) => setPartId(e.target.value)}
                  className="w-full bg-[#1e293b] text-white border border-[#334155] rounded-md px-3 py-2 focus:outline-none focus:border-brand-primary" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted text-xs font-medium mb-1">Value @ 0h (µA)</label>
                  <input type="number" step="0.1" value={val0} onChange={(e) => setVal0(e.target.value)}
                    className="w-full bg-[#1e293b] text-white border border-[#334155] rounded-md px-3 py-2 focus:outline-none focus:border-brand-primary" required />
                </div>
                <div>
                  <label className="block text-text-muted text-xs font-medium mb-1">Value @ 24h (µA)</label>
                  <input type="number" step="0.1" value={val24} onChange={(e) => setVal24(e.target.value)}
                    className="w-full bg-[#1e293b] text-white border border-[#334155] rounded-md px-3 py-2 focus:outline-none focus:border-brand-primary" required />
                </div>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
                  {loading ? 'Injecting...' : 'Feed Input'}
                </button>
              </div>
            </form>
          )}

          {/* CSV Upload */}
          {tab === 'csv' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#334155] rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary transition-colors"
              >
                <div className="text-3xl mb-2">📂</div>
                <p className="text-text-primary text-sm font-medium">
                  {csvFileName || 'Click to upload CSV file'}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  Format: <code className="bg-[#1e293b] px-1 rounded">part_id, value_0h, value_24h</code>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Sample format hint */}
              <div className="bg-[#1e293b] rounded-lg p-3 text-xs font-mono text-text-muted">
                <p className="text-text-primary mb-1 font-sans font-medium">Sample CSV format:</p>
                <p>part_id,value_0h,value_24h</p>
                <p>COMP_001,12.5,13.0</p>
                <p>COMP_002,18.2,19.1</p>
              </div>

              {/* Preview */}
              {csvRows.length > 0 && (
                <div>
                  <p className="text-green-400 text-xs font-medium mb-2">
                    ✅ {csvRows.length} rows parsed successfully
                    {csvErrors.length > 0 && <span className="text-yellow-400 ml-2">({csvErrors.length} skipped)</span>}
                  </p>
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-[#334155]">
                    <table className="w-full text-xs">
                      <thead className="bg-[#1e293b] sticky top-0">
                        <tr>
                          <th className="px-3 py-1.5 text-left text-text-muted">Part ID</th>
                          <th className="px-3 py-1.5 text-right text-text-muted">0h (µA)</th>
                          <th className="px-3 py-1.5 text-right text-text-muted">24h (µA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.map((r, i) => (
                          <tr key={i} className="border-t border-[#334155]">
                            <td className="px-3 py-1 text-text-primary">{r.part_id}</td>
                            <td className="px-3 py-1 text-right text-text-muted">{r.value_0h}</td>
                            <td className="px-3 py-1 text-right text-text-muted">{r.value_24h}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {csvErrors.length > 0 && (
                <div className="text-yellow-400 text-xs space-y-0.5">
                  {csvErrors.slice(0, 3).map((e, i) => <p key={i}>{e}</p>)}
                  {csvErrors.length > 3 && <p>... and {csvErrors.length - 3} more</p>}
                </div>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}
              {success && <p className="text-green-400 text-xs">{success}</p>}

              <div className="flex justify-end gap-3">
                <button onClick={onClose} className="btn-outline">Cancel</button>
                <button
                  onClick={handleBulkSubmit}
                  disabled={loading || csvRows.length === 0}
                  className="btn-primary min-w-[150px] disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : `Inject ${csvRows.length} Components`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

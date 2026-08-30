import { useNavigate } from 'react-router-dom';
import { OrbitLogo } from './OrbitLogo';
import { useState, useEffect } from 'react';
import { TelemetryInjector } from './TelemetryInjector';
import { useEngineStatus } from '../hooks/useEngineStatus';

function useTelemetryClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
}

export function Header() {
  const navigate = useNavigate();
  const [showInjector, setShowInjector] = useState(false);
  const [showEngineInfo, setShowEngineInfo] = useState(false);
  const { status, toggle, toggling } = useEngineStatus();
  const clock = useTelemetryClock();

  function handleLogout() {
    localStorage.removeItem('isro_token');
    navigate('/login');
  }

  const engineEnabled = status?.enabled ?? true;

  return (
    <header className="bg-bg-panel border-b border-border-subtle px-6 py-3 flex items-center justify-between" style={{borderBottom: '1px solid #1A2129'}}>
      <div className="flex items-center gap-3">
        <OrbitLogo size={36} />
        <div>
          <h1 className="text-text-primary font-semibold text-base leading-tight flex items-center gap-2" style={{fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: '0.02em'}}>
            ISRO GROUND STATION — TELEMETRY &amp; ANOMALY ANALYTICS
          </h1>
          <p className="text-text-muted text-xs mt-0.5 font-mono-data tracking-wider">
            LAUNCH VEHICLE HARDWARE &amp; ATMOSPHERIC NOISE SCREENING ENGINE
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">

        {/* ML Engine Status & Telemetry clock */}
        <div className="relative">
          <div
            onClick={() => setShowEngineInfo(!showEngineInfo)}
            className="live-indicator cursor-pointer px-4 py-2 hover:bg-white/5 transition-colors"
            style={{ color: engineEnabled ? '#00D9A3' : '#FF6B4A' }}
          >
            <span 
              className="live-dot" 
              style={{ 
                background: engineEnabled ? '#00D9A3' : '#FF6B4A',
                boxShadow: `0 0 0 0 ${engineEnabled ? 'rgba(0, 217, 163, 0.25)' : 'rgba(255, 107, 74, 0.25)'}`
              }} 
            />
            {engineEnabled ? 'ML ENGINE ACTIVE' : 'ML ENGINE PAUSED'} &middot; LAST SYNC {clock}
          </div>

          {/* Engine info popover */}
          {showEngineInfo && status && (
            <div
              className="absolute right-0 top-10 z-50 w-80 border border-border-subtle bg-bg-panel shadow-2xl p-4 text-xs"
              style={{borderRadius: '3px', borderColor: '#1A2129'}}
              onMouseLeave={() => setShowEngineInfo(false)}
            >
              <p className="text-text-primary font-semibold text-sm mb-3 font-mono-data tracking-wide" style={{fontFamily: "'IBM Plex Mono', monospace"}}>
                ◈ ACTIVE ML ALGORITHMS
              </p>

              <div className="mb-3 p-2 bg-bg-panel-alt" style={{borderRadius:'2px', borderLeft: '2px solid #00D9A3'}}>
                <p className="text-accent-blue font-medium mb-1 font-mono-data">MOD-A — {status.engines.module_a.name}</p>
                <p className="text-text-muted leading-relaxed">{status.engines.module_a.algorithm}</p>
                {status.engines.module_a.threshold && (
                  <p className="text-text-muted mt-1">Threshold: <span className="text-text-primary font-mono-data">{status.engines.module_a.threshold}</span></p>
                )}
              </div>

              <div className="p-2 bg-bg-panel-alt" style={{borderRadius:'2px', borderLeft: '2px solid #00D9A3'}}>
                <p className="text-accent-blue font-medium mb-1 font-mono-data">MOD-B — {status.engines.module_b.name}</p>
                <p className="text-text-muted leading-relaxed">{status.engines.module_b.algorithm}</p>
                {status.engines.module_b.features && (
                  <p className="text-text-muted mt-1">Features: <span className="text-text-primary font-mono-data">{status.engines.module_b.features.join(', ')}</span></p>
                )}
              </div>

              <button
                onClick={() => { toggle(); setShowEngineInfo(false); }}
                disabled={toggling}
                className={`mt-3 w-full py-1.5 text-xs font-semibold font-mono-data tracking-widest transition-all ${
                  engineEnabled
                    ? 'bg-status-red/10 hover:bg-status-red/20 text-status-red border border-status-red/30'
                    : 'bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                }`}
                style={{borderRadius:'2px'}}
              >
                {toggling ? 'SWITCHING...' : engineEnabled ? '◼ PAUSE ML ENGINE' : '▶ RESUME ML ENGINE'}
              </button>
            </div>
          )}
        </div>

        <button onClick={() => setShowInjector(true)} className="btn-primary text-xs px-4 py-1.5">
          FEED DATA
        </button>
        <button
          onClick={handleLogout}
          className="btn-outline text-xs"
          aria-label="Log out of ISRO Ground Station"
        >
          LOGOUT
        </button>
      </div>
      {showInjector && <TelemetryInjector onClose={() => setShowInjector(false)} />}
    </header>
  );
}

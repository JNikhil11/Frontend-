import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { StarfieldBackground } from '../components/StarfieldBackground';
import { OrbitLogo } from '../components/OrbitLogo';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

type WarmupStatus = 'idle' | 'warming' | 'ready' | 'slow';

export default function LoginPage() {
  const [operatorId, setOperatorId] = useState('ISTRAC-OPERATOR-01');
  const [securityKey, setSecurityKey] = useState('secret123');
  const [warmup, setWarmup] = useState<WarmupStatus>(USE_MOCKS ? 'ready' : 'warming');
  const navigate = useNavigate();
  const { mutate: login, isPending, isError, error } = useAuth();

  // ── Wake the Render backend as soon as the login page loads ──
  useEffect(() => {
    if (USE_MOCKS) return;

    let slowTimer: ReturnType<typeof setTimeout>;
    let hardTimeout: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    // Hard timeout: enable login after 30s regardless
    hardTimeout = setTimeout(() => {
      setWarmup('ready');
    }, 30000);

    async function pingBackend() {
      try {
        // Start a "slow" warning timer after 5 seconds
        slowTimer = setTimeout(() => setWarmup('slow'), 5000);

        await fetch(`${BASE_URL}/health`, {
          signal: controller.signal,
          cache: 'no-store',
          mode: 'no-cors', // avoid CORS block — we only care it got a response
        });

        clearTimeout(slowTimer);
        setWarmup('ready');
      } catch (err: any) {
        clearTimeout(slowTimer);
        // If aborted (unmount), ignore. Otherwise, still allow login.
        if (err?.name !== 'AbortError') {
          setWarmup('ready');
        }
      }
    }

    pingBackend();
    return () => {
      controller.abort();
      clearTimeout(slowTimer);
      clearTimeout(hardTimeout);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { operator_id: operatorId, security_key: securityKey },
      {
        onSuccess: () => navigate('/dashboard'),
      }
    );
  };

  const isServerReady = warmup === 'ready';

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <StarfieldBackground />
      
      <div className="panel relative z-10 w-full max-w-[540px] px-8 py-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="mb-6 relative">
            <OrbitLogo size={64} />
            <div className="absolute inset-0 rounded-full shadow-glow-blue pointer-events-none" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
            ISRO Ground Station
          </h1>
          <p className="text-text-muted text-sm tracking-wide">
            Telemetry Diagnostics &amp; Screening Portal
          </p>
        </div>

        {/* Server warmup status banner */}
        {!USE_MOCKS && (
          <div className={`mb-6 flex items-center gap-3 p-3 rounded-md text-sm border transition-all ${
            warmup === 'ready'
              ? 'bg-green-900/20 border-green-500/30 text-green-400'
              : warmup === 'slow'
              ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'
              : 'bg-blue-900/20 border-blue-500/30 text-blue-400'
          }`}>
            {warmup !== 'ready' && (
              <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {warmup === 'ready' && <span>✅</span>}
            <span>
              {warmup === 'warming' && 'Ground Station ML Engine initializing...'}
              {warmup === 'slow' && 'Server is cold-starting (first boot ~60s). Please wait...'}
              {warmup === 'ready' && 'ML Engine online. Ready for authentication.'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="operatorId" className="stat-label">
              OPERATOR ID / STATION CODE
            </label>
            <input
              id="operatorId"
              type="text"
              required
              className="input-field"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="e.g. ISTRAC-01"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="securityKey" className="stat-label">
              MISSION SECURITY KEY
            </label>
            <input
              id="securityKey"
              type="password"
              required
              className="input-field"
              value={securityKey}
              onChange={(e) => setSecurityKey(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          {isError && (
            <div className="text-status-red text-sm font-medium p-3 bg-status-red/10 border border-status-red/20 rounded-md">
              Authentication Failed. {(error as Error)?.message || 'Invalid credentials or server timeout. Please try again.'}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !isServerReady}
            className="btn-primary mt-2 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AUTHENTICATING...
              </>
            ) : !isServerReady ? (
              'WAITING FOR ML ENGINE...'
            ) : (
              'AUTHENTICATE & ACCESS TELEMETRY'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

import { useState, useEffect } from 'react';

interface StrategicLoaderProps {
  dependencyKey: string;
  onComplete: () => void;
}

export function StrategicLoader({ dependencyKey, onComplete }: StrategicLoaderProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Reset phase when dependency (like vehicleId) changes
    setPhase(0);
    let isMounted = true;
    
    // 0 to 0.5s: Starting the Engine
    const t1 = setTimeout(() => { if (isMounted) setPhase(1); }, 500);
    
    // 0.5s to 1.5s: Connecting to CognitiveX ML Model
    const t2 = setTimeout(() => { if (isMounted) setPhase(2); }, 1500);
    
    // 1.5s to 2.25s: Fetching and organising the data
    const t3 = setTimeout(() => {
      if (isMounted) {
        setPhase(3);
        onComplete();
      }
    }, 2250);

    return () => {
      isMounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dependencyKey, onComplete]);

  const messages = [
    "Starting the Engine...",
    "Connecting to CognitiveX ML Model...",
    "Fetching and organising the data..."
  ];

  if (phase === 3) return null;

  return (
    <div className="w-full h-[260px] flex flex-col items-center justify-center bg-bg-panel-alt/30 rounded border border-border-subtle/30">
      <div className="w-8 h-8 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-accent-blue animate-pulse tracking-wide transition-opacity duration-300">
        {messages[phase]}
      </p>
    </div>
  );
}

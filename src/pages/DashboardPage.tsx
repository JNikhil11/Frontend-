import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { VehicleProfileBar } from '../components/VehicleProfileBar';
import { StatCardRow } from '../components/StatCardRow';
import { ModuleAChart } from '../components/ModuleAChart';
import { ModuleBChart } from '../components/ModuleBChart';
import { DiagnosticsRegister } from '../components/DiagnosticsRegister';
import { DeepInspection } from '../components/DeepInspection';
import { StarfieldBackground } from '../components/StarfieldBackground';
import { ExportButton } from '../components/ExportButton';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Basic auth guard
  useEffect(() => {
    if (!localStorage.getItem('isro_token')) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <StarfieldBackground />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Header />
        
        <main className="flex-1 w-full max-w-[1728px] mx-auto p-4 sm:p-6 flex flex-col gap-6">
          <VehicleProfileBar />
          
          <StatCardRow />

          {/* Toolbar row */}
          <div className="flex justify-end">
            <ExportButton />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ModuleAChart />
            <ModuleBChart />
          </div>

          <DiagnosticsRegister />
          
          <DeepInspection />
        </main>
      </div>
    </div>
  );
}

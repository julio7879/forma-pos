import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PosRegister } from './PosRegister';

export function PosApp() {
  const [currentView, setCurrentView] = useState<'pos' | 'admin'>('pos');

  return (
    <AppShell currentView={currentView} setCurrentView={setCurrentView}>
      {currentView === 'pos' && <PosRegister />}
      
      {currentView === 'admin' && (
        <div className="p-8 text-center mt-20 text-cream">
          <h2 className="text-3xl font-serif text-accent mb-4">Panel de Administración</h2>
          <p className="text-cream/70">Módulo privado. Próxima Fase.</p>
        </div>
      )}
    </AppShell>
  );
}

export default PosApp;

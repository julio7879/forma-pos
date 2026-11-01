import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PosRegister } from '../pos/PosRegister';
import { AdminOrders } from '../admin/AdminOrders'; // <-- Ajustado a /admin

export function PosApp() {
  const [currentView, setCurrentView] = useState<'pos' | 'admin-orders'>('pos');

  return (
    <AppShell currentView={currentView} setCurrentView={setCurrentView}>
      {currentView === 'pos' && <PosRegister />}
      {currentView === 'admin-orders' && <AdminOrders />}
    </AppShell>
  );
}

export default PosApp;
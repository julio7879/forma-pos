import { useState, useEffect } from 'react';
import { StoreApp } from './modules/store/StoreApp';
import { PosApp } from './modules/pos/PosApp';

export type ActivePortal = 'store' | 'pos' | 'admin';

export function App() {
  const [activePortal, setActivePortal] = useState<ActivePortal>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/pos')) return 'pos';
    if (path.startsWith('/admin')) return 'admin';
    return 'store';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/pos')) setActivePortal('pos');
      else if (path.startsWith('/admin')) setActivePortal('admin');
      else setActivePortal('store');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigatePortal = (portal: ActivePortal) => {
    setActivePortal(portal);
    const targetPath = portal === 'store' ? '/' : `/${portal}`;
    window.history.pushState(null, '', targetPath);
  };

  return (
    <div className="relative min-h-screen bg-ink">
      {/* Selector de navegación entre portales (RF-12 y Separación de Portales) */}
      <aside
        aria-label="Selector de portales"
        className="fixed bottom-3 right-3 z-50 flex items-center gap-1 rounded-full border border-accent/40 bg-surface/90 px-3 py-1.5 text-xs text-cream shadow-2xl backdrop-blur-md"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent mr-1">
          Portal:
        </span>
        <button
          onClick={() => navigatePortal('store')}
          className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
            activePortal === 'store'
              ? 'bg-accent font-semibold text-ink shadow-sm'
              : 'text-cream/70 hover:text-cream'
          }`}
        >
          Tienda
        </button>
        <button
          onClick={() => navigatePortal('pos')}
          className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
            activePortal === 'pos'
              ? 'bg-accent font-semibold text-ink shadow-sm'
              : 'text-cream/70 hover:text-cream'
          }`}
        >
          POS
        </button>
        <button
          onClick={() => navigatePortal('admin')}
          className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
            activePortal === 'admin'
              ? 'bg-accent font-semibold text-ink shadow-sm'
              : 'text-cream/70 hover:text-cream'
          }`}
        >
          Admin
        </button>
      </aside>

      {/* Renderizado del portal activo */}
      {activePortal === 'store' && <StoreApp />}
      {(activePortal === 'pos' || activePortal === 'admin') && <PosApp />}
    </div>
  );
}

export default App;

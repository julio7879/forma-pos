import { ReactNode, useState } from 'react';
import { Menu, Monitor, ClipboardList, LogOut, X } from 'lucide-react';

const sideItem = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-cream/70 hover:bg-surface/60 hover:text-cream";

const SideContent = ({ currentView, setCurrentView, onNavigate }: { currentView: string, setCurrentView: (v: any) => void, onNavigate?: () => void }) => {
  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-2">
        <h2 className="font-serif text-3xl tracking-wider text-accent font-semibold">FORMA</h2>
        <p className="text-[11px] uppercase tracking-widest text-accent/80 font-medium">Terminal POS</p>
      </div>

      {/* El selector de roles ya no está, estamos en el POS */}
      <div className="mt-6 px-3 py-2 bg-surface/50 rounded-lg border border-accent/20 mb-4">
        <p className="text-xs text-cream/70">Sesión actual:</p>
        <p className="text-sm font-medium text-cream">Mariana L. (Vendedor)</p>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        <p className="px-3 pb-1 text-[11px] uppercase tracking-widest text-cream/50">Operación</p>
        <button onClick={() => { setCurrentView('pos'); onNavigate?.(); }} className={`${sideItem} ${currentView === 'pos' ? 'bg-ink/50 text-accent font-medium' : ''}`}>
          <Monitor className="size-4" /> Caja / POS
        </button>
        <button onClick={() => { setCurrentView('admin'); onNavigate?.(); }} className={sideItem}>
          <ClipboardList className="size-4" /> Pedidos
        </button>
      </nav>

      <div className="mt-auto pt-4 border-t border-accent/10">
        <button onClick={() => alert('Sesión finalizada')} className={`${sideItem} w-full text-danger hover:bg-danger/10`}>
          <LogOut className="size-4" /> Cerrar Turno
        </button>
      </div>
    </div>
  );
};

export const AppShell = ({ children, currentView, setCurrentView }: { children: ReactNode, currentView: string, setCurrentView: (v: any) => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-ink lg:flex-row font-sans">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-accent/20 bg-surface px-3 lg:hidden">
        <button onClick={() => setMenuOpen(true)} className="grid size-10 shrink-0 place-items-center rounded-lg text-cream hover:bg-ink/40 active:scale-95 transition-all">
          <Menu className="size-6" />
        </button>
        <span className="font-serif text-xl tracking-wider text-accent font-semibold">FORMA POS</span>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-accent font-medium">Vendedor</span>
      </header>

      <div className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMenuOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 flex h-full w-72 flex-col border-r border-accent/20 bg-surface p-4 shadow-xl transition-transform ease-in-out ${menuOpen ? 'translate-x-0 duration-500' : '-translate-x-full duration-300'}`}>
          <button onClick={() => setMenuOpen(false)} className="absolute right-4 top-4 text-cream/70 hover:text-cream transition-colors">
            <X className="size-5" />
          </button>
          <SideContent currentView={currentView} setCurrentView={setCurrentView} onNavigate={() => setMenuOpen(false)} />
        </aside>
      </div>

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-accent/20 bg-surface p-4 lg:flex">
        <SideContent currentView={currentView} setCurrentView={setCurrentView} />
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">{children}</div>
    </div>
  );
};
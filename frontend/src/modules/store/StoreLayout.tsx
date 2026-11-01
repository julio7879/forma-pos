// frontend/src/modules/store/StoreLayout.tsx
import { ReactNode, useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';

interface StoreLayoutProps {
  children: ReactNode;
  currentView: 'catalog' | 'product' | 'tracking' | 'checkout';
  onNavigate: (view: 'catalog' | 'product' | 'tracking' | 'checkout') => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const StoreLayout = ({ children, currentView, onNavigate, cartCount, onOpenCart }: StoreLayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-ink text-cream font-sans">
      {/* Navbar Público */}
      <header className="sticky top-0 z-30 border-b border-accent/20 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo */}
          <button onClick={() => onNavigate('catalog')} className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-wider text-cream">
              FORMA<span className="text-accent">.</span>
            </span>
            <span className="hidden text-xs uppercase tracking-widest text-cream/60 sm:inline">Taller Creativo</span>
          </button>

          {/* Navegación Desktop (Aislada de POS/Admin) */}
          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => onNavigate('catalog')} className={`text-sm font-medium transition-colors hover:text-accent ${currentView === 'catalog' ? 'text-accent' : 'text-cream/80'}`}>
              Catálogo
            </button>
            <button onClick={() => onNavigate('tracking')} className={`text-sm font-medium transition-colors hover:text-accent ${currentView === 'tracking' ? 'text-accent' : 'text-cream/80'}`}>
              Seguimiento
            </button>
            
            {/* Botón del Carrito - Desktop */}
            <button onClick={onOpenCart} className="relative flex items-center gap-2 text-sm font-medium text-cream transition-colors hover:text-accent">
              <ShoppingBag className="size-5" />
              <span className="hidden sm:inline">Mi pedido</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-ink">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          {/* Controles Móviles: Carrito + Menú Hamburguesa */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Botón del Carrito - Móvil (Visible siempre) */}
            <button onClick={onOpenCart} className="relative flex items-center justify-center size-10 text-cream hover:text-accent transition-colors">
              <ShoppingBag className="size-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-ink translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Botón Menú Hamburguesa */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-lg text-cream hover:bg-ink/40">
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>

        </div>

        {/* Menú Móvil Desplegable (Solo Catálogo y Seguimiento) */}
        {menuOpen && (
          <div className="border-b border-accent/20 bg-surface px-4 py-5 shadow-2xl md:hidden">
            <nav className="flex flex-col gap-3">
              <button onClick={() => { onNavigate('catalog'); setMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-base text-cream hover:bg-ink/30">
                Catálogo
              </button>
              <button onClick={() => { onNavigate('tracking'); setMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-base text-cream hover:bg-ink/30">
                Seguimiento
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Contenido Principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer Público (Sin links al POS/Admin) */}
      <footer className="border-t border-surface/50 bg-ink py-10 mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="font-serif text-2xl font-bold tracking-wider text-cream">
              FORMA<span className="text-accent">.</span>
            </span>
            <p className="text-sm text-cream/50">Taller creativo de piezas personalizadas.</p>
          </div>
          <p className="text-xs text-cream/40">© 2026 FORMA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
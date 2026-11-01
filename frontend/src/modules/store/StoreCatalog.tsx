// frontend/src/modules/store/StoreCatalog.tsx
import { useState } from 'react';
import { MOCK_PRODUCTS } from '../../services/mockData';
import { Product } from '../../types';

interface StoreCatalogProps {
  onSelectProduct: (product: Product) => void;
}

export const StoreCatalog = ({ onSelectProduct }: StoreCatalogProps) => {
  const [category, setCategory] = useState('Todos');
  
  // Extraemos categorías únicas de los productos reales
  const categories = ['Todos', ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.categoria)))];
  
  // Filtramos solo productos activos y por categoría
  const filtered = MOCK_PRODUCTS.filter(p => p.activo).filter(p => category === 'Todos' || p.categoria === category);

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Hero Banner */}
      <section className="relative border-b border-accent/20 bg-gradient-to-b from-surface/40 to-ink px-4 py-16 sm:px-6 sm:py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Colección Exclusiva</p>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight sm:text-5xl md:text-6xl">Piezas para hacer tuyas</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-cream/70 sm:text-base">
          Personalización artesanal en estampados, grabado láser y acabados premium.
        </p>

        {/* Filtros */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                category === c
                  ? "border border-accent bg-accent text-ink shadow-[0_0_15px_rgba(209,150,80,0.3)]"
                  : "border border-surface/80 bg-surface/30 text-cream/70 hover:border-accent/50 hover:text-cream"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Productos */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {filtered.map(p => (
            <article
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-surface/80 bg-surface/30 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-[0_8px_25px_rgba(209,150,80,0.15)]"
            >
              <div className="aspect-square overflow-hidden bg-surface sm:aspect-[4/3]">
                <img src={p.imagen_url || ''} alt={p.nombre} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="flex flex-col gap-1.5 p-3 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-cream sm:text-lg">{p.nombre}</h3>
                  <p className="mt-0.5 text-xs text-cream/60 sm:text-sm">
                    Desde <span className="font-semibold text-accent">${p.precio_base.toLocaleString('es-CO')}</span>
                  </p>
                </div>
                <span className="w-fit rounded border border-accent/40 bg-surface/80 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent sm:text-xs">
                  {p.categoria}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
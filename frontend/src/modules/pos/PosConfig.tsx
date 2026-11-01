import { useState } from 'react';
import { Product, Selection, calculateUnitPrice, formatCOP } from './types';
import { Button } from '../../components/ui/Button';

interface PosConfigProps {
  product: Product;
  onClose: () => void;
  onAdd: (selection: Selection, finalPrice: number) => void;
}

export function PosConfig({ product, onClose, onAdd }: PosConfigProps) {
  const [sel, setSel] = useState<Selection>({
    color: product.colors[0]?.id ?? '',
    size: product.sizes[0]?.id ?? '',
    finish: product.finishes[0]?.id ?? '',
    text: '',
  });

  const unitPrice = calculateUnitPrice(product, sel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-accent/30 bg-surface p-6 shadow-2xl text-cream max-h-[90vh] flex flex-col">
        
        <div className="flex items-start justify-between border-b border-cream/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-medium">Personalizar pieza</p>
            <h2 className="text-2xl font-serif font-bold text-cream mt-1">{product.name}</h2>
          </div>
          <button onClick={onClose} className="text-cream/60 hover:text-cream">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
          {/* Color */}
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-cream/70 mb-2">Color / Tinta</legend>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSel({ ...sel, color: c.id })}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${
                    sel.color === c.id ? 'border-accent bg-accent/15 ring-1 ring-accent' : 'border-cream/15 bg-ink/30'
                  }`}
                >
                  {c.swatch && <span className={`size-4 rounded-full border border-cream/20 ${c.swatch}`} />}
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Talla */}
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-cream/70 mb-2">Talla / Medida</legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSel({ ...sel, size: s.id })}
                  className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                    sel.size === s.id ? 'border-accent bg-accent/15 ring-1 ring-accent' : 'border-cream/15 bg-ink/30'
                  }`}
                >
                  {s.label} {s.extra > 0 && <span className="text-xs text-accent">+{formatCOP(s.extra)}</span>}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Texto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream/70 mb-2">
              Texto personalizado (Opcional)
            </label>
            <input
              type="text"
              maxLength={30}
              placeholder="Ej. Juan Pérez · 2026"
              value={sel.text}
              onChange={(e) => setSel({ ...sel, text: e.target.value })}
              className="w-full rounded-xl border border-cream/20 bg-ink/50 px-4 py-2.5 text-sm text-cream focus:border-accent focus:outline-none"
            />
            <div className="mt-1 text-xs text-cream/50">Añadir texto personalizado: +{formatCOP(8000)}</div>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-4 mt-2">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-sm text-cream/70">Precio unitario:</span>
            <span className="text-3xl font-serif font-bold text-accent">{formatCOP(unitPrice)}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={() => onAdd(sel, unitPrice)}>
              Añadir a la venta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
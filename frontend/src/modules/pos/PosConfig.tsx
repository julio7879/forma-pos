import { useState } from 'react';
import { Product, OrderOptionSnapshot } from '../../types';
import { formatCOP } from '../../utils/formatters'; 
import { Button } from '../../components/ui/Button';

interface PosConfigProps {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, quantity: number, finalPrice: number, snapshots: OrderOptionSnapshot[]) => void;
}

export function PosConfig({ product, onClose, onAdd }: PosConfigProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [customText, setCustomText] = useState('');
  
  const TEXT_FEE = 8000;

  const handleSelect = (optionId: string, value: string) => {
    setSelections(prev => ({ ...prev, [optionId]: value }));
  };

  let totalExtras = 0;
  const snapshots: OrderOptionSnapshot[] = [];

  product.options?.forEach(opt => {
    const selectedValue = selections[opt.id];
    if (selectedValue) {
      const valueObj = opt.valores_recargos.find(v => v.valor === selectedValue);
      if (valueObj && valueObj.recargo > 0) totalExtras += valueObj.recargo;
      
      snapshots.push({
        option_id: opt.id,
        nombre: opt.nombre,
        valor: selectedValue,
        recargo: valueObj?.recargo || 0
      });
    }
  });

  const textExtra = customText.trim().length > 0 ? TEXT_FEE : 0;
  if (textExtra > 0) {
    snapshots.push({ nombre: 'Texto personalizado', valor: customText, recargo: TEXT_FEE });
  }

  const unitPrice = product.precio_base + totalExtras + textExtra;

  const handleAdd = () => {
    const missingRequired = product.options?.find(opt => opt.obligatorio && !selections[opt.id]);
    if (missingRequired) {
      alert(`Por favor selecciona una opción para: ${missingRequired.nombre}`);
      return;
    }
    onAdd(product, 1, unitPrice, snapshots);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-accent/30 bg-surface p-6 shadow-2xl text-cream max-h-[90vh] flex flex-col">
        
        <div className="flex items-start justify-between border-b border-cream/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-medium">Personalizar pieza</p>
            <h2 className="text-2xl font-serif font-bold text-cream mt-1">{product.nombre}</h2>
          </div>
          <button onClick={onClose} className="text-cream/60 hover:text-cream">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
          {product.options?.map(opt => (
            <fieldset key={opt.id}>
              <legend className="text-xs font-semibold uppercase tracking-wider text-cream/70 mb-2">
                {opt.nombre} {opt.obligatorio && <span className="text-danger">*</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {opt.valores_recargos.map(v => (
                  <button
                    key={v.valor}
                    onClick={() => handleSelect(opt.id, v.valor)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${
                      selections[opt.id] === v.valor ? 'border-accent bg-accent/15 ring-1 ring-accent' : 'border-cream/15 bg-ink/30'
                    }`}
                  >
                    {v.valor}
                    {v.recargo > 0 && <span className="text-xs text-accent">+{formatCOP(v.recargo)}</span>}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream/70 mb-2">
              Texto personalizado (Opcional)
            </label>
            <input
              type="text"
              maxLength={30}
              placeholder="Ej. Juan Pérez · 2026"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full rounded-xl border border-cream/20 bg-ink/50 px-4 py-2.5 text-sm text-cream focus:border-accent focus:outline-none"
            />
            <div className="mt-1 text-xs text-cream/50">Añadir texto personalizado: +{formatCOP(TEXT_FEE)}</div>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-4 mt-2">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-sm text-cream/70">Precio unitario:</span>
            <span className="text-3xl font-serif font-bold text-accent">{formatCOP(unitPrice)}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={handleAdd}>
              Añadir a la venta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
// frontend/src/modules/store/ProductConfigurator.tsx
import { useState } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Product, ProductOption } from '../../types';

interface ProductConfiguratorProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (config: any) => void;
}

export const ProductConfigurator = ({ product, onBack, onAddToCart }: ProductConfiguratorProps) => {
  // Guardamos las selecciones del usuario por ID de opción
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [customText, setCustomText] = useState('');

  const TEXT_FEE = 8000; // Recargo fijo por texto personalizado (RF-02)

  // Función para actualizar la selección de una opción
  const handleSelect = (optionId: string, value: string) => {
    setSelections(prev => ({ ...prev, [optionId]: value }));
  };

  // Cálculo de extras
  let totalExtras = 0;
  const optionDetails: { nombre: string; valor: string; recargo: number }[] = [];

  product.options?.forEach((opt: ProductOption) => {
    const selectedValue = selections[opt.id];
    if (selectedValue) {
      const valueObj = opt.valores_recargos.find(v => v.valor === selectedValue);
      if (valueObj && valueObj.recargo > 0) {
        totalExtras += valueObj.recargo;
      }
      optionDetails.push({
        nombre: opt.nombre,
        valor: selectedValue,
        recargo: valueObj?.recargo || 0,
      });
    }
  });

  const textExtra = customText.trim().length > 0 ? TEXT_FEE : 0;
  const totalUnitario = product.precio_base + totalExtras + textExtra;

  const handleAdd = () => {
    // Validar que las opciones obligatorias estén seleccionadas
    const missingRequired = product.options?.find(opt => opt.obligatorio && !selections[opt.id]);
    if (missingRequired) {
      alert(`Por favor selecciona una opción para: ${missingRequired.nombre}`);
      return;
    }

    onAddToCart({
      product,
      selections: optionDetails,
      customText,
      unitPrice: totalUnitario,
      quantity: 1
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Botón Volver */}
      <button onClick={onBack} className="flex items-center gap-2 text-xs uppercase tracking-widest text-cream/60 hover:text-accent mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver al catálogo
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        {/* Columna Izquierda: Imagen */}
        <div className="overflow-hidden rounded-2xl border border-surface bg-surface/30 lg:sticky lg:top-24 lg:self-start">
          <img
            src={product.imagen_url || ''}
            alt={product.nombre}
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* Columna Derecha: Detalles y Configurador */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded border border-accent/40 bg-surface/80 px-2.5 py-0.5 text-xs text-accent">
              {product.categoria}
            </span>
            {product.stock_actual < 8 && (
              <span className="rounded border border-danger/60 bg-danger/20 px-2.5 py-0.5 text-xs text-cream">
                Últimas {product.stock_actual} unidades
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl font-medium text-cream sm:text-5xl">
            {product.nombre}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-cream/70 sm:text-base">
            {product.descripcion}
          </p>

          {/* Caja del Configurador */}
          <div className="mt-8 rounded-2xl border border-accent/30 bg-surface/40 p-5 sm:p-7 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Configura tu pieza
            </p>

            <div className="mt-6 space-y-6">
              
              {/* Renderizado dinámico de las opciones (Color, Talla, etc.) */}
              {product.options?.map(opt => (
                <fieldset key={opt.id}>
                  <legend className="mb-2.5 text-xs uppercase tracking-wider text-cream/60">
                    {opt.nombre} {opt.obligatorio && <span className="text-danger">*</span>}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {opt.valores_recargos.map(v => (
                      <button
                        key={v.valor}
                        type="button"
                        onClick={() => handleSelect(opt.id, v.valor)}
                        className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-all ${
                          selections[opt.id] === v.valor
                            ? "border-accent bg-accent/15 text-cream ring-1 ring-accent"
                            : "border-surface bg-ink/40 text-cream/70 hover:border-accent/60"
                        }`}
                      >
                        {/* Si es tipo COLOR, mostramos un círculo */}
                        {opt.tipo === 'COLOR' && (
                          <span className={`size-4 rounded-full border border-cream/30 ${
                            v.valor.toLowerCase() === 'negro' ? 'bg-black' : 
                            v.valor.toLowerCase() === 'blanco' ? 'bg-white' : 
                            v.valor.toLowerCase() === 'terracota' ? 'bg-[#c4553b]' :
                            v.valor.toLowerCase() === 'azul' ? 'bg-blue-800' :
                            'bg-surface'
                          }`} />
                        )}
                        <span>{v.valor}</span>
                        {v.recargo > 0 && <span className="text-xs text-accent">+${v.recargo.toLocaleString('es-CO')}</span>}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}

              {/* Campo de Texto Personalizado */}
              <div>
                <label htmlFor="custom-text" className="block text-xs uppercase tracking-wider text-cream/60">
                  Texto Personalizado (Grabado o Estampado)
                </label>
                <input
                  id="custom-text"
                  type="text"
                  maxLength={30}
                  placeholder="Ej. Para Ana, con cariño"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-surface bg-ink/70 px-3.5 text-sm text-cream placeholder:text-cream/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <p className="mt-1.5 text-xs text-cream/50">
                  Máx. 30 caracteres · <span className="text-accent">+${TEXT_FEE.toLocaleString('es-CO')}</span> por personalización
                </p>
              </div>

              {/* Desglose de Precio en Tiempo Real */}
              <div className="space-y-2 border-t border-accent/20 pt-4 text-xs text-cream/70">
                <div className="flex justify-between">
                  <span>Precio base:</span>
                  <span>${product.precio_base.toLocaleString('es-CO')}</span>
                </div>
                {optionDetails.filter(o => o.recargo > 0).map((o, i) => (
                  <div key={i} className="flex justify-between text-accent">
                    <span>Adicional {o.nombre} ({o.valor}):</span>
                    <span>+${o.recargo.toLocaleString('es-CO')}</span>
                  </div>
                ))}
                {textExtra > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Personalización texto:</span>
                    <span>+${TEXT_FEE.toLocaleString('es-CO')}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t border-surface/80 pt-3 text-base text-cream">
                  <span className="font-medium">Total unitario:</span>
                  <span className="font-serif text-3xl font-bold text-accent">
                    ${totalUnitario.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {/* Botón de Acción Principal */}
              <button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold tracking-wide text-ink transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(209,150,80,0.35)] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Añadir a mi pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
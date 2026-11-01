import { X, Trash2, ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface CartItem {
  id: string; // ID único de la línea (producto + opciones)
  productId: string;
  nombre: string;
  imagen_url: string;
  unitPrice: number;
  quantity: number;
  details: string; // Ej: "Talla: M · Color: Negro · Texto: 'Ana'"
}

interface StoreCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const StoreCart = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }: StoreCartProps) => {
  const total = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Fondo oscuro */}
      <div 
        className={`absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />

      {/* Panel Deslizante */}
      <aside 
        className={`
          absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col border-l border-accent/20 bg-surface shadow-2xl
          transition-transform ease-in-out
          ${isOpen ? 'translate-x-0 duration-500' : 'translate-x-full duration-300'}
        `}
      >
        <div className="flex items-center justify-between border-b border-ink/20 p-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold">Tu selección</p>
            <h2 className="mt-1 text-2xl font-serif text-cream">Mi Pedido</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-cream/70 hover:bg-ink/30 hover:text-cream transition-colors">
            <X size={20} />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-cream/50">
              <p>Tu carrito está vacío.</p>
              <button onClick={onClose} className="mt-4 text-sm text-accent hover:underline">Volver al catálogo</button>
            </div>
          ) : (
            items.map((item) => (
              <li key={item.id} className="flex gap-4 rounded-xl border border-surface/50 bg-ink/40 p-3">
                <img src={item.imagen_url} alt={item.nombre} className="size-20 shrink-0 rounded-lg object-cover" />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium text-cream line-clamp-1">{item.nombre}</p>
                      <button onClick={() => onRemove(item.id)} className="text-cream/40 hover:text-danger transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-cream/60 line-clamp-2">{item.details}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 rounded-lg bg-ink/50 p-1 border border-surface/50">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 text-cream/70 hover:text-cream disabled:opacity-30" disabled={item.quantity <= 1}>
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 text-cream/70 hover:text-cream">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-semibold text-accent">${(item.unitPrice * item.quantity).toLocaleString('es-CO')}</p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        {items.length > 0 && (
          <div className="border-t border-ink/20 p-5 bg-surface/80">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-cream/70">Total estimado</span>
              <span className="text-3xl font-serif text-accent">${total.toLocaleString('es-CO')}</span>
            </div>
            <Button onClick={onCheckout} className="w-full h-12 flex items-center gap-2 justify-center">
              Proceder al pago <ArrowRight size={18} />
            </Button>
            <p className="mt-3 text-center text-xs text-cream/40">El cálculo final se validará en el servidor.</p>
          </div>
        )}
      </aside>
    </div>
  );
};
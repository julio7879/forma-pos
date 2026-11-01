import { Product, OrderOptionSnapshot } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Trash2 } from 'lucide-react';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  opciones_snapshot: OrderOptionSnapshot[];
  finalUnitPrice: number;
}

interface PosCartProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onAnticipo: () => void;
}

export const PosCart = ({ items, onRemove, onCheckout, onAnticipo }: PosCartProps) => {
  const total = items.reduce((acc, item) => acc + item.finalUnitPrice * item.quantity, 0);

  return (
    <div className="flex h-full flex-col bg-surface text-cream">
      <div className="border-b border-ink/20 p-5">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Venta actual</p>
        <h2 className="mt-1 text-2xl font-serif text-cream">Pedido FRM-2043</h2>
      </div>

      <ul className="flex-1 overflow-y-auto p-5 space-y-3">
        {items.length === 0 ? (
          <li className="py-10 text-center text-cream/50">
            Selecciona un producto para empezar.
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="rounded-lg bg-ink/40 p-3 border border-surface/50">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{item.product.nombre}</p>
                  <p className="text-xs text-cream/60">Cant: {item.quantity}</p>
                  <p className="text-[11px] text-cream/50 mt-1 line-clamp-2">
                    {item.opciones_snapshot.map(s => s.valor).join(' · ')}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-cream/50 hover:text-danger transition-colors h-fit"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-cream/80">{formatCOP(item.finalUnitPrice)} c/u</span>
                <span className="font-medium text-accent">{formatCOP(item.finalUnitPrice * item.quantity)}</span>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="border-t border-ink/20 p-5 space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-cream/70">Total</span>
          <span className="text-4xl font-serif text-accent">{formatCOP(total)}</span>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full border-accent text-accent hover:bg-accent/10" 
            disabled={items.length === 0}
            onClick={onAnticipo}
          >
            Registrar anticipo 50% <Badge variant="neutral" className="ml-2">demo</Badge>
          </Button>
          <Button 
            variant="primary" 
            className="w-full"
            disabled={items.length === 0}
            onClick={onCheckout}
          >
            Cobrar total <Badge variant="neutral" className="ml-2 text-ink border-ink/30">simulado</Badge>
          </Button>
        </div>
      </div>
    </div>
  );
};
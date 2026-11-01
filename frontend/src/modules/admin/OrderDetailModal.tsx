import { Order, OrderStatus } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Check } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (orderId: string, newStatus: OrderStatus) => void;
}

const FLOW_STEPS: { state: OrderStatus; label: string; desc: string }[] = [
  { state: 'RECIBIDO', label: 'Recibido', desc: 'Pedido registrado y en cola' },
  { state: 'EN_PREPARACION', label: 'En preparación', desc: 'En taller de grabado / estampado' },
  { state: 'LISTO', label: 'Listo', desc: 'Control de calidad y empaque final' },
  { state: 'ENTREGADO', label: 'Entregado', desc: 'Entregado al cliente final' },
];

export const OrderDetailModal = ({ order, isOpen, onClose, onUpdateState }: OrderDetailModalProps) => {
  if (!isOpen || !order) return null;

  const currentIdx = FLOW_STEPS.findIndex((s) => s.state === order.estado_pedido);
  const nextStep = currentIdx >= 0 && currentIdx < FLOW_STEPS.length - 1 ? FLOW_STEPS[currentIdx + 1] : null;

  const getPaymentBadge = (status: string) => {
    if (status === 'PAGADO') return <Badge variant="success">Pagado</Badge>;
    if (status === 'ANTICIPO_PARCIAL') return <Badge variant="warning">Anticipo</Badge>;
    return <Badge variant="danger">Pendiente</Badge>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-accent/25 bg-surface shadow-2xl z-10 flex flex-col max-h-[92vh]">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-accent/15 bg-ink/40 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-accent">{order.referencia}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface/60 text-cream/80">
                {order.origen}
              </span>
            </div>
            <p className="text-xs text-cream/50 mt-0.5">
              Fecha: {new Date(order.created_at).toLocaleDateString('es-CO')}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-cream/50 hover:bg-ink/40 hover:text-cream transition-colors">
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-ink/30 border border-accent/10">
            <div>
              <p className="text-xs uppercase tracking-wider text-cream/40">Cliente</p>
              <p className="text-base font-semibold text-cream mt-0.5">{order.cliente_nombre}</p>
              <p className="text-xs text-cream/60">{order.cliente_contacto}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-wider text-cream/40 mb-1.5">Estado actual</p>
              <div className="flex gap-2 sm:justify-end">
                <Badge variant="info">{order.estado_pedido}</Badge>
                {getPaymentBadge(order.estado_pago)}
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cream/50 mb-3">
              Línea de producción
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {FLOW_STEPS.map((step, idx) => {
                const isPassed = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                
                return (
                  <button
                    key={step.state}
                    onClick={() => onUpdateState(order.id, step.state)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? "border-accent bg-accent/15 shadow-sm"
                        : isPassed
                        ? "border-success/40 bg-success/10 text-cream/80"
                        : "border-accent/10 bg-ink/20 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-cream/40">0{idx + 1}</span>
                      {isPassed && <Check size={14} className="text-success" />}
                      {isCurrent && <span className="size-2 rounded-full bg-accent animate-pulse" />}
                    </div>
                    <p className={`text-xs font-medium ${isCurrent ? "text-accent font-semibold" : "text-cream"}`}>
                      {step.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cream/50 mb-3">
              Artículos del pedido
            </h4>
            <div className="divide-y divide-accent/10 rounded-2xl border border-accent/10 bg-ink/20 overflow-hidden">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5">
                  <div>
                    <p className="text-sm font-medium text-cream">
                      {item.nombre_snapshot} <span className="text-xs text-cream/50 font-mono">×{item.cantidad}</span>
                    </p>
                    {item.opciones_snapshot.length > 0 && (
                      <p className="text-xs text-accent/80 mt-0.5 line-clamp-1">
                        {item.opciones_snapshot.map(o => o.valor).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-sm text-cream/90">{formatCOP(item.subtotal_item)}</span>
                </div>
              ))}
              
              <div className="flex items-center justify-between p-4 bg-ink/40">
                <span className="text-sm font-medium text-cream/70">Total del pedido</span>
                <span className="font-mono text-lg font-bold text-accent">{formatCOP(order.total_final)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-accent/15 bg-ink/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-cream/60 text-center sm:text-left">
            {nextStep ? (
              <span>Siguiente paso: <strong className="text-cream">{nextStep.label}</strong></span>
            ) : (
              <span className="text-success font-medium">✓ Pedido completado</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cerrar
            </Button>
            {nextStep && (
              <Button 
                variant="primary" 
                onClick={() => onUpdateState(order.id, nextStep.state)}
                className="w-full sm:w-auto gap-2"
              >
                Avanzar a {nextStep.label} →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
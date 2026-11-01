// frontend/src/modules/store/OrderTracking.tsx
import { useState } from 'react';
import { Search, PackageCheck, Clock, Sparkles, Truck, Check } from 'lucide-react';
import { orderService } from '../../services/apiClient';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// 4 pasos exactos requeridos
const TRACKING_STEPS = [
  { id: 'RECIBIDO', label: 'Recibido', desc: 'El taller registró tu encargo', icon: Clock },
  { id: 'EN_PREPARACION', label: 'En Preparación', desc: 'Artesanos trabajando en tu pieza', icon: Sparkles },
  { id: 'LISTO', label: 'Listo para entrega', desc: 'Control de calidad superado', icon: PackageCheck },
  { id: 'ENTREGADO', label: 'Entregado', desc: 'En manos de su dueño', icon: Truck },
] as const;

export const OrderTracking = () => {
  const [refInput, setRefInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // Usamos el servicio que ya tiene el fallback offline a MOCK_ORDERS
      const result = await orderService.trackOrder(refInput.trim());
      setOrder(result);
    } catch (err: any) {
      setError(err.message || 'No encontramos esa referencia.');
    } finally {
      setLoading(false);
    }
  };

  // Calculamos el índice del paso actual
  const currentStepIndex = order ? TRACKING_STEPS.findIndex(s => s.id === order.estado_pedido) : -1;

  // Mapeo de variantes de Badge para el estado de pago
  const getPaymentBadge = (status: string) => {
    if (status === 'PAGADO') return <Badge variant="success">Pago: Completado</Badge>;
    if (status === 'ANTICIPO_PARCIAL') return <Badge variant="warning">Pago: Anticipo registrado</Badge>;
    return <Badge variant="danger">Pago: Pendiente</Badge>;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Seguimiento en Taller</p>
      <h1 className="mt-2 font-serif text-3xl font-medium sm:text-5xl text-cream">¿Dónde está tu pieza?</h1>
      <p className="mt-3 text-sm text-cream/70 sm:text-base">
        Ingresa la referencia única de tu comprobante (ej. FORMA-1002) para consultar el avance.
      </p>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="ref-input" className="block text-xs uppercase tracking-wider text-cream/60 mb-2">
            Referencia del pedido
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-accent/60" />
            <input
              id="ref-input"
              type="text"
              placeholder="FORMA-XXXX"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              className="h-12 w-full rounded-xl border border-surface bg-surface/30 pl-11 pr-4 font-mono text-base text-cream placeholder:text-cream/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent uppercase"
            />
          </div>
        </div>
        <Button type="submit" size="lg" isLoading={loading} className="h-12 sm:w-auto w-full">
          Consultar
        </Button>
      </form>

      {/* Mensaje de Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-cream text-center">
          {error}
        </div>
      )}

      {/* Tarjeta de Progreso */}
      {order && (
        <div className="mt-10 rounded-2xl border border-accent/25 bg-surface/30 p-6 sm:p-9 shadow-2xl backdrop-blur-sm">
          
          {/* Header del Pedido */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-accent/15 pb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-cream/60">Pedido</p>
              <p className="font-mono text-2xl font-bold text-accent sm:text-3xl">
                {order.referencia}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="info">
                {TRACKING_STEPS.find(s => s.id === order.estado_pedido)?.label || order.estado_pedido}
              </Badge>
              {getPaymentBadge(order.estado_pago)}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 text-sm text-cream/60">
            <p>Cliente: <span className="text-cream/90">{order.cliente_nombre}</span></p>
            <p>Resumen: <span className="text-cream/90">{order.items.map(i => i.nombre_snapshot).join(', ')}</span></p>
            <p>Total: <span className="text-accent font-semibold">${order.total_final.toLocaleString('es-CO')}</span></p>
          </div>

          {/* Stepper Vertical de 4 Pasos */}
          <div className="mt-8">
            <ol className="space-y-0">
              {TRACKING_STEPS.map((step, i) => {
                const isCompleted = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const Icon = step.icon;

                return (
                  <li key={step.id} className="relative flex gap-4">
                    {/* Nodos y Líneas */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid size-10 place-items-center rounded-full border transition-all duration-300 ${
                          isCompleted || isCurrent
                            ? "border-accent bg-accent text-ink shadow-[0_0_12px_rgba(209,150,80,0.35)]"
                            : "border-surface bg-ink/70 text-cream/30"
                        } ${isCurrent ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
                      >
                        {isCompleted ? (
                          <Check className="size-5 stroke-[3]" />
                        ) : (
                          <Icon className={`size-5 ${isCurrent ? "animate-pulse" : ""}`} />
                        )}
                      </span>

                      {/* Línea conectora */}
                      {i < TRACKING_STEPS.length - 1 && (
                        <span
                          className={`h-14 w-0.5 transition-colors duration-300 ${
                            i < currentStepIndex ? "bg-accent" : "bg-surface/50"
                          }`}
                        />
                      )}
                    </div>

                    {/* Texto */}
                    <div className="pb-8 pt-2">
                      <p
                        className={`text-sm font-semibold tracking-wide ${
                          isCurrent ? "text-accent" : isCompleted ? "text-cream" : "text-cream/40"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-xs text-cream/50">{step.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
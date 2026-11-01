import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CartItem } from './StoreCart';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface StoreCheckoutProps {
  items: CartItem[];
  onBack: () => void;
  onConfirm: (data: any) => void;
}

export const StoreCheckout = ({ items, onBack, onConfirm }: StoreCheckoutProps) => {
  const [form, setForm] = useState({ nombre: '', contacto: '', fecha: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const anticipoSugerido = Math.round(subtotal / 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.contacto) return;

    setLoading(true);
    
    // Simulamos el envío al backend
    setTimeout(() => {
      onConfirm({
        cliente_nombre: form.nombre,
        cliente_contacto: form.contacto,
        fecha_deseada: form.fecha,
        items,
        total: subtotal
      });
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <CheckCircle2 className="size-16 text-success mb-4" />
        <h2 className="text-3xl font-serif text-cream mb-2">¡Pedido Confirmado!</h2>
        <p className="text-cream/70 max-w-md mb-8">
          Hemos recibido tu solicitud. Revisa tu correo o el seguimiento para ver el avance de tu pieza.
        </p>
        <Button onClick={onBack} variant="outline" className="h-12 px-8">
          Volver al catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-xs uppercase tracking-widest text-cream/60 hover:text-accent mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver al carrito
      </button>

      <h1 className="font-serif text-3xl sm:text-4xl text-cream mb-8">Finalizar Pedido</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-accent/20 bg-surface/30 p-6 sm:p-8">
            <h2 className="text-xl font-serif text-cream mb-4">Datos de Contacto</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input 
                label="Nombre completo" 
                placeholder="Ej. Ana María" 
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                required
              />
              <Input 
                label="Teléfono / Email" 
                placeholder="Ej. 3001234567" 
                value={form.contacto}
                onChange={e => setForm({...form, contacto: e.target.value})}
                required
              />
              <div className="sm:col-span-2">
                <Input 
                  label="Fecha deseada de entrega" 
                  type="date"
                  value={form.fecha}
                  onChange={e => setForm({...form, fecha: e.target.value})}
                  helperText="Mínimo 3 días hábiles de taller."
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-accent/20 bg-surface/30 p-6 sm:p-8">
            <h2 className="text-xl font-serif text-cream mb-4">Resumen de piezas</h2>
            <ul className="divide-y divide-surface/50">
              {items.map(item => (
                <li key={item.id} className="py-4 flex gap-4">
                  <img src={item.imagen_url} alt="" className="size-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-cream text-sm">{item.nombre} <span className="text-cream/50">x{item.quantity}</span></p>
                    <p className="text-xs text-cream/60 mt-1">{item.details}</p>
                  </div>
                  <p className="text-accent font-semibold">${(item.unitPrice * item.quantity).toLocaleString('es-CO')}</p>
                </li>
              ))}
            </ul>
          </div>
        </form>

        {/* Resumen de Pago (Sticky) */}
        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-accent/30 bg-surface p-6 shadow-xl">
          <h2 className="text-2xl font-serif text-cream mb-6">Total</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-cream/70">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-cream/70">
              <span>Anticipo sugerido (50%)</span>
              <span>${anticipoSugerido.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-surface/50 pt-3 mt-3">
              <span className="font-medium text-cream">Total</span>
              <span className="text-3xl font-serif text-accent">${subtotal.toLocaleString('es-CO')}</span>
            </div>
          </div>
          <Button 
            onClick={handleSubmit} 
            isLoading={loading}
            className="w-full h-12 mt-6"
          >
            Confirmar pedido
          </Button>
          <p className="mt-3 text-center text-xs text-cream/50">
            Prototipo: no se realiza ningún cobro.
          </p>
        </aside>
      </div>
    </div>
  );
};
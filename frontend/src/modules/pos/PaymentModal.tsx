import { useState } from 'react';
import { PaymentMethod } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';

interface PaymentModalProps {
  total: number;
  initialType?: 'anticipo' | 'total';
  onClose: () => void;
  onSuccess: (data: { type: 'anticipo' | 'total'; amountToCharge: number; method: PaymentMethod; change: number }) => void;
}

export function PaymentModal({ total, initialType = 'anticipo', onClose, onSuccess }: PaymentModalProps) {
  const [payType, setPayType] = useState<'anticipo' | 'total'>(initialType);
  const [method, setMethod] = useState<PaymentMethod>('EFECTIVO');
  const [cashGiven, setCashGiven] = useState<string>('');

  const amountToCharge = payType === 'anticipo' ? Math.round(total / 2) : total;
  const pendingBalance = total - amountToCharge;
  const cashNumber = parseFloat(cashGiven) || 0;
  const change = cashNumber > amountToCharge ? cashNumber - amountToCharge : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-accent/30 bg-surface p-6 shadow-2xl text-cream">
        
        <div className="flex items-center justify-between border-b border-cream/10 pb-4">
          <h2 className="text-2xl font-serif font-bold">Registrar Cobro</h2>
          <button onClick={onClose} className="text-cream/60 hover:text-cream">✕</button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-cream/15 bg-ink/40 p-1.5">
          <button onClick={() => setPayType('anticipo')} className={`rounded-lg py-2 text-sm ${payType === 'anticipo' ? 'bg-accent text-ink' : 'text-cream/70'}`}>Anticipo 50%</button>
          <button onClick={() => setPayType('total')} className={`rounded-lg py-2 text-sm ${payType === 'total' ? 'bg-accent text-ink' : 'text-cream/70'}`}>Pago Total</button>
        </div>

        <div className="mt-4 rounded-xl border border-accent/25 bg-ink/50 p-4 space-y-2">
          <div className="flex justify-between text-sm text-cream/70">
            <span>Total venta:</span> <span>{formatCOP(total)}</span>
          </div>
          <div className="flex justify-between items-baseline border-y border-cream/10 py-2">
            <span className="font-semibold">Cobrar ahora:</span>
            <span className="text-2xl font-serif text-accent">{formatCOP(amountToCharge)}</span>
          </div>
          {payType === 'anticipo' && (
            <div className="flex justify-between text-xs text-accent/80 pt-1">
              <span>Saldo pendiente:</span> <span>{formatCOP(pendingBalance)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button variant={method === 'EFECTIVO' ? 'primary' : 'outline'} onClick={() => setMethod('EFECTIVO')} className="text-xs">💵 Efectivo</Button>
          <Button variant={method === 'TRANSFERENCIA' ? 'primary' : 'outline'} onClick={() => setMethod('TRANSFERENCIA')} className="text-xs">💳 Transf.</Button>
          <Button variant={method === 'DEMO' ? 'primary' : 'outline'} onClick={() => setMethod('DEMO')} className="text-xs">📱 Demo</Button>
        </div>

        {method === 'EFECTIVO' && (
          <div className="mt-4 flex items-center justify-between gap-3 bg-ink/30 p-3 rounded-xl border border-cream/10">
            <span className="text-xs">Efectivo recibido:</span>
            <input type="number" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} className="w-24 rounded-lg bg-ink border border-cream/20 px-2 py-1 text-right text-sm" />
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Volver</Button>
          <Button variant="primary" className="flex-1" disabled={method === 'EFECTIVO' && cashNumber > 0 && cashNumber < amountToCharge} onClick={() => onSuccess({ type: payType, amountToCharge, method, change })}>
            Confirmar Cobro
          </Button>
        </div>
      </div>
    </div>
  );
}
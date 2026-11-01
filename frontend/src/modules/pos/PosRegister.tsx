import { useState } from 'react';
import { Search, ChevronLeft, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { MOCK_PRODUCTS, Product, CartItem, formatCOP, Selection } from './types';
import { PosCart } from './PosCart';
import { PosConfig } from './PosConfig';
import { PaymentModal } from './PaymentModal';

export const PosRegister = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  const [productToConfig, setProductToConfig] = useState<Product | null>(null);
  const [paymentType, setPaymentType] = useState<'anticipo' | 'total' | null>(null);

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (sel: Selection, finalPrice: number) => {
    if (!productToConfig) return;
    
    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => 
        item.id === productToConfig.id && 
        item.selection.color === sel.color && 
        item.selection.size === sel.size && 
        item.selection.text === sel.text
      );

      if (existingItemIndex >= 0) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      }

      return [...prev, { 
        ...productToConfig, 
        quantity: 1, 
        selection: sel, 
        finalUnitPrice: finalPrice 
      }];
    });
    setProductToConfig(null);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const cartTotal = cart.reduce((acc, item) => acc + item.finalUnitPrice * item.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen bg-ink text-cream font-sans overflow-hidden">
      <section className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        
        {/* Buscador estilo Cristal */}
        <div className="relative mb-6 w-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-accent/60 peer-focus:text-accent z-10 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto o categoría..."
            className="peer w-full pl-12 pr-4 h-12 sm:h-14 rounded-xl text-base sm:text-lg text-cream placeholder:text-cream/40 bg-ink/60 backdrop-blur-md border border-accent/30 shadow-sm transition-all duration-200 hover:border-accent/50 hover:bg-ink/80 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:shadow-[0_0_15px_rgba(209,150,80,0.2)] focus:bg-ink/90"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-y-auto pb-20 md:pb-0">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => setProductToConfig(product)}
              className="group flex flex-col sm:flex-row items-center gap-3 p-2 md:p-3 bg-surface rounded-xl border border-accent/25 hover:border-accent/60 hover:-translate-y-1 hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] transition-all duration-200 text-left"
            >
              <img src={product.imageUrl} alt={product.name} className="w-full sm:w-20 aspect-square rounded-lg object-cover transition-transform duration-200 group-hover:scale-105" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-accent font-semibold">{formatCOP(product.basePrice)}</p>
                <Badge variant={product.stock < 8 ? 'warning' : 'neutral'} className="mt-1">Stock {product.stock}</Badge>
              </div>
            </button>
          ))}
        </div>
      </section>

      <aside className="hidden lg:flex w-[380px] border-l border-accent/20">
        <PosCart items={cart} onRemove={removeFromCart} onCheckout={() => setPaymentType('total')} onAnticipo={() => setPaymentType('anticipo')} />
      </aside>

      <button onClick={() => setIsMobileCartOpen(true)} className="lg:hidden fixed right-0 top-1/2 -translate-y-1/2 bg-surface border border-r-0 border-accent/40 rounded-l-xl px-2 py-4 text-accent shadow-lg flex flex-col items-center gap-1 z-40 hover:bg-surface/90 active:scale-95 transition-all">
        <ChevronLeft size={24} />
        {cart.length > 0 && <span className="bg-accent text-ink text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
      </button>

      <div className={`lg:hidden fixed inset-0 z-50 ${isMobileCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity duration-300 ${isMobileCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileCartOpen(false)} />
        <aside className={`absolute inset-y-0 right-0 w-[90vw] max-w-sm h-full shadow-2xl bg-surface transition-transform ease-in-out flex flex-col ${isMobileCartOpen ? 'translate-x-0 duration-500' : 'translate-x-full duration-300'}`}>
          <button onClick={() => setIsMobileCartOpen(false)} className="absolute top-4 right-4 z-10 text-cream/70 hover:text-cream bg-ink/30 rounded-full p-1 transition-colors"><X size={20} /></button>
          <PosCart items={cart} onRemove={removeFromCart} onCheckout={() => setPaymentType('total')} onAnticipo={() => setPaymentType('anticipo')} />
        </aside>
      </div>

      {productToConfig && (
        <PosConfig product={productToConfig} onClose={() => setProductToConfig(null)} onAdd={handleAddToCart} />
      )}

      {paymentType && (
        <PaymentModal 
          total={cartTotal} 
          initialType={paymentType} 
          onClose={() => setPaymentType(null)} 
          onSuccess={(data) => {
            // AQUÍ SE CUMPLE EL RF-03 Y RF-05
            const orderPayload = {
              origen: 'POS', // Regla inquebrantable 3
              estado_pedido: 'RECIBIDO', // Regla inquebrantable 4
              estado_pago: data.type === 'total' ? 'PAGADO' : 'ANTICIPO_PARCIAL',
              total_final: cartTotal,
              total_pagado: data.amountToCharge,
              metodo_pago: data.method,
              items: cart
            };
            
            console.log("Payload listo para enviar al backend:", orderPayload);
            alert(`Venta registrada (${data.type}) por ${formatCOP(data.amountToCharge)} vía ${data.method}.\nOrigen: POS`);
            
            setCart([]);
            setPaymentType(null);
            setIsMobileCartOpen(false);
          }} 
        />
      )}
    </div>
  );
};
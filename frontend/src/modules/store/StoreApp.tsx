import { useState } from 'react';
import { StoreLayout } from './StoreLayout';
import { StoreCatalog } from './StoreCatalog';
import { ProductConfigurator } from './ProductConfigurator';
import { OrderTracking } from './OrderTracking';
import { StoreCart, CartItem } from './StoreCart';
import { StoreCheckout } from './StoreCheckout';
import { Product, CreateOrderInput } from '../../types';
import { orderService } from '../../services/apiClient';

export function StoreApp() {
  // Estados de navegación interna de la tienda
  const [storeView, setStoreView] = useState<'catalog' | 'product' | 'tracking' | 'checkout'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Lógica del Carrito
  const handleAddToCart = (item: any) => {
    const signature = `${item.product.id}-${JSON.stringify(item.selections)}-${item.customText}`;
    
    const detailsString = [
      ...item.selections.map((s: any) => `${s.nombre}: ${s.valor}`),
      item.customText ? `Texto: "${item.customText}"` : null
    ].filter(Boolean).join(' · ');

    setCartItems(prev => {
      const existing = prev.find(i => i.id === signature);
      if (existing) {
        return prev.map(i => i.id === signature ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: signature,
        productId: item.product.id,
        nombre: item.product.nombre,
        imagen_url: item.product.imagen_url || '',
        unitPrice: item.unitPrice,
        quantity: 1,
        details: detailsString
      }];
    });
    
    setStoreView('catalog');
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // --- CONEXIÓN OFICIAL CON EL BACKEND (RF-02) ---
  const handleConfirmOrder = async (data: { nombre: string; contacto: string; fecha: string }) => {
    const payload: CreateOrderInput = {
      origen: 'WEB',
      cliente_nombre: data.nombre,
      cliente_contacto: data.contacto,
      fecha_deseada: data.fecha || undefined,
      items: cartItems.map(item => ({
        product_id: item.productId,
        cantidad: item.quantity,
        opciones: [{ valor: item.details }]
      }))
    };

    await orderService.createOrder(payload);
    setCartItems([]);
  };

  return (
    <StoreLayout 
      currentView={storeView as any} 
      onNavigate={(v) => setStoreView(v as any)}
      cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
      onOpenCart={() => setIsCartOpen(true)}
    >
      {storeView === 'catalog' && (
        <StoreCatalog onSelectProduct={(p) => { setSelectedProduct(p); setStoreView('product'); }} />
      )}

      {storeView === 'product' && selectedProduct && (
        <ProductConfigurator 
          product={selectedProduct} 
          onBack={() => setStoreView('catalog')} 
          onAddToCart={handleAddToCart}
        />
      )}

      {storeView === 'tracking' && <OrderTracking />}

      {storeView === 'checkout' && (
        <StoreCheckout 
          items={cartItems} 
          onBack={() => setStoreView('catalog')} 
          onConfirm={handleConfirmOrder} 
        />
      )}

      <StoreCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onCheckout={() => { setIsCartOpen(false); setStoreView('checkout'); }}
      />
    </StoreLayout>
  );
}

export default StoreApp;

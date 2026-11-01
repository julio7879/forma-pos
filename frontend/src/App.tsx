import { useState } from 'react';
import { StoreLayout } from './modules/store/StoreLayout';
import { StoreCatalog } from './modules/store/StoreCatalog';
import { ProductConfigurator } from './modules/store/ProductConfigurator';
import { OrderTracking } from './modules/store/OrderTracking';
import { StoreCart, CartItem } from './modules/store/StoreCart';
import { StoreCheckout } from './modules/store/StoreCheckout';
import { Product, CreateOrderInput } from './types';
import { orderService } from './services/apiClient'; // <-- Importamos el servicio oficial

export function App() {
  // Estados de navegación
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

  // --- CONEXIÓN OFICIAL CON EL BACKEND (Feedback de Julio) ---
  const handleConfirmOrder = async (data: { nombre: string; contacto: string; fecha: string }) => {
    // Construimos el payload usando los tipos oficiales CreateOrderInput
    const payload: CreateOrderInput = {
      origen: 'WEB',
      cliente_nombre: data.nombre,
      cliente_contacto: data.contacto,
      fecha_deseada: data.fecha || undefined,
      items: cartItems.map(item => ({
        product_id: item.productId,
        cantidad: item.quantity,
        opciones: [{ valor: item.details }] // Enviamos el resumen como opción por ahora
      }))
    };

    // Llamamos al servicio oficial que maneja el fetch y el fallback
    await orderService.createOrder(payload);

    // Al terminar con éxito, limpiamos el carrito
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

export default App;
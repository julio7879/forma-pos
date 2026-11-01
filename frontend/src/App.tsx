import { useState } from 'react';
import { StoreLayout } from './modules/store/StoreLayout';
import { StoreCatalog } from './modules/store/StoreCatalog';
import { ProductConfigurator } from './modules/store/ProductConfigurator';
import { OrderTracking } from './modules/store/OrderTracking';
import { StoreCart, CartItem } from './modules/store/StoreCart';
import { StoreCheckout } from './modules/store/StoreCheckout';
import { Product } from './types';

export function App() {
  // Estados de navegación
  const [storeView, setStoreView] = useState<'catalog' | 'product' | 'tracking' | 'checkout'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Lógica del Carrito
  const handleAddToCart = (item: any) => {
    // Creamos una firma única para agrupar productos con las mismas opciones
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
    
    setStoreView('catalog'); // Volver al catálogo
    setIsCartOpen(true);      // Abrir el carrito para confirmar
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

  const handleConfirmOrder = (data: any) => {
    // Aquí luego irá el fetch() al backend real
    console.log("Pedido enviado al backend:", data);
    // Por ahora, limpiamos el carrito y mostramos éxito
    setTimeout(() => {
      setCartItems([]);
      setStoreView('catalog');
    }, 2000); // Le damos 2 segundos al componente Checkout para mostrar el mensaje de éxito
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

      {/* Carrito Flotante */}
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
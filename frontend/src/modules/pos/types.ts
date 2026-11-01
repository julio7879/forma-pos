// frontend/src/modules/pos/types.ts

export interface Option {
  id: string;
  label: string;
  extra: number;
  swatch?: string; // Clase de tailwind para el color (ej. 'bg-ink')
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  stock: number;
  imageUrl: string;
  colors: Option[];
  sizes: Option[];
  finishes: Option[];
}

export interface Selection {
  color: string;
  size: string;
  finish: string;
  text: string;
}

export interface CartItem extends Product {
  quantity: number;
  selection: Selection;
  finalUnitPrice: number;
}

// Helper para calcular el precio final con las opciones
export const calculateUnitPrice = (product: Product, sel: Selection) => {
  const colorExtra = product.colors.find((c) => c.id === sel.color)?.extra ?? 0;
  const sizeExtra = product.sizes.find((s) => s.id === sel.size)?.extra ?? 0;
  const finishExtra = product.finishes.find((f) => f.id === sel.finish)?.extra ?? 0;
  const textFee = sel.text.trim().length > 0 ? 8000 : 0;
  return product.basePrice + colorExtra + sizeExtra + finishExtra + textFee;
};

// Datos Mock actualizados
export const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', name: 'Camiseta Origen', category: 'Camisetas', basePrice: 69000, stock: 42, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200&h=200',
    colors: [{ id: 'blanco', label: 'Blanco', extra: 0, swatch: 'bg-white' }, { id: 'negro', label: 'Negro', extra: 0, swatch: 'bg-black' }],
    sizes: [{ id: 's', label: 'S', extra: 0 }, { id: 'm', label: 'M', extra: 0 }, { id: 'xl', label: 'XL', extra: 5000 }],
    finishes: [{ id: 'algodon', label: 'Algodón', extra: 0 }]
  },
  { 
    id: '2', name: 'Taza Nocturna', category: 'Tazas', basePrice: 48000, stock: 6, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=200&h=200',
    colors: [{ id: 'negro', label: 'Negro', extra: 0, swatch: 'bg-black' }, { id: 'dorado', label: 'Dorado', extra: 3000, swatch: 'bg-accent' }],
    sizes: [{ id: 'unico', label: 'Único', extra: 0 }],
    finishes: [{ id: 'brillo', label: 'Brillo', extra: 0 }]
  },
  { 
    id: '3', name: 'Caja Ritual', category: 'Regalos', basePrice: 189000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200&h=200',
    colors: [{ id: 'cafe', label: 'Café', extra: 0, swatch: 'bg-surface' }],
    sizes: [{ id: 'unico', label: 'Único', extra: 0 }],
    finishes: [{ id: 'lino', label: 'Lino', extra: 0 }]
  },
  { 
    id: '4', name: 'Libreta Taller', category: 'Papelería', basePrice: 54000, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=200&h=200',
    colors: [{ id: 'cafe', label: 'Café', extra: 0, swatch: 'bg-surface' }],
    sizes: [{ id: 'a5', label: 'A5', extra: 0 }],
    finishes: [{ id: 'rustico', label: 'Rústico', extra: 0 }]
  },
  { 
    id: '5', name: 'Taza Monograma', category: 'Tazas', basePrice: 42000, stock: 28, imageUrl: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=200&h=200',
    colors: [{ id: 'blanco', label: 'Blanco', extra: 0, swatch: 'bg-white' }],
    sizes: [{ id: 'unico', label: 'Único', extra: 0 }],
    finishes: [{ id: 'mate', label: 'Mate', extra: 0 }]
  },
  { 
    id: '6', name: 'Camiseta Ruta', category: 'Camisetas', basePrice: 74000, stock: 19, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=200&h=200',
    colors: [{ id: 'negro', label: 'Negro', extra: 0, swatch: 'bg-black' }],
    sizes: [{ id: 'm', label: 'M', extra: 0 }, { id: 'l', label: 'L', extra: 0 }],
    finishes: [{ id: 'algodon', label: 'Algodón', extra: 0 }]
  },
];

export const formatCOP = (amount: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
};
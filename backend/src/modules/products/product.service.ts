import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';

export interface ListProductsFilters {
  categoria?: string;
  limit?: number;
}

const productWithOptions = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { options: true },
});

type ProductWithOptions = Prisma.ProductGetPayload<typeof productWithOptions>;

function formatProduct(product: ProductWithOptions) {
  return {
    id: product.id,
    nombre: product.nombre,
    descripcion: product.descripcion,
    imagen_url: product.imagen_url,
    categoria: product.categoria,
    precio_base: Number(product.precio_base),
    stock_actual: product.stock_actual,
    stock_minimo: product.stock_minimo,
    activo: product.activo,
    options: product.options.map((option) => ({
      id: option.id,
      product_id: option.product_id,
      nombre: option.nombre,
      tipo: option.tipo,
      obligatorio: option.obligatorio,
      valores_recargos: option.valores_recargos,
    })),
  };
}

export async function listActiveProducts(filters: ListProductsFilters = {}) {
  const where: Prisma.ProductWhereInput = { activo: true };

  if (filters.categoria) {
    where.categoria = { equals: filters.categoria, mode: 'insensitive' };
  }

  const products = await prisma.product.findMany({
    where,
    include: { options: true },
    orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    ...(filters.limit ? { take: filters.limit } : {}),
  });

  return products.map(formatProduct);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { options: true },
  });

  if (!product) {
    throw new AppError('Producto no encontrado', 404, 'NOT_FOUND');
  }

  return formatProduct(product);
}
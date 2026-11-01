import prisma from '../../config/prisma';

export const productService = {
  async list(categoria?: string) {
    return prisma.product.findMany({
      where: {
        activo: true,
        ...(categoria ? { categoria: categoria as any } : {}),
      },
      include: { options: true },
      orderBy: { nombre: 'asc' },
    });
  },

  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { options: true },
    });
  },
};
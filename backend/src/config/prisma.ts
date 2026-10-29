import { PrismaClient } from '@prisma/client';

// Instancia única (singleton) de PrismaClient
export const prisma = new PrismaClient();

export default prisma;

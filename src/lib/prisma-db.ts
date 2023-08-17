import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = new PrismaClient();

const prismaDB = global.prisma ?? prisma;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaDB;
}

export default prismaDB;

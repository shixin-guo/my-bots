import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.prisma = prisma;
}

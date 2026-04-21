import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

// If the cached client is stale (missing new models), recreate it
if (
  globalThis.prismaGlobal &&
  (!(globalThis.prismaGlobal as any).siteConfig || !(globalThis.prismaGlobal as any).media)
) {
  globalThis.prismaGlobal = undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

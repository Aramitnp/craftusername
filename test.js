const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blogPost.findMany()
  console.log(JSON.stringify(posts, null, 2))
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

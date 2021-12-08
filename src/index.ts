import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const posts = await prisma.post.findMany();
    console.log({ posts });
  } finally {
    prisma.$disconnect();
  }
}

main();

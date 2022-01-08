import { PrismaClient } from "@prisma/client";

const run = async () => {
  const prisma = new PrismaClient();
  try {
    if ((await prisma.author.count()) === 0) {
      await prisma.author.create({
        data: {
          givenName: "Super",
          familyName: "Admin",
          age: 100,
        },
      });
    } else {
      console.log("Default author already created");
    }
  } finally {
    await prisma.$disconnect();
  }
};

run();

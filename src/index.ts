import { Prisma, PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("START --> Insert");
    const authors = await Promise.all(
      [1, 2, 3].map(
        async i =>
          await prisma.author.create({
            data: {
              firstName: `First name ${i}`,
              lastName: `Last name ${i}`,
            },
          })
      )
    );
    console.log({ authors });
    console.log("END --> Insert");

    console.log("START --> Update Single");

    try {
      const updatedAuthor = await prisma.author.update({
        data: {
          posts: {},
        },
        where: {
          id: authors[0].id,
        },
      });
      console.log({ updatedAuthor });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        console.log("Author not found");
      } else console.error(error);
    }

    console.log("END --> Update Single");
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

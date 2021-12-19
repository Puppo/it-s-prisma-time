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

    console.log("START --> Delete Single");

    try {
      const deletedAuthor = await prisma.author.delete({
        where: {
          id: 1,
        },
      });
      console.log({ deletedAuthor });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        console.log("Author not found");
      } else console.error(error);
    }

    console.log("END --> Delete Single");

    console.log("START --> Delete Many");

    const deletedAuthorsResult = await prisma.author.deleteMany({
      where: {
        id: {
          in: authors.map(a => a.id),
        },
      },
    });
    console.log({ deletedAuthorsResult });

    console.log("END --> Delete Many");
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

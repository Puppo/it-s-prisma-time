import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("START --> Simple Insert");

    const newAuthor = await prisma.author.create({
      data: {
        firstName: "John",
        lastName: "Doe",
      },
    });
    console.log({ newAuthor });

    console.log("END --> Simple Insert");

    console.log("START --> Advance Insert");

    const newPost = await prisma.post.create({
      data: {
        title: "First Post",
        content: "This is the first post",
        published: false,
        comments: {
          create: {
            text: "First comment",
            author: {
              connectOrCreate: {
                create: {
                  lastName: "Last name connectOrCreate ",
                  firstName: "First name connectOrCreate",
                },
                where: {
                  id: newAuthor.id,
                },
              },
            },
          },
        },
      },
      include: {
        comments: true,
      },
    });
    console.log("newPost", JSON.stringify(newPost, null, 4));

    console.log("END --> Advance Insert");
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

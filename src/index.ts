import { PrismaClient } from "@prisma/client";

function getRandomInt(min: number, max: number): number {
  return (
    Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
    Math.ceil(min)
  );
}

async function setup(prisma: PrismaClient): Promise<void> {
  if ((await prisma.post.count()) !== 0) {
    console.log("Database already populated");
    return;
  }
  const authors = await Promise.all(
    [...Array(10).keys()].map(
      async i =>
        await prisma.author.create({
          data: {
            firstName: `First name ${i + 1}`,
            lastName: `Last name ${i + 1}`,
            age: getRandomInt(16, 100),
          },
        })
    )
  );

  await Promise.all(
    [...Array(10).keys()].map(
      async i =>
        await prisma.post.create({
          data: {
            title: `Post title ${i + 1}`,
            content: `Post content ${i + 1}`,
            published: (i + 1) % 2 === 0,
            authors: {
              create: [
                {
                  authorId: authors[getRandomInt(1, authors.length) - 1].id,
                },
              ],
            },
            comments: {
              create: [...Array(getRandomInt(1, 10)).keys()].map(i => ({
                text: `Comment text ${i + 1}`,
                authorId:
                  Math.random() > 0.5
                    ? authors[getRandomInt(1, authors.length) - 1].id
                    : undefined,
              })),
            },
          },
        })
    )
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    {
      // transaction array
      const result = await prisma.$transaction([
        prisma.author.create({
          data: {
            firstName: "Author from transaction",
            lastName: "Author from transaction",
            age: getRandomInt(16, 100),
          },
        }),
        prisma.post.create({
          data: {
            title: "Post from transaction",
            content: "Post from transaction",
            published: false,
          },
        }),
      ]);
      console.log(result);
    }

    {
      // transaction method
      try {
        const result = await prisma.$transaction(async () => {
          const authorData = {
            firstName: "Author from transaction",
            lastName: "Author from transaction",
            age: getRandomInt(16, 100),
          } as const;
          const author = await prisma.author.create({
            data: authorData,
          });
          const post = await prisma.post.create({
            data: {
              title: "Post from transaction",
              content: "Post from transaction",
              published: false,
              authors: {
                create: [
                  {
                    authorId: author.id,
                  },
                ],
              },
            },
            include: {
              authors: {
                include: {
                  author: true,
                },
              },
            },
          });
          return { author, post };
        });
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {}
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

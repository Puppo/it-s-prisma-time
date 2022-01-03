import { PrismaClient } from "@prisma/client";

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
                  authorId: authors[i].id,
                },
              ],
            },
          },
        })
    )
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await setup(prisma);
    {
      // skip, take
      const pageOnePosts = await prisma.post.findMany({
        take: 3,
        orderBy: {
          id: "asc",
        },
      });
      console.log(`Page 1: `, JSON.stringify(pageOnePosts, undefined, 2));

      const pageTwoPosts = await prisma.post.findMany({
        skip: 3,
        take: 3,
        orderBy: {
          id: "asc",
        },
      });
      console.log(`Page 2: `, JSON.stringify(pageTwoPosts, undefined, 2));
    }

    {
      // cursor
      const pageOnePosts = await prisma.post.findMany({
        take: 3,
        orderBy: {
          id: "asc",
        },
      });
      console.log(`Page 1: `, JSON.stringify(pageOnePosts, undefined, 2));

      const pageTwoPosts = await prisma.post.findMany({
        skip: 1,
        take: 3,
        cursor: {
          id: pageOnePosts[pageOnePosts.length - 1].id,
        },
        orderBy: {
          id: "asc",
        },
      });
      console.log(`Page 2: `, JSON.stringify(pageTwoPosts, undefined, 2));
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

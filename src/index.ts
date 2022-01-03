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
      // SELECT * FROM post
      const posts = await prisma.post.findMany();
      console.log(`Select: `, JSON.stringify(posts, undefined, 2));
    }

    {
      // SELECT * FROM post WHERE id >= 5
      const posts = await prisma.post.findMany({
        where: {
          id: {
            gte: 5,
          },
        },
      });
      console.log(`Where: `, JSON.stringify(posts, undefined, 2));
    }

    {
      // SELECT * FROM post ORDER BY published DESC
      const posts = await prisma.post.findMany({
        orderBy: {
          published: "desc",
        },
      });
      console.log(
        `OrderBy Single Column: `,
        JSON.stringify(posts, undefined, 2)
      );
    }

    {
      // SELECT * FROM post ORDER BY published DESC, createAt ASC
      const posts = await prisma.post.findMany({
        orderBy: [{ published: "desc" }, { createAt: "asc" }],
      });
      console.log(
        `OrderBy Multiple Columns: `,
        JSON.stringify(posts, undefined, 2)
      );
    }

    {
      // SELECT id, title, content FROM post
      const posts = await prisma.post.findMany({
        select: {
          id: true,
          title: true,
          content: true,
        },
      });
      console.log(`Select Columns: `, JSON.stringify(posts, undefined, 2));
    }

    {
      // Include
      const posts = await prisma.post.findMany({
        include: {
          authors: {
            select: {
              author: true,
            },
          },
          comments: true,
        },
      });
      console.log(`Include: `, JSON.stringify(posts, undefined, 2));
    }

    {
      const post = await prisma.post.findFirst({
        where: {
          published: true,
        },
      });
      console.log(`findFirst: `, JSON.stringify(post, undefined, 2));
    }

    {
      const post = await prisma.post.findUnique({
        where: {
          id: 1,
        },
      });
      console.log(`findUnique: `, JSON.stringify(post, undefined, 2));
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

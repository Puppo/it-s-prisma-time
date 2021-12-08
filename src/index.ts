import { Author, Post, Prisma, PrismaClient } from "@prisma/client";

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
    await setup(prisma);

    {
      const result = await prisma.$executeRaw<Post>`
INSERT INTO posts (title, content, published, updatedAt)
VALUES (${"Post Title"}, ${"Post Content"}, ${false}, ${new Date()});
RETURNING *`;
      console.log(`Insert result: ${result}`);
    }

    {
      const result = await prisma.$queryRaw<Post[]>`
SELECT p.id, p.title, p.content, p.published, p.createAt, p.updatedAt
FROM posts p
WHERE p.published = ${true}
ORDER BY p.createAt DESC`;
      result.forEach(post => {
        const { id, title, content, createAt, published, updatedAt } = post;
        console.log({
          id,
          title,
          content,
          createAt,
          published,
          updatedAt,
        });
      });
    }

    {
      const posts = await prisma.$queryRaw<
        Post[]
      >`SELECT * FROM posts WHERE id IN (${Prisma.join([1, 2, 3])})`;

      console.log(`Posts in 1,2,3: ${JSON.stringify(posts, null, 2)}`);

      const author: string | undefined = "transaction";
      const authors = await prisma.$queryRaw<Author[]>`
      SELECT * FROM authors a ${
        !!author
          ? Prisma.sql`WHERE a.firstName || ' ' || a.lastName LIKE ${`%${author}%`}`
          : Prisma.empty
      }`;

      console.log(`Authors: ${JSON.stringify(authors, null, 2)}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

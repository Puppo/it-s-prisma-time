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
    await setup(prisma);
    {
      // aggregate, avg, max, min
      const aggregate = await prisma.author.aggregate({
        _avg: {
          age: true,
        },
        _max: {
          age: true,
        },
        _min: {
          age: true,
        },
      });
      console.log(`Authors Avg Age: `, aggregate._avg.age);
      console.log(`Authors Max Age: `, aggregate._max.age);
      console.log(`Authors Min Age: `, aggregate._min.age);
    }

    {
      // groupBy
      const commentsGroupByPost = await prisma.comment.groupBy({
        by: ["postId"],
        _count: {
          authorId: true,
          _all: true,
        },
        orderBy: {
          _count: {
            authorId: "desc",
          },
        },
        having: {
          authorId: {
            _count: {
              gt: 1,
            },
          },
        },
      });
      console.table(
        commentsGroupByPost.map(
          ({
            postId,
            _count: { authorId: commentsWithAuthor, _all: commentsCount },
          }) => ({ postId, commentsWithAuthor, commentsCount })
        )
      );
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

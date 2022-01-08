import { PrismaClient } from "@prisma/client";
import type { DataMigration } from "../model";

function getRandomInt(min: number, max: number): number {
  return (
    Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
    Math.ceil(min)
  );
}

const fixture: DataMigration = async () => {
  const prisma = new PrismaClient();
  try {
    prisma.$transaction(async () => {
      const authors = await Promise.all(
        [...Array(10).keys()].map(
          async i =>
            await prisma.author.create({
              data: {
                givenName: `First name ${i + 1}`,
                familyName: `Last name ${i + 1}`,
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
    });
  } finally {
    await prisma.$disconnect();
  }
};

fixture();

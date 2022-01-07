/*
  Warnings:

  - You are about to drop the column `firstName` on the `authors` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `authors` table. All the data in the column will be lost.
  - Added the required column `familyName` to the `authors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `givenName` to the `authors` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_authors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "age" INTEGER NOT NULL
);
INSERT INTO "new_authors"
  ("id", "age", "givenName", "familyName")
SELECT
  "id", "age", "firstName", "lastName"
FROM "authors";
DROP TABLE "authors";
ALTER TABLE "new_authors" RENAME TO "authors";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

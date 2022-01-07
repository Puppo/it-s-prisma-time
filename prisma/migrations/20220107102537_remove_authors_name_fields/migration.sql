/*
  Warnings:

  - You are about to drop the column `firstName` on the `authors` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `authors` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_authors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "age" INTEGER NOT NULL
);
INSERT INTO "new_authors" ("age", "familyName", "givenName", "id") SELECT "age", "familyName", "givenName", "id" FROM "authors";
DROP TABLE "authors";
ALTER TABLE "new_authors" RENAME TO "authors";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateTable
CREATE TABLE "data_migrations" (
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "runningAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("type", "name")
);

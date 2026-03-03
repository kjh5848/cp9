-- CreateTable
CREATE TABLE "research" (
    "project_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "pack" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("project_id", "item_id")
);

-- CreateTable
CREATE TABLE "drafts" (
    "project_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("project_id", "item_id")
);

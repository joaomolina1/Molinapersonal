-- CreateEnum
CREATE TYPE "BreastSide" AS ENUM ('LEFT', 'RIGHT', 'BOTH', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MilkType" AS ENUM ('BREAST_MILK', 'SUPPLEMENT', 'AR');

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectFeed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "breastSide" "BreastSide" NOT NULL DEFAULT 'UNKNOWN',
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BottleFeed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "fedAt" TIMESTAMP(3) NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "milkType" "MilkType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BottleFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Child_userId_idx" ON "Child"("userId");

-- CreateIndex
CREATE INDEX "DirectFeed_userId_startAt_idx" ON "DirectFeed"("userId", "startAt");

-- CreateIndex
CREATE INDEX "DirectFeed_childId_startAt_idx" ON "DirectFeed"("childId", "startAt");

-- CreateIndex
CREATE INDEX "BottleFeed_userId_fedAt_idx" ON "BottleFeed"("userId", "fedAt");

-- CreateIndex
CREATE INDEX "BottleFeed_childId_fedAt_idx" ON "BottleFeed"("childId", "fedAt");

-- AddForeignKey
ALTER TABLE "DirectFeed" ADD CONSTRAINT "DirectFeed_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BottleFeed" ADD CONSTRAINT "BottleFeed_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

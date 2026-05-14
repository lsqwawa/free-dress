-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'VIP');

-- CreateEnum
CREATE TYPE "ClothCategory" AS ENUM ('TOP', 'BOTTOM', 'COAT', 'ACCESSORY', 'SHOE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL DEFAULT '用户',
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clothes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" "ClothCategory" NOT NULL,
    "color" TEXT,
    "style" TEXT,
    "season" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clothes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outfits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiDescription" TEXT,
    "style" TEXT,
    "occasion" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outfits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outfit_clothes" (
    "outfitId" TEXT NOT NULL,
    "clothId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "outfit_clothes_pkey" PRIMARY KEY ("outfitId","clothId")
);

-- CreateTable
CREATE TABLE "favorites" (
    "userId" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("userId","outfitId")
);

-- CreateTable
CREATE TABLE "tryon_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "personImageUrl" TEXT NOT NULL,
    "resultImageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tryon_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "clothes_userId_idx" ON "clothes"("userId");

-- CreateIndex
CREATE INDEX "clothes_category_idx" ON "clothes"("category");

-- CreateIndex
CREATE INDEX "outfits_userId_idx" ON "outfits"("userId");

-- CreateIndex
CREATE INDEX "tryon_results_userId_idx" ON "tryon_results"("userId");

-- CreateIndex
CREATE INDEX "tryon_results_outfitId_idx" ON "tryon_results"("outfitId");

-- AddForeignKey
ALTER TABLE "clothes" ADD CONSTRAINT "clothes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfits" ADD CONSTRAINT "outfits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_clothes" ADD CONSTRAINT "outfit_clothes_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_clothes" ADD CONSTRAINT "outfit_clothes_clothId_fkey" FOREIGN KEY ("clothId") REFERENCES "clothes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tryon_results" ADD CONSTRAINT "tryon_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tryon_results" ADD CONSTRAINT "tryon_results_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

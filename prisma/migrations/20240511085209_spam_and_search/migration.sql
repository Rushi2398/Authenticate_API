-- AlterTable
ALTER TABLE "User" ADD COLUMN     "markedSpam" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Spam" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "likelihood" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Spam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Spam" ADD CONSTRAINT "Spam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

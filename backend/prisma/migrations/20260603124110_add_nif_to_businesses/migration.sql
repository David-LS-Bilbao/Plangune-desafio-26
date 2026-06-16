-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "nif" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_nif_key" ON "businesses"("nif");

/*
  Warnings:

  - A unique constraint covering the columns `[linked_transaction_id]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "linked_transaction_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_linked_transaction_id_key" ON "transactions"("linked_transaction_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_linked_transaction_id_fkey" FOREIGN KEY ("linked_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

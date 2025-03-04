/*
  Warnings:

  - You are about to drop the column `analyzed` on the `GitHubRepo` table. All the data in the column will be lost.
  - You are about to drop the column `pinecone_index` on the `GitHubRepo` table. All the data in the column will be lost.
  - You are about to drop the column `pinecone_namespaces` on the `GitHubRepo` table. All the data in the column will be lost.
  - You are about to drop the `IGChatHistoryRepo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IGChatMessageRepo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "IGChatHistoryRepo" DROP CONSTRAINT "IGChatHistoryRepo_githubRepoId_fkey";

-- DropForeignKey
ALTER TABLE "IGChatMessageRepo" DROP CONSTRAINT "IGChatMessageRepo_chatId_fkey";

-- AlterTable
ALTER TABLE "GitHubRepo" DROP COLUMN "analyzed",
DROP COLUMN "pinecone_index",
DROP COLUMN "pinecone_namespaces";

-- DropTable
DROP TABLE "IGChatHistoryRepo";

-- DropTable
DROP TABLE "IGChatMessageRepo";

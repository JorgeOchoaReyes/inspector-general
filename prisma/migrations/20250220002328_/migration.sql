/*
  Warnings:

  - You are about to drop the column `pullRequestId` on the `IGChatHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[githubPullRequestId]` on the table `IGChatHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ig_chat_id` to the `GitHubPullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `githubPullRequestId` to the `IGChatHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IGChatHistory" DROP CONSTRAINT "IGChatHistory_pullRequestId_fkey";

-- AlterTable
ALTER TABLE "GitHubPullRequest" ADD COLUMN     "ig_chat_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IGChatHistory" DROP COLUMN "pullRequestId",
ADD COLUMN     "githubPullRequestId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IGChatHistory_githubPullRequestId_key" ON "IGChatHistory"("githubPullRequestId");

-- AddForeignKey
ALTER TABLE "IGChatHistory" ADD CONSTRAINT "IGChatHistory_githubPullRequestId_fkey" FOREIGN KEY ("githubPullRequestId") REFERENCES "GitHubPullRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

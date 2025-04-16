/*
  Warnings:

  - You are about to drop the column `githubPullRequestId` on the `IGChatHistory` table. All the data in the column will be lost.
  - You are about to drop the column `githubPullRequestId` on the `InstructionsPullRequest` table. All the data in the column will be lost.
  - You are about to drop the `GitHubPullRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GitHubRepo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[pullRequestId]` on the table `IGChatHistory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pullRequestId]` on the table `InstructionsPullRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pullRequestId` to the `IGChatHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pullRequestId` to the `InstructionsPullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GitHubPullRequest" DROP CONSTRAINT "GitHubPullRequest_githunRepoId_fkey";

-- DropForeignKey
ALTER TABLE "GitHubRepo" DROP CONSTRAINT "GitHubRepo_accountId_fkey";

-- DropForeignKey
ALTER TABLE "IGChatHistory" DROP CONSTRAINT "IGChatHistory_githubPullRequestId_fkey";

-- DropForeignKey
ALTER TABLE "InstructionsPullRequest" DROP CONSTRAINT "InstructionsPullRequest_githubPullRequestId_fkey";

-- DropIndex
DROP INDEX "IGChatHistory_githubPullRequestId_key";

-- DropIndex
DROP INDEX "InstructionsPullRequest_githubPullRequestId_key";

-- AlterTable
ALTER TABLE "IGChatHistory" DROP COLUMN "githubPullRequestId",
ADD COLUMN     "pullRequestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InstructionsPullRequest" DROP COLUMN "githubPullRequestId",
ADD COLUMN     "pullRequestId" TEXT NOT NULL;

-- DropTable
DROP TABLE "GitHubPullRequest";

-- DropTable
DROP TABLE "GitHubRepo";

-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "fork" BOOLEAN NOT NULL,
    "url" TEXT NOT NULL,
    "git_url" TEXT NOT NULL,
    "ssh_url" TEXT NOT NULL,
    "clone_url" TEXT NOT NULL,
    "svn_url" TEXT NOT NULL,
    "homepage" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "stargazers_count" INTEGER NOT NULL,
    "watchers_count" INTEGER NOT NULL,
    "repo_inspected" BOOLEAN NOT NULL DEFAULT false,
    "accountId" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "diff_url" TEXT NOT NULL,
    "html_url" TEXT NOT NULL,
    "issues_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "commits_url" TEXT NOT NULL,
    "review_comments_url" TEXT NOT NULL,
    "review_comment_url" TEXT NOT NULL,
    "comments_url" TEXT NOT NULL,
    "statuses_url" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "ig_chat_id" TEXT NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IGChatHistory_pullRequestId_key" ON "IGChatHistory"("pullRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "InstructionsPullRequest_pullRequestId_key" ON "InstructionsPullRequest"("pullRequestId");

-- AddForeignKey
ALTER TABLE "Repo" ADD CONSTRAINT "Repo_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "GitHubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionsPullRequest" ADD CONSTRAINT "InstructionsPullRequest_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IGChatHistory" ADD CONSTRAINT "IGChatHistory_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

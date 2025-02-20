-- CreateTable
CREATE TABLE "GitHubPullRequest" (
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
    "githunRepoId" TEXT NOT NULL,

    CONSTRAINT "GitHubPullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IGChatHistory" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "chatName" TEXT NOT NULL,
    "pullRequestUpdated" TIMESTAMP(3) NOT NULL,
    "pullRequestId" TEXT NOT NULL,

    CONSTRAINT "IGChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IGChatMessage" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "IGChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GitHubPullRequest" ADD CONSTRAINT "GitHubPullRequest_githunRepoId_fkey" FOREIGN KEY ("githunRepoId") REFERENCES "GitHubRepo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IGChatHistory" ADD CONSTRAINT "IGChatHistory_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "GitHubPullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IGChatMessage" ADD CONSTRAINT "IGChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "IGChatHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

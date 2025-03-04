-- CreateTable
CREATE TABLE "IGChatHistoryRepo" (
    "id" TEXT NOT NULL,
    "chatName" TEXT NOT NULL,
    "repoUpdated" TIMESTAMP(3) NOT NULL,
    "githubRepoId" TEXT NOT NULL,

    CONSTRAINT "IGChatHistoryRepo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IGChatMessageRepo" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "IGChatMessageRepo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IGChatHistoryRepo_githubRepoId_key" ON "IGChatHistoryRepo"("githubRepoId");

-- AddForeignKey
ALTER TABLE "IGChatHistoryRepo" ADD CONSTRAINT "IGChatHistoryRepo_githubRepoId_fkey" FOREIGN KEY ("githubRepoId") REFERENCES "GitHubRepo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IGChatMessageRepo" ADD CONSTRAINT "IGChatMessageRepo_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "IGChatHistoryRepo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

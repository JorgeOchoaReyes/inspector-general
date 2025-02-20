-- CreateTable
CREATE TABLE "InstructionsPullRequest" (
    "id" TEXT NOT NULL,
    "instructions" TEXT[],
    "githubPullRequestId" TEXT NOT NULL,

    CONSTRAINT "InstructionsPullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstructionsPullRequest_githubPullRequestId_key" ON "InstructionsPullRequest"("githubPullRequestId");

-- AddForeignKey
ALTER TABLE "InstructionsPullRequest" ADD CONSTRAINT "InstructionsPullRequest_githubPullRequestId_fkey" FOREIGN KEY ("githubPullRequestId") REFERENCES "GitHubPullRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

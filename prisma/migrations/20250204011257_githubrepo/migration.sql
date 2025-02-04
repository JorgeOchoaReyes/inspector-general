-- CreateTable
CREATE TABLE "GitHubRepo" (
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
    "avatar_url" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "GitHubRepo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GitHubRepo" ADD CONSTRAINT "GitHubRepo_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "GitHubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "GitHubRepo" ADD COLUMN     "analyzed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinecone_index" TEXT,
ADD COLUMN     "pinecone_namespaces" TEXT;

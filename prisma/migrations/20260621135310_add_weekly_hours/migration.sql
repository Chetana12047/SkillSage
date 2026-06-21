-- AlterTable
ALTER TABLE "users" ADD COLUMN "activeTab" TEXT;
ALTER TABLE "users" ADD COLUMN "currentLevel" TEXT;
ALTER TABLE "users" ADD COLUMN "progressData" JSONB;
ALTER TABLE "users" ADD COLUMN "resumeText" TEXT;
ALTER TABLE "users" ADD COLUMN "roadmapData" JSONB;
ALTER TABLE "users" ADD COLUMN "selectedCourse" TEXT;
ALTER TABLE "users" ADD COLUMN "selectedDuration" TEXT;
ALTER TABLE "users" ADD COLUMN "weeklyHours" TEXT;

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

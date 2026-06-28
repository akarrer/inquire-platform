-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'EDUCATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('MATH', 'ELA', 'SCIENCE');

-- CreateEnum
CREATE TYPE "ContextLevel" AS ENUM ('SPARSE', 'PARTIAL', 'RICH');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "domain" "Domain" NOT NULL,
    "contextLevel" "ContextLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "scenarioText" TEXT NOT NULL,
    "contextText" TEXT,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tags" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "abilityEstimate" DOUBLE PRECISION,
    "abilitySE" DOUBLE PRECISION,
    "sparseTheta" DOUBLE PRECISION,
    "richTheta" DOUBLE PRECISION,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionItem" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "presentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeOnTask" INTEGER,
    "scaffolded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SessionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmittedQuestion" (
    "id" TEXT NOT NULL,
    "sessionItemId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmittedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionScore" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "d1Linguistic" DOUBLE PRECISION NOT NULL,
    "d2ContentKnowledge" DOUBLE PRECISION NOT NULL,
    "d3CriticalThinking" DOUBLE PRECISION NOT NULL,
    "d4InquirySoph" DOUBLE PRECISION NOT NULL,
    "d5ContextIntegration" DOUBLE PRECISION NOT NULL,
    "composite" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT NOT NULL,
    "linguisticRationale" TEXT,
    "contentRationale" TEXT,
    "thinkingRationale" TEXT,
    "inquiryRationale" TEXT,
    "contextRationale" TEXT,
    "rawResponse" JSONB,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionScore_questionId_key" ON "QuestionScore"("questionId");

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionItem" ADD CONSTRAINT "SessionItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionItem" ADD CONSTRAINT "SessionItem_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedQuestion" ADD CONSTRAINT "SubmittedQuestion_sessionItemId_fkey" FOREIGN KEY ("sessionItemId") REFERENCES "SessionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionScore" ADD CONSTRAINT "QuestionScore_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SubmittedQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

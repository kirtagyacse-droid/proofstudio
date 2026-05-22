-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "name" TEXT,
    "hasSeenDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdDemoProject" BOOLEAN NOT NULL DEFAULT false,
    "completedFirstTestimonial" BOOLEAN NOT NULL DEFAULT false,
    "completedFirstContentPack" BOOLEAN NOT NULL DEFAULT false,
    "viewedWall" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "brandName" TEXT,
    "logoUrl" TEXT,
    "brandColor" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "formWelcomeText" TEXT,
    "formThankYouText" TEXT,
    "userId" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT,
    "rawText" TEXT,
    "clientRole" TEXT NOT NULL,
    "resultMetric" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "rating" INTEGER,
    "isVideo" BOOLEAN NOT NULL DEFAULT false,
    "videoUrl" TEXT,
    "videoStorageKey" TEXT,
    "videoDurationSeconds" INTEGER,
    "transcript" TEXT,
    "allowNameDisplay" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "caseStudy" TEXT,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Testimonial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkedinPosts" TEXT NOT NULL,
    "caseStudyOutline" TEXT NOT NULL,
    "landingBlock" TEXT NOT NULL,
    "shortVideoScript" TEXT NOT NULL,
    "testimonialId" TEXT NOT NULL,
    CONSTRAINT "ContentPack_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "Testimonial" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPack_testimonialId_key" ON "ContentPack"("testimonialId");


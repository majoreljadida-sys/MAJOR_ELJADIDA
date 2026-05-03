-- CreateTable
CREATE TABLE "club_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "clubName" TEXT,
    "clubAddress" TEXT,
    "clubLogo" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "whatsappGroupLink" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_settings_pkey" PRIMARY KEY ("id")
);

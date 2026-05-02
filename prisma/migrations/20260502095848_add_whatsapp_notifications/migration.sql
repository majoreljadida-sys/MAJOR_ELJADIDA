-- CreateEnum
CREATE TYPE "WhatsappNotificationType" AS ENUM ('TRAINING', 'EVENT', 'BLOG', 'CUSTOM');

-- CreateTable
CREATE TABLE "whatsapp_notifications" (
    "id" TEXT NOT NULL,
    "type" "WhatsappNotificationType" NOT NULL,
    "refId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whatsapp_notifications_sentAt_idx" ON "whatsapp_notifications"("sentAt");

-- CreateIndex
CREATE INDEX "whatsapp_notifications_type_refId_idx" ON "whatsapp_notifications"("type", "refId");

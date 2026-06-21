-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "severityScore" DOUBLE PRECISION NOT NULL,
    "hotspotScore" DOUBLE PRECISION NOT NULL,
    "junctionScore" DOUBLE PRECISION NOT NULL,
    "closureScore" DOUBLE PRECISION NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "trafficScore" DOUBLE PRECISION NOT NULL,
    "riskCategory" TEXT NOT NULL,
    "officers" INTEGER NOT NULL,
    "barricades" INTEGER NOT NULL,
    "towVehicles" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_eventId_key" ON "Prediction"("eventId");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

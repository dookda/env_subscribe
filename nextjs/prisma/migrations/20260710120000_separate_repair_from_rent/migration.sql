-- Separate repair from rent: RepairRequest keeps its own equipment info
-- instead of referencing the rental inventory (EquipmentItem).

ALTER TABLE "RepairRequest" ADD COLUMN "equipmentName" TEXT;
ALTER TABLE "RepairRequest" ADD COLUMN "model" TEXT;

-- Backfill existing rows from the previously linked equipment.
UPDATE "RepairRequest" r
SET "equipmentName" = e."equipmentName",
    "model"         = e."model"
FROM "EquipmentItem" e
WHERE r."equipmentId" = e."id";

UPDATE "RepairRequest" SET "equipmentName" = '-' WHERE "equipmentName" IS NULL;
ALTER TABLE "RepairRequest" ALTER COLUMN "equipmentName" SET NOT NULL;

ALTER TABLE "RepairRequest" DROP CONSTRAINT "RepairRequest_equipmentId_fkey";
DROP INDEX "RepairRequest_equipmentId_idx";
ALTER TABLE "RepairRequest" DROP COLUMN "equipmentId";

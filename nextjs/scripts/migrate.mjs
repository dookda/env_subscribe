// Applies Prisma migrations, self-baselining databases that predate migration
// tracking (tables exist but there is no _prisma_migrations history, e.g. a
// volume initialized by the old postgres/init/01-schema.sql). Runs as the
// one-shot `migrate` compose service before the app starts.
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function tableExists(name) {
    const rows = await prisma.$queryRaw`
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ${name}
        ) AS "exists"`;
    return rows[0].exists;
}

async function columnExists(table, column) {
    const rows = await prisma.$queryRaw`
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}
        ) AS "exists"`;
    return rows[0].exists;
}

// Per-migration marker: is this migration's change already in the database?
// Migrations without a marker are assumed applied on legacy databases, since
// every legacy database was initialized with the fully-migrated EquipmentItem
// schema. Baselining stops at the first migration whose marker is absent;
// `migrate deploy` then applies it and everything after, in order.
const MARKERS = {
    "20260613024800_init": () => tableExists("EquipmentItem"),
    "20260710000000_add_repair_request": () => tableExists("RepairRequest"),
    "20260710120000_separate_repair_from_rent": () => columnExists("RepairRequest", "equipmentName"),
};

const hasHistory = await tableExists("_prisma_migrations");
const hasLegacySchema = await tableExists("EquipmentItem");

if (!hasHistory && hasLegacySchema) {
    console.log("Legacy database without migration history detected — baselining...");
    const migrations = readdirSync("prisma/migrations", { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort();
    for (const name of migrations) {
        const alreadyApplied = MARKERS[name] ? await MARKERS[name]() : true;
        if (!alreadyApplied) break;
        execSync(`npx prisma migrate resolve --applied ${name}`, { stdio: "inherit" });
    }
}

await prisma.$disconnect();
execSync("npx prisma migrate deploy", { stdio: "inherit" });

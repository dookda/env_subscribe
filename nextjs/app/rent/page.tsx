import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import EquipmentCard, { type EquipmentCardItem } from "@/components/EquipmentCard";
import StatsBar from "@/components/StatsBar";
import { prisma } from "@/lib/db/prisma";
import { filterSchema } from "@/lib/validation/schemas";
import { getT, type Lang } from "@/lib/i18n";
import SearchInput from "@/components/SearchInput";

export const dynamic = "force-dynamic";

const CARD_SELECT = {
    id: true,
    equipmentName: true,
    model: true,
    customerName: true,
    location: true,
    latitude: true,
    longitude: true,
    image: true,
    inUse: true,
    expiredAt: true,
} as const;

function getString(value: string | string[] | undefined) {
    return typeof value === "string" ? value : undefined;
}

async function EquipmentList({
    search,
    sortBy,
    sortDir,
    t,
}: {
    search?: string;
    sortBy: "equipmentName" | "createdAt";
    sortDir: "asc" | "desc";
    t: ReturnType<typeof getT>;
}) {
    const where = {
        isArchived: false,
        ...(search ? {
            OR: [
                { equipmentName: { contains: search, mode: "insensitive" as const } },
                { model: { contains: search, mode: "insensitive" as const } },
                { customerName: { contains: search, mode: "insensitive" as const } },
            ],
        } : {}),
    };

    const orderBy = sortBy === "equipmentName"
        ? { equipmentName: sortDir }
        : { createdAt: sortDir };

    const items = await prisma.equipmentItem.findMany({
        where,
        orderBy,
        select: CARD_SELECT,
    }) satisfies EquipmentCardItem[];

    if (items.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-sm text-text-muted">{t.noEquipment}</p>
                <Link href="/equipment/new">
                    <Button className="mt-4" size="sm">{t.addFirst}</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
                <EquipmentCard key={item.id} item={item} />
            ))}
        </div>
    );
}

export default async function RentPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const [rawParams, jar] = await Promise.all([searchParams, cookies()]);
    const lang = (jar.get("lang")?.value ?? "th") as Lang;
    const t = getT(lang);

    const parsed = filterSchema.safeParse({
        search: getString(rawParams.search),
        sortBy: getString(rawParams.sortBy),
        sortDir: getString(rawParams.sortDir),
    });
    const filters = parsed.success ? parsed.data : filterSchema.parse({});

    return (
        <div className="space-y-4">
            <StatsBar t={t} />

            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-text-primary">{t.equipment}</h1>
                <Link href="/equipment/new">
                    <Button className="flex items-center gap-1 text-sm" size="sm">
                        <Icon name="add" size={16} />
                        {t.register}
                    </Button>
                </Link>
            </div>

            <div className="flex gap-2">
                <Suspense fallback={null}>
                    <SearchInput defaultValue={filters.search} />
                </Suspense>
                <Link href="/rent">
                    <Button variant="ghost" className="text-text-muted" size="sm">{t.clear}</Button>
                </Link>
            </div>

            <Suspense fallback={<div className="py-8 text-center text-sm text-text-muted">{t.loading}</div>}>
                <EquipmentList search={filters.search} sortBy={filters.sortBy} sortDir={filters.sortDir} t={t} />
            </Suspense>
        </div>
    );
}

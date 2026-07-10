import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { prisma } from "@/lib/db/prisma";
import { RepairStatusBadge } from "@/components/RepairStatusBadge";
import { getT, type Lang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/repair-categories";
import type { RepairStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["ALL", "PENDING", "IN_REPAIR", "DONE", "CANCELLED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function parseStatus(val: string | undefined): StatusFilter {
    if (val && (STATUS_FILTERS as readonly string[]).includes(val)) return val as StatusFilter;
    return "ALL";
}

export default async function RepairPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const [rawParams, jar] = await Promise.all([searchParams, cookies()]);
    const lang = (jar.get("lang")?.value ?? "th") as Lang;
    const t = getT(lang);

    const sf = parseStatus(typeof rawParams.status === "string" ? rawParams.status : undefined);

    const repairs = await prisma.repairRequest.findMany({
        where: sf === "ALL" ? {} : { status: sf as RepairStatus },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            equipmentName: true,
            model: true,
            reporterName: true,
            status: true,
            issueCategories: true,
            createdAt: true,
        },
    });

    const statusLabel: Record<StatusFilter, string> = {
        ALL: t.filterAll,
        PENDING: t.statusPending,
        IN_REPAIR: t.statusInRepair,
        DONE: t.statusDone,
        CANCELLED: t.statusCancelled,
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-text-primary">{t.repairTitle}</h1>
                <Link href="/repair/new">
                    <Button className="flex items-center gap-1 text-sm" size="sm">
                        <Icon name="add" size={16} />
                        {t.repairNew}
                    </Button>
                </Link>
            </div>

            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map(s => (
                    <Link key={s} href={s === "ALL" ? "/repair" : `/repair?status=${s}`}>
                        <button
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${sf === s
                                    ? "bg-brand text-white"
                                    : "bg-surface-sunken text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            {statusLabel[s]}
                        </button>
                    </Link>
                ))}
            </div>

            {/* List */}
            {repairs.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-sm text-text-muted">{t.repairNoList}</p>
                    <Link href="/repair/new">
                        <Button className="mt-4" size="sm">{t.repairNew}</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {repairs.map(r => (
                        <Link key={r.id} href={`/repair/${r.id}`}>
                            <div className="rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <RepairStatusBadge status={r.status} lang={lang} />
                                            <p className="truncate font-medium text-text-primary">
                                                {r.equipmentName}
                                            </p>
                                        </div>
                                        {r.model && <p className="mt-0.5 text-xs text-text-muted">{r.model}</p>}
                                        <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
                                            <span className="flex items-center gap-1">
                                                <Icon name="person" size={13} />
                                                {r.reporterName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon name="schedule" size={13} />
                                                {new Date(r.createdAt).toLocaleDateString(
                                                    lang === "th" ? "th-TH" : "en-GB",
                                                )}
                                            </span>
                                        </div>
                                        {r.issueCategories.length > 0 && (
                                            <p className="mt-1.5 text-xs text-text-muted">
                                                {r.issueCategories.map(c => categoryLabel(c, t)).join(" · ")}
                                            </p>
                                        )}
                                    </div>
                                    <Icon name="chevron_right" size={20} className="mt-1 shrink-0 text-text-muted" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

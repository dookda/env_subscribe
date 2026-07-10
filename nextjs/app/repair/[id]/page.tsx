import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { prisma } from "@/lib/db/prisma";
import { RepairStatusBadge } from "@/components/RepairStatusBadge";
import RepairActions from "@/components/RepairActions";
import { getT, type Lang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/repair-categories";

export const dynamic = "force-dynamic";

function TimelineItem({
    icon,
    label,
    date,
    lang,
}: {
    icon: string;
    label: string;
    date: Date;
    lang: Lang;
}) {
    return (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="material-icons text-[18px] text-brand leading-none">{icon}</span>
            <span>{label}</span>
            <span className="ml-auto text-xs text-text-muted">
                {new Date(date).toLocaleString(lang === "th" ? "th-TH" : "en-GB", {
                    dateStyle: "short",
                    timeStyle: "short",
                })}
            </span>
        </div>
    );
}

export default async function RepairDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [{ id }, jar] = await Promise.all([params, cookies()]);
    const lang = (jar.get("lang")?.value ?? "th") as Lang;
    const t = getT(lang);

    const repair = await prisma.repairRequest.findUnique({
        where: { id },
    });

    if (!repair) notFound();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/repair">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 rounded-xl text-slate-500 dark:text-slate-400 dark:hover:bg-slate-700"
                    >
                        <span className="material-icons select-none text-[18px] leading-none">arrow_back</span>
                        {t.back}
                    </Button>
                </Link>
                <h1 className="truncate text-xl font-bold text-text-primary">{t.repairDetail}</h1>
            </div>

            {/* Status card + actions */}
            <div className="rounded-card border border-border bg-surface p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <RepairStatusBadge status={repair.status} lang={lang} />
                    <span className="text-xs text-text-muted">
                        {new Date(repair.createdAt).toLocaleDateString(
                            lang === "th" ? "th-TH" : "en-GB",
                            { dateStyle: "medium" },
                        )}
                    </span>
                </div>
                <RepairActions id={repair.id} status={repair.status} />
            </div>

            {/* Equipment */}
            <div className="rounded-card border border-border bg-surface p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t.repairEquipSection}
                </p>
                <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-text-muted">
                        <Icon name="sensors" size={24} />
                    </div>
                    <div>
                        <p className="font-semibold text-text-primary">{repair.equipmentName}</p>
                        {repair.model && <p className="text-xs text-text-muted">{repair.model}</p>}
                    </div>
                </div>
            </div>

            {/* Problem */}
            <div className="rounded-card border border-border bg-surface p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t.repairProblem}
                </p>
                {repair.issueCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {repair.issueCategories.map(c => (
                            <span
                                key={c}
                                className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs text-text-secondary"
                            >
                                {categoryLabel(c, t)}
                            </span>
                        ))}
                    </div>
                )}
                {repair.issueNote && (
                    <p className="text-sm text-text-secondary">{repair.issueNote}</p>
                )}
                {repair.issueCategories.length === 0 && !repair.issueNote && (
                    <p className="text-sm text-text-muted">-</p>
                )}
            </div>

            {/* Images */}
            {repair.images.length > 0 && (
                <div className="rounded-card border border-border bg-surface p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        {t.repairPhotos}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {repair.images.map((img, i) => (
                            <div
                                key={i}
                                className="relative aspect-square overflow-hidden rounded-lg bg-surface-sunken"
                            >
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${img}`}
                                    alt={`photo-${i + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reporter */}
            <div className="rounded-card border border-border bg-surface p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t.reporter}
                </p>
                <p className="text-sm font-medium text-text-primary">{repair.reporterName}</p>
                {repair.reporterPhone && (
                    <p className="flex items-center gap-1 text-sm text-text-secondary">
                        <Icon name="phone" size={14} />
                        {repair.reporterPhone}
                    </p>
                )}
            </div>

            {/* Timeline */}
            <div className="rounded-card border border-border bg-surface p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t.repairTimeline}
                </p>
                <TimelineItem icon="add_circle" label={t.repairRequested} date={repair.createdAt} lang={lang} />
                {repair.checkInAt && (
                    <TimelineItem icon="login" label={t.checkInAt} date={repair.checkInAt} lang={lang} />
                )}
                {repair.checkOutAt && (
                    <TimelineItem icon="logout" label={t.checkOutAt} date={repair.checkOutAt} lang={lang} />
                )}
                {repair.techNote && (
                    <p className="pl-7 text-xs italic text-text-secondary">&ldquo;{repair.techNote}&rdquo;</p>
                )}
            </div>
        </div>
    );
}

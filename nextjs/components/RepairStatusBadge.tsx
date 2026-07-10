import { Badge } from "@/components/ui/badge";
import type { RepairStatus } from "@prisma/client";
import type { Lang } from "@/lib/i18n";

type Variant = "default" | "warning" | "success" | "danger";

const MAP: Record<RepairStatus, { variant: Variant; th: string; en: string }> = {
    PENDING: { variant: "default", th: "รอรับเครื่อง", en: "Pending" },
    IN_REPAIR: { variant: "warning", th: "กำลังซ่อม", en: "In Repair" },
    DONE: { variant: "success", th: "เสร็จสิ้น", en: "Done" },
    CANCELLED: { variant: "danger", th: "ยกเลิก", en: "Cancelled" },
};

export function RepairStatusBadge({
    status,
    lang = "th",
}: {
    status: RepairStatus;
    lang?: Lang;
}) {
    const { variant, th, en } = MAP[status];
    return <Badge variant={variant}>{lang === "th" ? th : en}</Badge>;
}

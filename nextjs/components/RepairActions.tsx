"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { checkInRepair, checkOutRepair, cancelRepair } from "@/lib/db/repair-actions";
import type { RepairStatus } from "@prisma/client";
import { useLang } from "@/components/LangProvider";

export default function RepairActions({
    id,
    status,
}: {
    id: string;
    status: RepairStatus;
}) {
    const { t } = useLang();
    const [isPending, startTransition] = useTransition();
    const [techNote, setTechNote] = useState("");
    const [showCheckOut, setShowCheckOut] = useState(false);

    if (status === "PENDING") {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => startTransition(() => checkInRepair(id))}
                >
                    {t.checkIn}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    className="text-danger hover:text-danger"
                    onClick={() => startTransition(() => cancelRepair(id))}
                >
                    {t.cancelRepair}
                </Button>
            </div>
        );
    }

    if (status === "IN_REPAIR") {
        if (showCheckOut) {
            return (
                <div className="space-y-2">
                    <textarea
                        className="w-full rounded-input border border-border bg-surface-sunken px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                        placeholder={t.techNotePlaceholder}
                        rows={2}
                        value={techNote}
                        onChange={e => setTechNote(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => startTransition(() => checkOutRepair(id, techNote))}
                        >
                            {t.confirmCheckOut}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() => setShowCheckOut(false)}
                        >
                            {t.repairBack}
                        </Button>
                    </div>
                </div>
            );
        }
        return (
            <Button size="sm" onClick={() => setShowCheckOut(true)}>
                {t.checkOut}
            </Button>
        );
    }

    return null;
}

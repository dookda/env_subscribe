import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import RepairForm from "@/components/RepairForm";
import { getT, type Lang } from "@/lib/i18n";

export default async function NewRepairPage() {
    const jar = await cookies();
    const lang = (jar.get("lang")?.value ?? "th") as Lang;
    const t = getT(lang);

    return (
        <div className="space-y-4">
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
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.repairNew}</h1>
            </div>
            <RepairForm />
        </div>
    );
}

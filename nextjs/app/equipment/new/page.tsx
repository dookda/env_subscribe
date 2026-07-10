import Link from "next/link";
import { cookies } from "next/headers";
import EquipmentForm from "@/components/EquipmentForm";
import { Button } from "@/components/ui/button";
import { getT, type Lang } from "@/lib/i18n";

export default async function NewEquipmentPage() {
  const lang = ((await cookies()).get("lang")?.value ?? "th") as Lang;
  const t = getT(lang);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/rent">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 rounded-xl text-slate-500 dark:text-slate-400 dark:hover:bg-slate-700">
            <span className="material-icons select-none text-[18px] leading-none">arrow_back</span>
            {t.back}
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.registerEquipment}</h1>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <EquipmentForm />
      </div>
    </div>
  );
}

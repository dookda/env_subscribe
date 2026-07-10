import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EquipmentForm from "@/components/EquipmentForm";
import CardDeleteButton from "@/components/CardDeleteButton";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/prisma";
import { getT, type Lang } from "@/lib/i18n";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const [{ id }, jar] = await Promise.all([params, cookies()]);
  const lang = (jar.get("lang")?.value ?? "th") as Lang;
  const t = getT(lang);

  const equipment = await prisma.equipmentItem.findFirst({ where: { id, isArchived: false } });
  if (!equipment) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/rent">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 rounded-xl text-slate-500 dark:text-slate-400 dark:hover:bg-slate-700">
            <span className="material-icons select-none text-[18px] leading-none">arrow_back</span>
            {t.back}
          </Button>
        </Link>
        <h1 className="truncate text-xl font-bold text-slate-800 dark:text-slate-100">{equipment.equipmentName}</h1>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">{t.equipmentDetails}</h2>
        <EquipmentForm equipment={equipment} />
        <div className="border-t border-slate-100 pt-2 dark:border-slate-700">
          <CardDeleteButton id={equipment.id} variant="full" />
        </div>
      </div>
    </div>
  );
}

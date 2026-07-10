"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEquipment } from "@/lib/db/actions";
import { useLang } from "@/components/LangProvider";

export default function CardDeleteButton({ id, variant = "icon" }: { id: string; variant?: "icon" | "full" }) {
  const router = useRouter();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(t.deleteConfirm)) return;

    setLoading(true);
    await deleteEquipment(id);
    setLoading(false);

    if (variant === "full") router.push("/rent");
    router.refresh();
  };

  if (variant === "full") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-100 py-2 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
      >
        <span className="material-icons select-none text-[18px] leading-none">delete</span>
        {loading ? t.deleting : t.deleteEquipment}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-slate-400 shadow-sm hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:bg-slate-700/80 dark:hover:bg-red-900 dark:hover:text-red-400"
      aria-label={t.deleteEquipment}
    >
      {loading
        ? <span className="material-icons select-none text-[14px] leading-none">progress_activity</span>
        : <span className="material-icons select-none text-[14px] leading-none">close</span>
      }
    </button>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useLang } from "@/components/LangProvider";

export default function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const { t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const externalChange = useRef(false);

  // Sync input when URL search param is cleared externally (e.g. Clear button)
  useEffect(() => {
    const q = searchParams.get("search") ?? "";
    if (q !== value) {
      externalChange.current = true;
      setValue(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (externalChange.current) {
      externalChange.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      const next = params.toString();
      if (next === searchParams.toString()) return;
      router.replace(`${pathname}${next ? `?${next}` : ""}`);
    }, 400);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={t.search}
      className="flex-1 rounded-xl border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
    />
  );
}

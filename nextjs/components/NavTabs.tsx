"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/LangProvider";

export default function NavTabs() {
    const pathname = usePathname();
    const { t } = useLang();

    const tabs = [
        // Equipment pages belong to the rent flow, so they keep the Rent tab active.
        { href: "/rent", label: t.rentNav, prefixes: ["/rent", "/equipment"] },
        { href: "/repair", label: t.repairNav, prefixes: ["/repair"] },
    ];

    return (
        <div className="flex gap-1">
            {tabs.map(({ href, label, prefixes }) => {
                const active = prefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                            active
                                ? "bg-brand text-white"
                                : "text-text-secondary hover:text-text-primary",
                        )}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}

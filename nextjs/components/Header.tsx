import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import logo from "@/app/logo.png";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/rent" className="flex items-center gap-2 text-lg font-bold text-text-primary">
            <Image src={logo} alt="ENVIR Store logo" width={32} height={32} priority className="rounded-full" />
            <span>ENVIR Store</span>
          </Link>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import Header from "@/components/Header";
import type { Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "ENVIR Store",
  description: "Equipment service records management",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = ((await cookies()).get("lang")?.value ?? "th") as Lang;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body>
        <LangProvider initial={lang}>
          <div className="min-h-screen bg-surface-raised text-text-primary antialiased">
            <Header />
            <main className="mx-auto max-w-5xl px-4 pb-6 pt-28">{children}</main>
          </div>
        </LangProvider>
      </body>
    </html>
  );
}

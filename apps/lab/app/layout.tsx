import type { Metadata } from "next";
import { AOSProvider } from "@/components/aos-provider";
import "./globals.css";
import LabShell from "@/components/LabShell";
import PageLoader from "@/components/PageLoader";

export const metadata: Metadata = {
  title: "Fidel Lab — Interactive NLP Console",
  description:
    "Interactive playground, transliteration sandbox, and tokenization tools for Amharic language processing.",
};

import { ModeProvider } from "@/components/mode-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              const saved = localStorage.getItem("fidel-theme");
              const theme = saved || "dark";
              if (theme === "dark") {
                document.documentElement.classList.add("dark");
                document.body.classList.add("dark");
                document.body.style.backgroundColor = "#030303";
                document.body.style.color = "#ffffff";
              } else {
                document.documentElement.classList.remove("dark");
                document.body.classList.remove("dark");
                document.body.style.backgroundColor = "#fafafa";
                document.body.style.color = "#09090b";
              }
            } catch (e) {}
          })();
        `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen antialiased relative text-zinc-900 dark:text-zinc-300 transition-colors duration-300"
      >
        <PageLoader />

        {/* Background elements mirroring apps/web */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="bg-grid absolute inset-0 text-slate-900/[0.025] dark:text-white/[0.012] transition-colors duration-300"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.035)_0%,transparent_70%)] blur-[100px] transition-all duration-300"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(99,102,241,0.025)_0%,transparent_70%)] blur-[120px] transition-all duration-300"></div>
        </div>

        <div className="relative z-10 w-full min-h-screen flex flex-col">
          <AOSProvider>
            <ModeProvider>
              <LabShell>{children}</LabShell>
            </ModeProvider>
          </AOSProvider>
        </div>
      </body>
    </html>
  );
}

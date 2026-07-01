import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#030303] text-zinc-900 dark:text-white flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300">
      {/* Sleek Grid Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-grid absolute inset-0 text-zinc-900/[0.025] dark:text-white/[0.012] transition-colors duration-550"></div>
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-zinc-100/50 dark:from-[#0a0a0f] via-transparent to-transparent pointer-events-none opacity-80"></div>
      </div>

      <MarketingHeader />
      <div className="flex-grow flex flex-col relative z-10">{children}</div>
      <MarketingFooter />
    </div>
  );
}

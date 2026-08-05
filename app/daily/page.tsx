import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { DailyHero } from "@/components/daily/DailyHero";
import { DailyExplorer } from "@/components/daily/DailyExplorer";

export default function DailyPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <DailyHero />
          <DailyExplorer />
        </div>
      </main>
      <Footer />
    </>
  );
}

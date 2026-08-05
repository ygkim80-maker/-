import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { PreferencesCard } from "@/components/profile/PreferencesCard";
import { ApplicationsList } from "@/components/profile/ApplicationsList";
import { jobs, mySavedJobIds } from "@/lib/mock-data";

export default function ProfilePage() {
  const savedJobs = jobs.filter((job) => mySavedJobIds.includes(job.id));

  return (
    <>
      <NavBar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              마이페이지
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              프로필과 지원 현황을 관리하세요.
            </p>
          </div>

          <ProfileHeader />
          <ProfileStats />
          <PreferencesCard />

          <section>
            <h2 className="text-lg font-bold text-foreground">지원 현황</h2>
            <div className="mt-4">
              <ApplicationsList />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">저장한 공고</h2>
            {savedJobs.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {savedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">
                저장한 공고가 없어요.
              </p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

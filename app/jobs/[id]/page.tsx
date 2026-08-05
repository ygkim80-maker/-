import { notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { JobDetail } from "@/components/jobs/JobDetail";
import { getJobById, jobs } from "@/lib/mock-data";

export default async function JobDetailPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    notFound();
  }

  const relatedJobs = jobs
    .filter((j) => j.id !== job.id && j.category === job.category)
    .slice(0, 3);

  return (
    <>
      <NavBar />
      <main className="flex-1 bg-background">
        <JobDetail job={job} relatedJobs={relatedJobs} />
      </main>
      <Footer />
    </>
  );
}

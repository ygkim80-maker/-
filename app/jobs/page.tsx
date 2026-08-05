import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { JobsExplorer } from "@/components/jobs/JobsExplorer";

export default async function JobsPage({
  searchParams,
}: PageProps<"/jobs">) {
  const params = await searchParams;
  const district =
    typeof params.district === "string" ? params.district : undefined;
  const category =
    typeof params.category === "string" ? params.category : undefined;

  return (
    <>
      <NavBar />
      <main className="flex-1 bg-background">
        <JobsExplorer initialDistrict={district} initialCategory={category} />
      </main>
      <Footer />
    </>
  );
}

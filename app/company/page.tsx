import { DashboardShell } from "@/components/company/DashboardShell";
import { OverviewStats } from "@/components/company/OverviewStats";
import { JobsManageTable } from "@/components/company/JobsManageTable";
import { ApplicantsTable } from "@/components/company/ApplicantsTable";

export default function CompanyDashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-10">
        <section id="overview" className="scroll-mt-20">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            대시보드
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            그린박스물류의 채용 현황을 한눈에 확인하세요.
          </p>
          <div className="mt-6">
            <OverviewStats />
          </div>
        </section>

        <section id="jobs" className="scroll-mt-20">
          <h2 className="text-lg font-bold text-foreground">공고 관리</h2>
          <p className="mt-1 text-sm text-muted">
            등록한 공고를 확인하고 새 공고를 등록하세요.
          </p>
          <div className="mt-4">
            <JobsManageTable />
          </div>
        </section>

        <section id="applicants" className="scroll-mt-20">
          <h2 className="text-lg font-bold text-foreground">지원자 관리</h2>
          <p className="mt-1 text-sm text-muted">
            지원자 상태를 확인하고 전형 결과를 업데이트하세요.
          </p>
          <div className="mt-4">
            <ApplicantsTable />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

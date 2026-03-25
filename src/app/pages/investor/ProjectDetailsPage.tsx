import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Users,
  FileText,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskScoreMeter } from "@/app/components/RiskScoreMeter";
import { VerifiedBadge } from "@/app/components/VerifiedBadge";
import { MilestoneStepper } from "@/app/components/MilestoneStepper";
import { EscrowVisualization } from "@/app/components/EscrowVisualization";
import { ROICalculator } from "@/app/components/ROICalculator";
import { InvestmentModal } from "@/app/components/InvestmentModal";
import RealMap from "@/app/components/RealMap";
import { ProjectUpdatesSection } from "@/app/components/ProjectUpdatesSection";
import { RewardBenefitsCard } from "@/app/components/RewardBenefitsCard";
import { DocumentCard } from "@/app/components/DocumentCard";
import { apiGet } from "@/app/services/api";
import { formatDateTime } from "@/utils/dateFormatter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProjectDetailsPageProps {
  projectId: string;
  onNavigate: (page: string) => void;
}

type ProjectDTO = {
  id: number;
  title: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  funding_target: number;
  funding_raised: number;
  token_price: number;
  roi_percent: number;
  tenure_months: number;
  risk_level: string;
  risk_score: number;
  status: string;
};

type MilestoneDTO = {
  id: number;
  title: string;
  escrow_release_percent: number;
  status: "PENDING" | "SUBMITTED" | "COMPLETED";
  proof_url?: string | null;
};

type DocumentDTO = {
  id: number;
  doc_type: string;
  filename: string;
  file_url: string;
  uploaded_at: string;
};

export function ProjectDetailsPage({ projectId, onNavigate }: ProjectDetailsPageProps) {
  const [showInvestModal, setShowInvestModal] = useState(false);

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [escrow, setEscrow] = useState<{ locked: number; released: number }>({
    locked: 0,
    released: 0,
  });
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [tokenValue, setTokenValue] = useState({ base_price: 0, current_value: 0 });
  const [projectRewards, setProjectRewards] = useState<any[]>([]);
  const [totalRewardPoints, setTotalRewardPoints] = useState(0);

  const pid = Number(projectId.replace("project-", ""));

  const loadAll = async () => {
    try {
      const pData = await apiGet(`/projects/${pid}`);
      setProject(pData && pData.id ? pData : null);

      const mData = await apiGet(`/projects/${pid}/milestones`);
      setMilestones(Array.isArray(mData) ? mData : []);

      const eData = await apiGet(`/projects/${pid}/transparency`);
      setEscrow({
        locked: Number(eData?.locked || 0),
        released: Number(eData?.released || 0),
      });

      const docsData = await apiGet(`/projects/${pid}/documents`);
      setDocuments(Array.isArray(docsData) ? docsData : []);

      const tvData = await apiGet(`/projects/${pid}/token-value`);
      setTokenValue({
        base_price: Number(tvData?.base_price || 0),
        current_value: Number(tvData?.current_value || 0),
      });

      const token = localStorage.getItem("token") || "";
      if (token) {
        const rewardsData = await apiGet("/investor/rewards", token);
        const allRewards = Array.isArray(rewardsData?.rewards) ? rewardsData.rewards : [];
        const onlyProjectRewards = allRewards.filter((r: any) => Number(r.project_id) === pid);
        setProjectRewards(onlyProjectRewards);
        setTotalRewardPoints(Number(rewardsData?.total_points || 0));
      }
    } catch {
      setProject(null);
      setMilestones([]);
      setEscrow({ locked: 0, released: 0 });
      setDocuments([]);
      setTokenValue({ base_price: 0, current_value: 0 });
      setProjectRewards([]);
      setTotalRewardPoints(0);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(pid)) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <Button onClick={() => onNavigate("marketplace")}>Back to Marketplace</Button>
      </div>
    );
  }

  const fundingProgress =
    project.funding_target > 0 ? (project.funding_raised / project.funding_target) * 100 : 0;

  const totalEscrow = escrow.locked + escrow.released;
  const releasedEscrow = escrow.released;
  const lockedEscrow = escrow.locked;
  const remainingEscrow = Math.max(0, Number(project.funding_raised || 0) - releasedEscrow);
  const riskBadge =
    Number(project.risk_score || 0) <= 33
      ? { label: "Low", className: "bg-emerald-100 text-emerald-700" }
      : Number(project.risk_score || 0) <= 66
      ? { label: "Medium", className: "bg-amber-100 text-amber-700" }
      : { label: "High", className: "bg-red-100 text-red-700" };
  const uiProject = {
    id: String(project.id),
    name: project.title,
    location: project.location,
    category: project.category,
    description: project.description,
    latitude: project.latitude,
    longitude: project.longitude,
    issuerName: "Verified PPP/Gov Project Developer",
    issuerVerified: true,
    fundingRaised: project.funding_raised,
    fundingTarget: project.funding_target,
    tokenPrice: project.token_price,
    roi: project.roi_percent,
    tenure: Math.max(1, Math.round(project.tenure_months / 12)),
    riskScore: project.risk_score,
    milestones: milestones.map((m) => ({
      id: String(m.id),
      name: m.title,
      date: "",
      status: m.status === "COMPLETED" ? "completed" : m.status === "SUBMITTED" ? "submitted" : "pending",
      escrowRelease: m.escrow_release_percent,
    })),
  };

  const tokenValueChartData = [
    { name: "Initial", value: Number(tokenValue.base_price || uiProject.tokenPrice) },
    { name: "Current", value: Number(tokenValue.current_value || uiProject.tokenPrice) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => onNavigate("marketplace")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{uiProject.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{uiProject.location}</span>
              </div>
              <span>•</span>
              <span>{uiProject.category}</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                Live Investment Opportunity
              </span>
              {fundingProgress >= 70 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  High Demand Project
                </span>
              )}
            </div>
          </div>
          <Button size="lg" onClick={() => setShowInvestModal(true)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Invest Now
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#10b981]">{uiProject.roi}%</p>
            <p className="text-xs text-muted-foreground">ROI per annum</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{uiProject.tenure} years</p>
            <p className="text-xs text-muted-foreground">Tenure</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#0ea5e9]">₹{uiProject.tokenPrice}</p>
            <p className="text-xs text-muted-foreground">Token Price</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#8b5cf6]">{fundingProgress.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Invested</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#f59e0b]">
              {(uiProject.fundingRaised / uiProject.tokenPrice).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Investors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{uiProject.description}</p>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project Developer</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{uiProject.issuerName}</span>
                    {uiProject.issuerVerified && <VerifiedBadge size="sm" />}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Investors</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {(uiProject.fundingRaised / uiProject.tokenPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="pt-4 rounded-xl border p-4 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">Funding Progress</span>
                  <span className="font-semibold">{fundingProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, fundingProgress)}%` }}
                  />
                </div>
                <div className="mt-3 text-sm font-medium">
                  ₹{uiProject.fundingRaised.toLocaleString("en-IN")} raised out of ₹{uiProject.fundingTarget.toLocaleString("en-IN")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Value Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokenValueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `₹${Number(value).toFixed(2)}`} />
                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Initial Price</p>
                  <p className="font-semibold">₹{Number(tokenValue.base_price || uiProject.tokenPrice).toFixed(2)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Current Price</p>
                  <p className="font-semibold text-[#10b981]">₹{Number(tokenValue.current_value || uiProject.tokenPrice).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Location */}
          <Card>
            <CardHeader>
              <CardTitle>📍 Project Location</CardTitle>
              <p className="text-xs text-muted-foreground">
                Lat: {(uiProject.latitude ?? 20.5937).toFixed(4)} | Lng: {(uiProject.longitude ?? 78.9629).toFixed(4)}
              </p>
            </CardHeader>
            <CardContent>
              <RealMap
                lat={uiProject.latitude || 20.5937}
                lng={uiProject.longitude || 78.9629}
                title={uiProject.name}
              />
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneStepper milestones={uiProject.milestones as any} />
            </CardContent>
          </Card>

          {/* Escrow Visualization — Vault-styled standalone card */}
          <EscrowVisualization
            totalFunds={totalEscrow}
            lockedFunds={lockedEscrow}
            releasedFunds={releasedEscrow}
          />

          <Card>
            <CardHeader>
              <CardTitle>Escrow Transparency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 bg-blue-50/60">
                  <p className="text-xs text-muted-foreground">Locked Funds</p>
                  <p className="text-lg font-semibold">₹{lockedEscrow.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-lg border p-3 bg-emerald-50/60">
                  <p className="text-xs text-muted-foreground">Released Funds</p>
                  <p className="text-lg font-semibold">₹{releasedEscrow.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-lg border p-3 bg-amber-50/60">
                  <p className="text-xs text-muted-foreground">Remaining Funds</p>
                  <p className="text-lg font-semibold">₹{remainingEscrow.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Released</p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-emerald-500" style={{ width: `${totalEscrow > 0 ? (releasedEscrow / totalEscrow) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Locked</p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-blue-500" style={{ width: `${totalEscrow > 0 ? (lockedEscrow / totalEscrow) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents & Proofs ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded</p>
                ) : (
                  documents.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Updates Timeline */}
          <ProjectUpdatesSection projectId={pid} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk Score */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <p className="text-lg font-semibold">{uiProject.riskScore}/100</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${riskBadge.className}`}>
                  {riskBadge.label} Risk
                </span>
              </div>
              <RiskScoreMeter score={uiProject.riskScore} />
              <div className="pt-4 border-t space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <strong>Factors:</strong>
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>✓ Issuer verified and credible</li>
                  <li>✓ Clear milestone structure</li>
                  <li>✓ Government-backed project</li>
                  <li>⚠ Subject to regulatory changes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Reward Benefits */}
          <RewardBenefitsCard
            category={uiProject.category}
            projectName={uiProject.name}
          />

          <Card>
            <CardHeader>
              <CardTitle>My Rewards on This Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3 bg-primary/5">
                <p className="text-xs text-muted-foreground">Total Reward Points</p>
                <p className="text-xl font-bold">{totalRewardPoints.toLocaleString("en-IN")}</p>
              </div>
              {projectRewards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rewards unlocked yet for this investment opportunity.</p>
              ) : (
                projectRewards.slice(0, 3).map((reward) => (
                  <div key={reward.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{reward.reward_type?.replace(/_/g, " ") || "Benefit"}</p>
                    <p className="text-xs text-muted-foreground">{reward.description || "Reward benefit unlocked"}</p>
                    <p className="text-xs font-semibold text-[#10b981] mt-1">+{reward.reward_points || 0} points</p>
                    {reward.granted_at && (
                      <p className="text-[11px] text-muted-foreground mt-1">Granted: {formatDateTime(reward.granted_at)}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ROI Calculator */}
          <ROICalculator
            roiPercentage={uiProject.roi}
            tenure={uiProject.tenure}
            tokenPrice={uiProject.tokenPrice}
          />

          {/* Investment CTA */}
          <Card className="bg-primary text-white">
            <CardContent className="p-6 text-center space-y-4">
              <h3 className="text-xl font-bold">Ready to Invest?</h3>
              <p className="text-sm text-white/90">
                Start building infrastructure with as low as ₹{uiProject.tokenPrice}
              </p>
              <Button
                variant="outline"
                className="w-full bg-white text-primary hover:bg-white/90"
                size="lg"
                onClick={() => setShowInvestModal(true)}
              >
                Invest Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <InvestmentModal
          project={uiProject as any}
          onClose={() => setShowInvestModal(false)}
          onSuccess={async () => {
            setShowInvestModal(false);
            await loadAll(); // ✅ refresh project funding numbers
            onNavigate("investor-dashboard");
          }}
        />
      )}
    </div>
  );
}

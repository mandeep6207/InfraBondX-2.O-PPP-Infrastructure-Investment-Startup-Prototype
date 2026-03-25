import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Building2, Shield, Loader, Lock, Unlock, CheckCircle2, AlertTriangle, Landmark, ArrowRight, Send, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { DocumentCard } from "@/app/components/DocumentCard";
import { ProjectUpdatesSection } from "@/app/components/ProjectUpdatesSection";
import { EscrowTransactionModal } from "@/app/components/EscrowTransactionModal";
import RealMap from "@/app/components/RealMap";
import { apiGet } from "@/app/services/api";

interface AdminProjectPreviewPageProps {
  projectId: string; // e.g. "admin-project-preview-1"
  onNavigate: (page: string) => void;
}

type PreviewData = {
  project: {
    id: number;
    title: string;
    issuer_name: string;
    location: string;
    category: string;
    description: string;
    funding_target: number;
    funding_raised: number;
    token_price: number;
    roi_percent: number;
    tenure_months: number;
    status: string;
    risk_score: number;
    risk_level: string;
    latitude: number;
    longitude: number;
  };
  issuer_stats: {
    completed_projects_count: number;
    total_projects_count: number;
    total_funds_raised: number;
    total_revenue: number;
    trust_score: number;
  };
  escrow: {
    total_locked: number;
    total_released: number;
  };
  milestones: {
    id: number;
    title: string;
    description: string;
    required_amount: number;
    escrow_release_percent: number;
    status: string;
    proof_url: string;
  }[];
  documents: {
    id: number;
    doc_type: string;
    filename: string;
    file_url: string;
    uploaded_at: string;
  }[];
};

export function AdminProjectPreviewPage({ projectId, onNavigate }: AdminProjectPreviewPageProps) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [releaseConfirm, setReleaseConfirm] = useState<number | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [txModal, setTxModal] = useState<{ open: boolean; milestoneId: number; milestoneTitle: string; amount: number } | null>(null);
  const [manualAmount, setManualAmount] = useState("");
  const [manualTxModal, setManualTxModal] = useState<{ open: boolean; amount: number } | null>(null);

  const pid = Number(projectId.replace("admin-project-preview-", ""));

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const res = await apiGet(`/admin/projects/${pid}/preview`, token);
        if (res && !res.error) {
          setData(res);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(pid)) load();
  }, [pid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Project Preview Not Found</h2>
        <Button onClick={() => onNavigate("approve-projects")}>Back to Approvals</Button>
      </div>
    );
  }

  const { project, issuer_stats, documents, escrow, milestones } = data;

  const handleReleaseFunds = async (milestoneId: number) => {
    setReleasing(true);
    setReleaseError(null);
    setReleaseSuccess(null);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:5000/api/admin/milestones/${milestoneId}/release`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (res.ok) {
        setReleaseSuccess(`₹${Number(json.release_amount).toLocaleString("en-IN")} released successfully!`);
        // Reload data
        const updated = await apiGet(`/admin/projects/${pid}/preview`, token);
        if (updated && !updated.error) setData(updated);
      } else {
        setReleaseError(json.error || "Release failed");
      }
    } catch {
      setReleaseError("Network error");
    } finally {
      setReleasing(false);
      setReleaseConfirm(null);
      setTimeout(() => { setReleaseSuccess(null); setReleaseError(null); }, 5000);
    }
  };

  const handleManualRelease = async (amount: number) => {
    setReleasing(true);
    setReleaseError(null);
    setReleaseSuccess(null);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:5000/api/admin/projects/${pid}/escrow-release`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const json = await res.json();
      if (res.ok) {
        setReleaseSuccess(`₹${Number(json.release_amount).toLocaleString("en-IN")} released to ${json.issuer_name}!`);
        setManualAmount("");
        const updated = await apiGet(`/admin/projects/${pid}/preview`, token);
        if (updated && !updated.error) setData(updated);
      } else {
        throw new Error(json.error || "Release failed");
      }
    } catch (e: any) {
      setReleaseError(e?.message || "Network error");
      throw e;
    } finally {
      setReleasing(false);
      setTimeout(() => { setReleaseSuccess(null); setReleaseError(null); }, 5000);
    }
  };

  // Auto-calculate civic reward based on category
  let rewardText = "Standard Civic Benefits";
  if (project.category === "Highway" || project.category === "Bridge" || project.category === "Road") rewardText = "Toll Discounts";
  else if (project.category === "Metro" || project.category === "Railway" || project.category === "Transport") rewardText = "Travel Credits";
  else if (project.category === "Hospital" || project.category === "Health") rewardText = "Health Subsidy";
  else if (project.category === "Mall" || project.category === "Commercial") rewardText = "Shopping Discounts";

  // renderDocument removed — using DocumentCard component

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Button variant="ghost" onClick={() => onNavigate("approve-projects")} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Approvals
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.location}</span>
            <span>•</span>
            <span className="capitalize">{project.category}</span>
            <span>•</span>
            <span className="font-medium text-foreground">Issuer: {project.issuer_name}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Project Value</p>
          <p className="text-2xl font-bold text-primary">₹{project.funding_target.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📍 Project Location</CardTitle>
          <p className="text-xs text-muted-foreground">
            Lat: {(project.latitude ?? 20.5937).toFixed(4)} | Lng: {(project.longitude ?? 78.9629).toFixed(4)}
          </p>
        </CardHeader>
        <CardContent>
          <RealMap
            lat={project.latitude || 20.5937}
            lng={project.longitude || 78.9629}
            title={project.title}
          />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Issuer Profile & Trust History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Completed Projects</p>
                <p className="text-xl font-bold">{issuer_stats.completed_projects_count}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Trust Score</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  <Shield className="w-4 h-4 text-[#10b981]" /> {issuer_stats.trust_score}/100
                </p>
              </div>
            </div>
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previous Work History</span>
                <span className="font-medium">{issuer_stats.total_projects_count} total projects listed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Funds Raised (Platform)</span>
                <span className="font-medium">₹{issuer_stats.total_funds_raised.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue Generated</span>
                <span className="font-medium text-[#10b981]">₹{issuer_stats.total_revenue.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{project.description || "No description provided."}</p>
            <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Current Status</p>
                <p className="font-medium">{project.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Risk Level</p>
                <p className="font-medium">{project.risk_level}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Project Timeline</p>
                <p className="font-medium">{project.tenure_months} Months</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Expected Revenue (ROI)</p>
                <p className="font-medium">{project.roi_percent}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Civic Reward</p>
                <p className="font-medium text-[#f59e0b] truncate">{rewardText}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escrow Control Panel — Vault Style */}
      <div className="rounded-2xl border-2 border-sky-200/60 dark:border-sky-800/40 bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-50 dark:from-slate-900 dark:via-sky-950/20 dark:to-slate-900 shadow-lg shadow-sky-100/30 dark:shadow-sky-900/10 overflow-hidden">
        {/* Vault Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 px-6 py-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1 left-3 w-6 h-6 border border-white/20 rounded-full" />
            <div className="absolute bottom-1 right-6 w-10 h-10 border border-white/20 rounded-full" />
            <div className="absolute top-3 right-20 w-5 h-5 border border-white/10 rounded" />
          </div>
          <div className="flex items-center gap-3 relative">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">ESCROW CONTROL PANEL</h3>
              <p className="text-[10px] text-sky-300/80 font-mono tracking-widest">ADMIN • FUND RELEASE GATEWAY</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-300">ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Escrow Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-[0.06]"><Lock className="w-16 h-16" /></div>
              <div className="flex items-center gap-2 mb-1 relative">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Locked in Escrow</span>
              </div>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300 relative">₹{escrow.total_locked.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-blue-500 dark:text-blue-400/70 relative mt-0.5">
                {project.funding_raised ? ((escrow.total_locked / project.funding_raised) * 100).toFixed(1) : 0}% of raised
              </p>
            </div>
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/30 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-[0.06]"><Unlock className="w-16 h-16" /></div>
              <div className="flex items-center gap-2 mb-1 relative">
                <Unlock className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Released to Issuer</span>
              </div>
              <p className="text-xl font-bold text-green-700 dark:text-green-300 relative">₹{escrow.total_released.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-green-500 dark:text-green-400/70 relative mt-0.5">
                {project.funding_raised ? ((escrow.total_released / project.funding_raised) * 100).toFixed(1) : 0}% of raised
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-[0.06]"><Landmark className="w-16 h-16" /></div>
              <div className="flex items-center gap-2 mb-1 relative">
                <Landmark className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Funds Raised</span>
              </div>
              <p className="text-xl font-bold text-slate-700 dark:text-slate-300 relative">₹{project.funding_raised.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400/70 relative mt-0.5">100%</p>
            </div>
          </div>

          {/* Escrow Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-foreground">Escrow Fund Distribution</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {project.funding_raised ? ((escrow.total_released / project.funding_raised) * 100).toFixed(1) : 0}% released
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden flex shadow-inner">
              {escrow.total_released > 0 && (
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-semibold transition-all duration-500"
                  style={{ width: `${project.funding_raised ? (escrow.total_released / project.funding_raised * 100) : 0}%` }}
                >
                  {project.funding_raised && (escrow.total_released / project.funding_raised * 100) > 8 && `${(escrow.total_released / project.funding_raised * 100).toFixed(0)}%`}
                </div>
              )}
              {escrow.total_locked > 0 && (
                <div
                  className="bg-gradient-to-r from-blue-500 to-sky-500 flex items-center justify-center text-white text-[10px] font-semibold transition-all duration-500"
                  style={{ width: `${project.funding_raised ? (escrow.total_locked / project.funding_raised * 100) : 0}%` }}
                >
                  {project.funding_raised && (escrow.total_locked / project.funding_raised * 100) > 8 && `${(escrow.total_locked / project.funding_raised * 100).toFixed(0)}%`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" /> Released</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-500" /> Locked</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" /> Remaining</span>
            </div>
          </div>

          {/* ═══ ESCROW FUND TRANSFER — Manual Release Panel ═══ */}
          <div className="rounded-xl border-2 border-dashed border-sky-300/60 dark:border-sky-700/40 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/50 dark:from-sky-950/20 dark:via-card dark:to-blue-950/20 p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
                <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Escrow Fund Transfer</h4>
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider">MANUAL RELEASE TO ISSUER</p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Enter Amount to Release</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  placeholder="e.g. 500000"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="pl-9 text-lg font-semibold h-12 border-sky-200 dark:border-sky-800 focus-visible:ring-sky-500"
                  min={1}
                  max={escrow.total_locked}
                />
              </div>
              {manualAmount && Number(manualAmount) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Amount: <span className="font-semibold text-foreground">₹{Number(manualAmount).toLocaleString("en-IN")}</span>
                  {escrow.total_locked > 0 && (
                    <> — {((Number(manualAmount) / escrow.total_locked) * 100).toFixed(1)}% of locked funds</>
                  )}
                </p>
              )}
            </div>

            {/* Quick Percentage Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">Quick select by percentage of locked funds</label>
              <div className="flex gap-2">
                {[10, 20, 30, 40, 50].map((pct) => {
                  const amt = Math.round(escrow.total_locked * (pct / 100));
                  const isActive = manualAmount === String(amt);
                  return (
                    <button
                      key={pct}
                      onClick={() => setManualAmount(String(amt))}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold border-2 transition-all duration-200 ${
                        isActive
                          ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20"
                          : "bg-card border-border hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 text-foreground"
                      }`}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Send Funds Button */}
            <Button
              size="lg"
              disabled={!manualAmount || Number(manualAmount) <= 0 || Number(manualAmount) > escrow.total_locked}
              onClick={() => {
                const amt = Number(manualAmount);
                if (amt > 0 && amt <= escrow.total_locked) {
                  setManualTxModal({ open: true, amount: amt });
                }
              }}
              className="w-full h-13 text-base gap-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 font-bold tracking-wide"
            >
              <Send className="w-5 h-5" />
              Send Funds to Issuer
            </Button>

            {Number(manualAmount) > escrow.total_locked && escrow.total_locked > 0 && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center">
                Amount exceeds locked escrow balance (₹{escrow.total_locked.toLocaleString("en-IN")})
              </p>
            )}
          </div>

          {/* Success / Error Messages */}
          {releaseSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{releaseSuccess}</span>
            </div>
          )}
          {releaseError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">{releaseError}</span>
            </div>
          )}

          {/* Milestone Release Controls */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary" />
              Milestone Release Controls
            </h3>
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No milestones defined.</p>
            ) : (
              <div className="space-y-2">
                {milestones.map((m) => {
                  const releaseAmount = project.funding_raised * (m.escrow_release_percent / 100);
                  const canRelease = m.status === "SUBMITTED";
                  const isCompleted = m.status === "COMPLETED";
                  return (
                    <div key={m.id} className={`border rounded-xl p-4 transition-all ${isCompleted ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30" : canRelease ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30" : "bg-card"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{m.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isCompleted ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                              canRelease ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" :
                              "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Releases {m.escrow_release_percent}% — ₹{releaseAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Released</span>
                          </div>
                        ) : canRelease ? (
                          <Button
                            size="sm"
                            onClick={() => setTxModal({ open: true, milestoneId: m.id, milestoneTitle: m.title, amount: releaseAmount })}
                            className="text-xs gap-1.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Release & Send to Issuer
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending proof</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Escrow Transaction Modal — Milestone based */}
      {txModal && (
        <EscrowTransactionModal
          open={txModal.open}
          milestoneTitle={txModal.milestoneTitle}
          releaseAmount={txModal.amount}
          issuerName={project.issuer_name}
          onConfirm={async () => {
            await handleReleaseFunds(txModal.milestoneId);
          }}
          onClose={() => setTxModal(null)}
        />
      )}

      {/* Escrow Transaction Modal — Manual transfer */}
      {manualTxModal && (
        <EscrowTransactionModal
          open={manualTxModal.open}
          milestoneTitle="Manual Escrow Fund Transfer"
          releaseAmount={manualTxModal.amount}
          issuerName={project.issuer_name}
          onConfirm={async () => {
            await handleManualRelease(manualTxModal.amount);
          }}
          onClose={() => setManualTxModal(null)}
        />
      )}

      <div className="space-y-4 pt-6">
        <h2 className="text-2xl font-bold">Uploaded Documents ({documents.length})</h2>
        <p className="text-muted-foreground">Review all submitted verification and milestone proofs below.</p>
        
        {documents.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No documents uploaded yet for this project.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>

      {/* Construction Progress Updates */}
      <ProjectUpdatesSection projectId={pid} />
    </div>
  );
}

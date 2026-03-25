import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle, XCircle, Shield, AlertTriangle,
  ExternalLink, Loader, DollarSign, FileText, Lock, Unlock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/app/components/ui/dialog";
import {
  adminGetProjects, adminGetProjectDetails,
  adminUpdateProjectStatus, adminReleaseMilestoneFunds,
  adminGetProjectDocuments, adminRefundProject,
} from "@/app/services/admin";
import { sendProjectApprovedEmail } from "@/utils/emailService";
import { formatDateTime } from "@/utils/dateFormatter";
import { toast } from "sonner";

type AdminProjectDTO = {
  id: number;
  title: string;
  location: string;
  category: string;
  funding_target: number;
  funding_raised: number;
  roi_percent: number;
  tenure_months: number;
  risk_score: number;
  risk_level: string;
  status: string;
  issuer_id: number;
};

type ProjectDetailDTO = {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  funding_target: number;
  funding_raised: number;
  roi_percent: number;
  tenure_months: number;
  token_price: number;
  risk_score: number;
  risk_level: string;
  status: string;
  issuer_id: number;
};

type MilestoneDTO = {
  id: number;
  title: string;
  escrow_release_percent: number;
  status: string; // PENDING / SUBMITTED / COMPLETED
  proof_url?: string;
  approved_at?: string;
};

type DocumentDTO = {
  id: number;
  doc_type: string;
  filename: string;
  file_url: string;
  description?: string;
  uploaded_at: string;
};

type EscrowDTO = {
  total_locked: number;
  total_released: number;
};

interface ApproveProjectsPageProps {
  onNavigate?: (page: string) => void;
}

export function ApproveProjectsPage({ onNavigate }: ApproveProjectsPageProps) {
  const [projects, setProjects] = useState<AdminProjectDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetailDTO | null>(null);
  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [escrow, setEscrow] = useState<EscrowDTO>({ total_locked: 0, total_released: 0 });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [releasingMilestone, setReleasingMilestone] = useState<number | null>(null);
  const [refunding, setRefunding] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await adminGetProjects();
      if (res?.error) { setProjects([]); return; }
      setProjects(Array.isArray(res) ? res : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: number) => {
    try {
      setDetailsLoading(true);
      const [detailRes, docRes] = await Promise.all([
        adminGetProjectDetails(projectId),
        adminGetProjectDocuments(projectId),
      ]);

      if (detailRes?.error) { alert("Failed to load details: " + detailRes.error); return; }

      setProjectDetails(detailRes.project || null);
      setMilestones(detailRes.milestones || []);
      setEscrow(detailRes.escrow || { total_locked: 0, total_released: 0 });
      setDocuments(Array.isArray(docRes) ? docRes : []);
    } catch (err: any) {
      alert("Error loading project: " + err?.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReviewClick = (projectId: number) => {
    if (onNavigate) {
      onNavigate(`admin-project-preview-${projectId}`);
    } else {
      setSelectedProjectId(projectId);
      fetchProjectDetails(projectId);
    }
  };

  const closeModal = () => {
    setSelectedProjectId(null);
    setProjectDetails(null);
    setMilestones([]);
    setDocuments([]);
    setEscrow({ total_locked: 0, total_released: 0 });
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (projectId: number, status: "ACTIVE" | "FROZEN" | "PENDING" | "COMPLETED" | "FAILED") => {
    try {
      setStatusUpdating(true);
      const res = await adminUpdateProjectStatus(projectId, status);
      if (res?.error) { alert(res.error); return; }

      if (status === "ACTIVE") {
        const projectRef =
          projects.find((p) => p.id === projectId) ||
          (projectDetails && projectDetails.id === projectId ? projectDetails : null);

        const mockInvestors = [
          { user_name: "Aarav Sharma", to_email: "aarav.demo@infrabondx.com" },
          { user_name: "Priya Mehta", to_email: "priya.demo@infrabondx.com" },
          { user_name: "Rahul Verma", to_email: "rahul.demo@infrabondx.com" },
        ];

        let successCount = 0;
        for (const investor of mockInvestors) {
          const emailResult = await sendProjectApprovedEmail({
            user_name: investor.user_name,
            project_name: projectRef?.title || "InfraBondX Opportunity",
            location: projectRef?.location || "India",
            roi: projectRef?.roi_percent || 0,
            min_invest: (projectRef as any)?.token_price || 100,
            to_email: investor.to_email,
          });
          if (emailResult.success) successCount += 1;
        }

        toast.success("Project approved", {
          description: `Email notifications sent: ${successCount}/${mockInvestors.length}`,
        });
      }

      alert(`Project status updated to ${status}`);
      closeModal();
      fetchProjects();
    } catch (err: any) {
      alert("Failed: " + err?.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReleaseFunds = async (milestoneId: number) => {
    if (!window.confirm("Release escrow funds for this milestone? This cannot be undone.")) return;
    try {
      setReleasingMilestone(milestoneId);
      const res = await adminReleaseMilestoneFunds(milestoneId);
      if (res?.error) { alert(res.error); return; }
      alert(
        `✅ Released ₹${res.release_amount?.toLocaleString("en-IN")} to issuer.\n` +
        `TX: ${res.tx_hash}`
      );
      if (selectedProjectId) fetchProjectDetails(selectedProjectId);
      fetchProjects();
    } catch (err: any) {
      alert("Release failed: " + err?.message);
    } finally {
      setReleasingMilestone(null);
    }
  };

  const handleRefund = async (projectId: number) => {
    if (!window.confirm("REFUND all investors and mark project FAILED? This cannot be undone.")) return;
    try {
      setRefunding(true);
      const res = await adminRefundProject(projectId);
      if (res?.error) { alert(res.error); return; }
      alert(`✅ Refunded ${res.investor_count} investors. Total: ₹${res.total_refunded}`);
      closeModal();
      fetchProjects();
    } catch (err: any) {
      alert("Refund failed: " + err?.message);
    } finally {
      setRefunding(false);
    }
  };

  const formatCr = (amount: number) => {
    const cr = amount / 10000000;
    if (cr >= 1) return `₹${cr.toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const normalizedProjects = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      status: String(p.status || "").toUpperCase(),
    }));
  }, [projects]);

  const statusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "ACTIVE")    return <span className="text-xs px-2 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center gap-1"><Shield className="w-3 h-3" /> ACTIVE</span>;
    if (s === "FROZEN")    return <span className="text-xs px-2 py-1 rounded-full bg-[#dc2626]/10 text-[#dc2626] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> FROZEN</span>;
    if (s === "PENDING")   return <span className="text-xs px-2 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] flex items-center gap-1"><Loader className="w-3 h-3" /> PENDING</span>;
    if (s === "COMPLETED") return <span className="text-xs px-2 py-1 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> COMPLETED</span>;
    if (s === "FAILED")    return <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> FAILED</span>;
    return <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">{s}</span>;
  };

  const milestoneBadge = (status: string) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "COMPLETED")  return <span className="text-xs px-2 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]">✅ COMPLETED</span>;
    if (s === "SUBMITTED") return <span className="text-xs px-2 py-1 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">📤 SUBMITTED</span>;
    return <span className="text-xs px-2 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b]">⏳ PENDING</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Approvals & Escrow</h1>
        <p className="text-muted-foreground">
          Approve projects, review milestone proofs, release escrow funds, and monitor refunds.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>All Projects</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground p-6">Loading projects...</div>
          ) : normalizedProjects.length === 0 ? (
            <div className="text-muted-foreground p-6">No projects found.</div>
          ) : (
            <div className="space-y-4">
              {normalizedProjects.map((p) => {
                const progress = p.funding_target > 0
                  ? Math.round((p.funding_raised / p.funding_target) * 100) : 0;
                return (
                  <div key={p.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{p.title}</h3>
                        <p className="text-sm text-muted-foreground">{p.location} • {p.category}</p>
                      </div>
                      <div className="flex items-center gap-2">{statusBadge(p.status)}</div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Target</p><p className="font-medium">{formatCr(p.funding_target)}</p></div>
                      <div><p className="text-muted-foreground">Raised</p><p className="font-medium">{formatCr(p.funding_raised)}</p></div>
                      <div><p className="text-muted-foreground">Funded</p><p className="font-medium text-[#10b981]">{progress}%</p></div>
                      <div><p className="text-muted-foreground">Risk</p><p className="font-medium">{p.risk_score}/100 ({p.risk_level})</p></div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleReviewClick(p.id)}>
                        Review
                      </Button>
                      {p.status !== "ACTIVE" && p.status !== "COMPLETED" && p.status !== "FAILED" && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateStatus(p.id, "ACTIVE")}
                          className="border-[#10b981] text-[#10b981]">
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      )}
                      {p.status === "ACTIVE" && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateStatus(p.id, "FROZEN")}
                          className="border-[#dc2626] text-[#dc2626]">
                          <XCircle className="w-4 h-4 mr-1" /> Freeze
                        </Button>
                      )}
                      {p.status === "FROZEN" && (
                        <Button size="sm" variant="outline"
                          onClick={() => handleRefund(p.id)}
                          disabled={refunding}
                          className="border-[#f59e0b] text-[#f59e0b]">
                          Refund Investors
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      <Dialog open={selectedProjectId !== null} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : projectDetails ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {projectDetails.title}
                  {statusBadge(projectDetails.status)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Project Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Overview</h3>
                  <p className="text-sm text-muted-foreground">{projectDetails.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Location</p><p className="font-medium">{projectDetails.location}</p></div>
                    <div><p className="text-muted-foreground">Category</p><p className="font-medium capitalize">{projectDetails.category}</p></div>
                    <div><p className="text-muted-foreground">Funding Target</p><p className="font-medium">₹{projectDetails.funding_target.toLocaleString("en-IN")}</p></div>
                    <div><p className="text-muted-foreground">Funding Raised</p><p className="font-medium">₹{projectDetails.funding_raised.toLocaleString("en-IN")}</p></div>
                    <div><p className="text-muted-foreground">ROI</p><p className="font-medium">{projectDetails.roi_percent}% p.a.</p></div>
                    <div><p className="text-muted-foreground">Token Price</p><p className="font-medium">₹{projectDetails.token_price}</p></div>
                    <div><p className="text-muted-foreground">Risk Score</p><p className="font-medium">{projectDetails.risk_score}/100 ({projectDetails.risk_level})</p></div>
                  </div>
                </div>

                {/* Escrow Transparency — 4 key metrics */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Escrow Dashboard</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#f59e0b]/10 rounded-lg text-center">
                      <DollarSign className="w-5 h-5 text-[#f59e0b] mx-auto mb-1" />
                      <p className="text-lg font-bold text-[#f59e0b]">
                        ₹{projectDetails.funding_raised.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Raised</p>
                    </div>
                    <div className="p-3 bg-[#0ea5e9]/10 rounded-lg text-center">
                      <Lock className="w-5 h-5 text-[#0ea5e9] mx-auto mb-1" />
                      <p className="text-lg font-bold text-[#0ea5e9]">
                        ₹{escrow.total_locked.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Locked</p>
                    </div>
                    <div className="p-3 bg-[#10b981]/10 rounded-lg text-center">
                      <Unlock className="w-5 h-5 text-[#10b981] mx-auto mb-1" />
                      <p className="text-lg font-bold text-[#10b981]">
                        ₹{escrow.total_released.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Released</p>
                    </div>
                    {(() => {
                      const nextMs = milestones.find(m => m.status === "PENDING" || m.status === "SUBMITTED");
                      const nextAmount = nextMs ? Math.round((nextMs.escrow_release_percent / 100) * projectDetails.funding_raised) : 0;
                      return (
                        <div className="p-3 bg-[#8b5cf6]/10 rounded-lg text-center">
                          <DollarSign className="w-5 h-5 text-[#8b5cf6] mx-auto mb-1" />
                          <p className="text-lg font-bold text-[#8b5cf6]">
                            {nextAmount > 0 ? `₹${nextAmount.toLocaleString("en-IN")}` : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">Next Release</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Milestones with Release Funds */}
                {milestones.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Milestones & Escrow Release</h3>
                    <div className="space-y-3">
                      {milestones.map((m) => {
                        const releaseAmount = Math.round(
                          (m.escrow_release_percent / 100) * projectDetails.funding_raised
                        );
                        const isReleasing = releasingMilestone === m.id;
                        return (
                          <div key={m.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{m.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Release: {m.escrow_release_percent}% = ₹{releaseAmount.toLocaleString("en-IN")}
                                </p>
                              </div>
                              {milestoneBadge(m.status)}
                            </div>

                            {m.proof_url && (
                              <button
                                onClick={() => window.open(`http://localhost:5000${m.proof_url}`, "_blank")}
                                className="inline-flex items-center gap-1 text-xs text-[#0ea5e9] hover:underline mb-2"
                              >
                                <ExternalLink className="w-3 h-3" /> View Proof Document
                              </button>
                            )}

                            {m.approved_at && (
                              <p className="text-xs text-muted-foreground mb-2">
                                Completed: {formatDateTime(m.approved_at)}
                              </p>
                            )}

                            {m.status === "SUBMITTED" && (
                              <Button
                                size="sm"
                                className="bg-[#10b981] hover:bg-[#10b981]/90 text-white w-full"
                                onClick={() => handleReleaseFunds(m.id)}
                                disabled={isReleasing}
                              >
                                {isReleasing ? (
                                  <><Loader className="w-4 h-4 mr-2 animate-spin" /> Releasing...</>
                                ) : (
                                  <><Unlock className="w-4 h-4 mr-2" /> Release ₹{releaseAmount.toLocaleString("en-IN")}</>
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {documents.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Issuer Documents ({documents.length})
                    </h3>
                    <div className="space-y-2">
                      {documents.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                          <div>
                            <p className="font-medium">{d.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {d.doc_type} • {formatDateTime(d.uploaded_at)}
                              {d.description ? ` • ${d.description}` : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => window.open(`http://localhost:5000${d.file_url}`, "_blank")}
                            className="text-xs text-[#0ea5e9] hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-wrap gap-2 pt-4 border-t">
                <Button variant="outline" onClick={closeModal}>Close</Button>
                {projectDetails.status !== "ACTIVE" && projectDetails.status !== "COMPLETED" && projectDetails.status !== "FAILED" && (
                  <Button
                    onClick={() => updateStatus(projectDetails.id, "ACTIVE")}
                    disabled={statusUpdating}
                    className="bg-[#10b981] hover:bg-[#10b981]/90"
                  >
                    {statusUpdating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Approve Project
                  </Button>
                )}
                {projectDetails.status === "ACTIVE" && (
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(projectDetails.id, "FROZEN")}
                    disabled={statusUpdating}
                    className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10"
                  >
                    {statusUpdating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Freeze
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">Failed to load project details</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

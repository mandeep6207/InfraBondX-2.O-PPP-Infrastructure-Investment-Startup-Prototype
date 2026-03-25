import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Users,
  Briefcase,
  DollarSign,
  Activity,
  BarChart3,
  ShieldCheck,
  Lock,
  Unlock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { apiGet } from "@/app/services/api";
import { adminGetRevenue, getPlatformStats } from "@/app/services/admin";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

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
  status: string;
};

type FraudAlertDTO = {
  type: string;
  project_id: number;
  project_title: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
};

type PlatformStatsDTO = {
  platform_health: string;
  active_projects: number;
  verified_developers: number;
  pending_approvals: number;
  fraud_alerts: number;
};

const FALLBACK_PLATFORM_STATS: PlatformStatsDTO = {
  platform_health: "Healthy",
  active_projects: 10,
  verified_developers: 5,
  pending_approvals: 2,
  fraud_alerts: 0,
};

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [projects, setProjects] = useState<AdminProjectDTO[]>([]);
  const [alerts, setAlerts] = useState<FraudAlertDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStatsDTO>(FALLBACK_PLATFORM_STATS);
  const [escrowTotals, setEscrowTotals] = useState({ locked: 0, released: 0 });
  const [revenueOverview, setRevenueOverview] = useState({
    total_fees_collected: 0,
    total_investments: 0,
    total_users: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // ✅ always read fresh token
        const token = localStorage.getItem("token") || "";
        if (!token) {
          setProjects([]);
          setAlerts([]);
          return;
        }

        // ✅ use helper (consistent auth + errors)
        const dataP = await apiGet("/admin/projects", token);
        if (dataP?.error) {
          setProjects([]);
          setAlerts([]);
          return;
        }

        const dataA = await apiGet("/admin/fraud-alerts", token);
        if (dataA?.error) {
          setAlerts([]);
        }

        const dataS = await getPlatformStats();
        if (dataS && !dataS.error) {
          setPlatformStats({
            platform_health: String(dataS.platform_health || "Healthy"),
            active_projects: Number(dataS.active_projects || FALLBACK_PLATFORM_STATS.active_projects),
            verified_developers: Number(
              dataS.verified_developers || FALLBACK_PLATFORM_STATS.verified_developers
            ),
            pending_approvals: Number(dataS.pending_approvals || FALLBACK_PLATFORM_STATS.pending_approvals),
            fraud_alerts: Number(dataS.fraud_alerts || FALLBACK_PLATFORM_STATS.fraud_alerts),
          });
        } else {
          setPlatformStats(FALLBACK_PLATFORM_STATS);
        }

        setProjects(Array.isArray(dataP) ? dataP : []);
        setAlerts(Array.isArray(dataA) ? dataA : []);

        const revData = await adminGetRevenue();
        if (revData && !revData.error) {
          setRevenueOverview({
            total_fees_collected: Number(revData.total_fees_collected || 0),
            total_investments: Number(revData.total_investments || 0),
            total_users: Number(revData.total_users || 0),
          });
        }

        // Compute escrow totals from projects (transparency endpoint per project)
        let totalLocked = 0;
        let totalReleased = 0;
        const projectList = Array.isArray(dataP) ? dataP : [];
        for (const p of projectList.slice(0, 20)) {
          try {
            const t = await apiGet(`/projects/${p.id}/transparency`, token);
            if (t && !t.error) {
              totalLocked += t.locked || 0;
              totalReleased += t.released || 0;
            }
          } catch {}
        }
        setEscrowTotals({ locked: totalLocked, released: totalReleased });
      } catch {
        setProjects([]);
        setAlerts([]);
        setPlatformStats(FALLBACK_PLATFORM_STATS);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeProjects = useMemo(() => {
    return projects.filter((p) => (p.status || "").toUpperCase() !== "FROZEN");
  }, [projects]);

  const totalFundingRaised = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.funding_raised || 0), 0);
  }, [projects]);

  const totalInvestors = useMemo(() => {
    return projects.reduce((sum, p) => {
      const tokenPrice = 100; // demo calc
      return sum + Math.floor((p.funding_raised || 0) / tokenPrice);
    }, 0);
  }, [projects]);

  const escrowReleased = escrowTotals.released;
  const escrowLocked = escrowTotals.locked;

  const pendingApprovals = useMemo(() => {
    const list: {
      id: string;
      type: string;
      entity: string;
      submitted: string;
      priority: "high" | "medium";
    }[] = [];

    if (projects.length > 0) {
      const p = projects[0];
      list.push({
        id: `proj-${p.id}`,
        type: "Project Approval",
        entity: p.title,
        submitted: "Just now",
        priority: "high",
      });
    }

    if (alerts.length > 0) {
      const a = alerts[0];
      list.push({
        id: `fraud-${a.project_id}`,
        type: "Milestone Verification",
        entity: `${a.project_title} - Verification Pending`,
        submitted: "Today",
        priority: a.severity === "HIGH" ? "high" : "medium",
      });
    }

    if (list.length === 0) {
      list.push({
        id: "none",
        type: "Project Approval",
        entity: "No pending approvals",
        submitted: "—",
        priority: "medium",
      });
    }

    return list.slice(0, 3);
  }, [projects, alerts]);

  const recentAlerts = useMemo(() => {
    if (alerts.length === 0) {
      return [
        {
          id: "ok",
          type: "success" as const,
          message: "No suspicious activities detected",
          time: "Live",
        },
      ];
    }

    return alerts.slice(0, 3).map((a, idx) => ({
      id: String(idx),
      type: a.severity === "HIGH" ? ("warning" as const) : ("info" as const),
      message: a.message,
      time: "Live",
    }));
  }, [alerts]);

  const platformMetrics = useMemo(() => {
    const cr = totalFundingRaised / 10000000;
    const endFunding = Math.round(cr);

    return [
      { month: "Aug", funding: Math.round(endFunding * 0.0), projects: Math.max(0, activeProjects.length - 3) },
      { month: "Sep", funding: Math.round(endFunding * 0.15), projects: Math.max(0, activeProjects.length - 2) },
      { month: "Oct", funding: Math.round(endFunding * 0.35), projects: Math.max(0, activeProjects.length - 1) },
      { month: "Nov", funding: Math.round(endFunding * 0.55), projects: Math.max(1, activeProjects.length) },
      { month: "Dec", funding: Math.round(endFunding * 0.75), projects: Math.max(1, activeProjects.length) },
      { month: "Jan", funding: Math.round(endFunding * 1.0), projects: Math.max(1, activeProjects.length) },
    ];
  }, [totalFundingRaised, activeProjects.length]);

  const formatCr = (amount: number) => {
    const cr = amount / 10000000;
    if (cr >= 1) return `₹${cr.toFixed(0)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Platform Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Platform Operations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor platform health, verify entities, and manage approvals
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Platform {platformStats.platform_health}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="animate-fade-in-up delay-100">
          <ImpactCard
            icon={Briefcase}
            label="Active Projects"
            value={loading ? "—" : String(platformStats.active_projects)}
            color="text-primary"
            className="border-l-primary"
          />
        </div>
        <div className="animate-fade-in-up delay-200">
          <ImpactCard
            icon={Shield}
            label="Verified Project Developers"
            value={loading ? "—" : String(platformStats.verified_developers)}
            color="text-[#10b981]"
            className="border-l-[#10b981]"
          />
        </div>
        <div className="animate-fade-in-up delay-300">
          <ImpactCard
            icon={FileCheck}
            label="Pending Approvals"
            value={loading ? "—" : String(platformStats.pending_approvals)}
            color="text-[#f59e0b]"
            className="border-l-[#f59e0b]"
            subtitle="Pending review"
          />
        </div>
        <div className="animate-fade-in-up delay-400">
          <ImpactCard
            icon={AlertTriangle}
            label="Fraud Alerts"
            value={loading ? "—" : String(platformStats.fraud_alerts)}
            color="text-[#dc2626]"
            className="border-l-[#dc2626]"
            subtitle={platformStats.fraud_alerts > 0 ? "Alert active" : "No active alerts"}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          Health: {platformStats.platform_health}
        </span>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          Pending: {platformStats.pending_approvals}
        </span>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            platformStats.fraud_alerts > 0
              ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          }`}
        >
          Fraud Alerts: {platformStats.fraud_alerts}
        </span>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Platform Funding Growth (₹Cr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={platformMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="funding" stroke="#0c4a6e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10b981]" />
              Active Projects Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={platformMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="projects" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Platform Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Fees Collected</p>
              <p className="text-2xl font-bold mt-1">₹{revenueOverview.total_fees_collected.toLocaleString("en-IN")}</p>
            </div>
            <div className="p-4 rounded-xl border bg-emerald-50/60 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/40">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Investments</p>
              <p className="text-2xl font-bold mt-1">₹{revenueOverview.total_investments.toLocaleString("en-IN")}</p>
            </div>
            <div className="p-4 rounded-xl border bg-sky-50/60 border-sky-200/60 dark:bg-sky-950/20 dark:border-sky-800/40">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Users</p>
              <p className="text-2xl font-bold mt-1">{revenueOverview.total_users.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals & Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-border/50 rounded-xl hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{item.type}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.priority === "high"
                              ? "bg-[#dc2626]/10 text-[#dc2626]"
                              : "bg-[#f59e0b]/10 text-[#f59e0b]"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.entity}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.submitted}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onNavigate(item.type.includes("Issuer") ? "verify-issuers" : "approve-projects")
                      }
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate("approve-projects")}
              >
                View All Approvals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Alerts & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-muted/50 dark:bg-muted/30 rounded-xl border border-border/30">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {alert.type === "warning" && (
                        <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                      )}
                      {alert.type === "success" && (
                        <CheckCircle className="w-4 h-4 text-[#10b981]" />
                      )}
                      {alert.type === "info" && (
                        <Shield className="w-4 h-4 text-[#0ea5e9]" />
                      )}
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate("fraud-monitoring")}
              >
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Metrics Table */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Platform Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/40 dark:to-sky-900/20 rounded-xl border border-sky-200/50 dark:border-sky-800/30 text-center">
              <DollarSign className="w-7 h-7 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCr(totalFundingRaised)}</p>
              <p className="text-sm text-muted-foreground">Total Funding Raised</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30 text-center">
              <Users className="w-7 h-7 text-[#0ea5e9] mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{totalInvestors.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">Total Investors</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 text-center">
              <CheckCircle className="w-7 h-7 text-[#10b981] mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">87%</p>
              <p className="text-xs text-muted-foreground">Milestone Success Rate</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30 text-center">
              <Lock className="w-7 h-7 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatCr(escrowLocked)}</p>
              <p className="text-xs text-muted-foreground">Escrow Locked</p>
            </div>
          </div>
          <div className="grid md:grid-cols-1 mt-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20 rounded-xl border border-green-200/50 dark:border-green-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Unlock className="w-7 h-7 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatCr(escrowReleased)}</p>
                    <p className="text-xs text-muted-foreground">Escrow Released to Issuers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {totalFundingRaised ? ((escrowReleased / totalFundingRaised) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">of total raised</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

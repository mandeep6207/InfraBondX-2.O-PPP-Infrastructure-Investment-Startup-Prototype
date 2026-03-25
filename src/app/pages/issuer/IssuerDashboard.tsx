import { useEffect, useMemo, useState } from "react";
import { DollarSign, Users, Briefcase, TrendingUp, Calendar, FileText, BarChart3, Building, Unlock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface IssuerDashboardProps {
  onNavigate: (page: string) => void;
}

type IssuerProjectDTO = {
  id: number;
  title: string;
  location: string;
  funding_raised: number;
  funding_target: number;
  token_price: number;
  roi_percent: number;
  tenure_months: number;
  risk_score: number;
  status: string;
};

type MilestoneDTO = {
  id: number;
  title: string;
  escrow_release_percent: number;
  status: string;
  proof_url: string;
};

export function IssuerDashboard({ onNavigate }: IssuerDashboardProps) {
  const [projects, setProjects] = useState<IssuerProjectDTO[]>([]);
  const [milestoneMap, setMilestoneMap] = useState<Record<number, MilestoneDTO[]>>({});
  const [loading, setLoading] = useState(false);
  const [escrowReceived, setEscrowReceived] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token") || "";

        const res = await fetch("http://localhost:5000/api/issuer/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setProjects(list);

        const map: Record<number, MilestoneDTO[]> = {};
        for (const p of list) {
          try {
            const mRes = await fetch(`http://localhost:5000/api/projects/${p.id}/milestones`);
            const mData = await mRes.json();
            map[p.id] = Array.isArray(mData) ? mData : [];
          } catch {
            map[p.id] = [];
          }
        }
        setMilestoneMap(map);

        // Compute total escrow released across projects
        let totalReleased = 0;
        for (const p of list) {
          try {
            const tRes = await fetch(`http://localhost:5000/api/projects/${p.id}/transparency`);
            const tData = await tRes.json();
            totalReleased += tData.total_released || 0;
          } catch {}
        }
        setEscrowReceived(totalReleased);
      } catch {
        setProjects([]);
        setMilestoneMap({});
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalFundsRaised = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.funding_raised || 0), 0);
  }, [projects]);

  const totalInvestors = useMemo(() => {
    return projects.reduce((sum, p) => {
      if (!p.token_price || p.token_price <= 0) return sum;
      return sum + Math.floor((p.funding_raised || 0) / p.token_price);
    }, 0);
  }, [projects]);

  const activeProjectsCount = useMemo(() => {
    return projects.filter((p) => (p.status || "").toUpperCase() !== "FROZEN").length;
  }, [projects]);

  const avgProjectProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    const sum = projects.reduce((acc, p) => {
      const prog =
        p.funding_target > 0 ? Math.round((p.funding_raised / p.funding_target) * 100) : 0;
      return acc + prog;
    }, 0);
    return Math.round(sum / projects.length);
  }, [projects]);

  const fundingTrend = useMemo(() => {
    const end = totalFundsRaised || 0;
    return [
      { month: "Aug", amount: Math.round(end * 0.0) },
      { month: "Sep", amount: Math.round(end * 0.1) },
      { month: "Oct", amount: Math.round(end * 0.25) },
      { month: "Nov", amount: Math.round(end * 0.45) },
      { month: "Dec", amount: Math.round(end * 0.7) },
      { month: "Jan", amount: Math.round(end * 1.0) },
    ];
  }, [totalFundsRaised]);

  const investorDemographics = useMemo(() => {
    return [
      { name: "Retail", value: 65, color: "#0ea5e9" },
      { name: "Institutional", value: 25, color: "#8b5cf6" },
      { name: "HNI", value: 10, color: "#10b981" },
    ];
  }, []);

  const upcomingMilestones = useMemo(() => {
    const rows: { id: string; project: string; milestone: string; dueDate: string; status: string }[] =
      [];

    const isDone = (s: string) => {
      const st = String(s || "").toUpperCase();
      return st === "COMPLETED";
    };

    for (const p of projects.slice(0, 2)) {
      const ms = milestoneMap[p.id] || [];
      const next = ms.find((m) => !isDone(m.status));
      if (next) {
        rows.push({
          id: `${p.id}-${next.id}`,
          project: p.title,
          milestone: next.title,
          dueDate: "Upcoming",
          status: "in-progress",
        });
      }
    }

    if (rows.length > 0) return rows;

    return [
      {
        id: "1",
        project: "No active projects",
        milestone: "Create a bond listing to start",
        dueDate: "—",
        status: "pending",
      },
    ];
  }, [projects, milestoneMap]);

  const formatCr = (amount: number) => {
    const cr = amount / 10000000;
    if (cr >= 1) return `₹${cr.toFixed(1)}Cr`;
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
            <span className="text-foreground font-medium">Project Developer Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Project Developer Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Maharashtra State Road Development Corporation
          </p>
        </div>
        <Button onClick={() => onNavigate("create-bond")} className="rounded-xl shadow-md">
          <FileText className="w-4 h-4 mr-2" />
          Launch Investment Opportunity
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="animate-fade-in-up delay-100">
          <ImpactCard
            icon={DollarSign}
            label="Total Funds Raised"
            value={formatCr(totalFundsRaised)}
            color="text-primary"
            className="border-l-primary"
          />
        </div>
        <div className="animate-fade-in-up delay-200">
          <ImpactCard
            icon={Users}
            label="Total Investors"
            value={totalInvestors.toLocaleString("en-IN")}
            color="text-[#0ea5e9]"
            className="border-l-[#0ea5e9]"
          />
        </div>
        <div className="animate-fade-in-up delay-300">
          <ImpactCard
            icon={Briefcase}
            label="Active Projects"
            value={String(activeProjectsCount)}
            color="text-[#10b981]"
            className="border-l-[#10b981]"
          />
        </div>
        <div className="animate-fade-in-up delay-400">
          <ImpactCard
            icon={TrendingUp}
            label="Avg. Project Progress"
            value={`${avgProjectProgress}%`}
            color="text-[#8b5cf6]"
            className="border-l-[#8b5cf6]"
          />
        </div>
      </div>

      {/* Escrow Funds Received Card */}
      <div className="rounded-2xl border-2 border-green-200/60 dark:border-green-800/40 bg-gradient-to-r from-green-50 via-emerald-50/30 to-green-50 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-green-950/30 p-5 shadow-md animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 flex items-center justify-center">
              <Unlock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Funds Received from Escrow</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCr(escrowReceived)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800/40">
            <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">Escrow Protected</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Funding Trend */}
        <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Funding Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fundingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#0c4a6e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investor Demographics */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
              Investor Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={investorDemographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {investorDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {investorDemographics.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Milestones */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMilestones.map((milestone) => (
                <div key={milestone.id} className="p-4 border border-border/50 rounded-xl hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{milestone.milestone}</h4>
                      <p className="text-sm text-muted-foreground">{milestone.project}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        milestone.status === "in-progress"
                          ? "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {milestone.status === "in-progress" ? "In Progress" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due: {milestone.dueDate}</span>
                    <Button size="sm" variant="outline" onClick={() => onNavigate("milestones")}>
                      Upload Proof
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => onNavigate("milestones")}>
                View All Milestones
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#10b981] rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Milestone Verified</p>
                  <p className="text-xs text-muted-foreground">
                    Proof submitted & verified (simulated) • Just now
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#0ea5e9] rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New Project Listing</p>
                  <p className="text-xs text-muted-foreground">
                    Added via Create Bond page • Today
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#f59e0b] rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Investor Activity</p>
                  <p className="text-xs text-muted-foreground">
                    Funding updates visible in Marketplace • Today
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Platform Transparency</p>
                  <p className="text-xs text-muted-foreground">
                    Escrow release tracked milestone-wise • Ongoing
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Project Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Target
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Raised
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Progress
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Investors
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-b hover:bg-accent">
                    <td className="py-4 px-4 text-muted-foreground" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr className="border-b hover:bg-accent">
                    <td className="py-4 px-4 text-muted-foreground" colSpan={6}>
                      No projects created yet. Click “Create New Bond Listing”.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => {
                    const progress =
                      p.funding_target > 0
                        ? Math.round((p.funding_raised / p.funding_target) * 100)
                        : 0;

                    const investors =
                      p.token_price > 0 ? Math.floor((p.funding_raised || 0) / p.token_price) : 0;

                    return (
                      <tr key={p.id} className="border-b hover:bg-accent">
                        <td className="py-4 px-4">
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.location}</p>
                        </td>
                        <td className="py-4 px-4 text-right">{formatCr(p.funding_target)}</td>
                        <td className="py-4 px-4 text-right font-medium">
                          {formatCr(p.funding_raised)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-[#10b981]">{progress}%</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {investors.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button size="sm" variant="outline" onClick={() => onNavigate("milestones")}>
                            Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Target, Bell, Activity, Building2, Coins, BarChart3, Sparkles, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { MyRewardsSection, categoryToRewardType, type RewardItem } from "@/app/components/RewardBenefitsCard";
import {
  formatDateOnly,
  getValidTill,
  toRewardVerificationPayload,
} from "@/utils/rewardVerification";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InvestorDashboardProps {
  onNavigate: (page: string) => void;
}

type PortfolioItemDTO = {
  project_id: number;
  project_title: string;
  tokens: number;
  avg_buy_price: number;
  token_price: number;
  roi_percent: number;
  tenure_months: number;
};

type ProjectDTO = {
  id: number;
  title: string;
  category: string;
  location: string;
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

export function InvestorDashboard({ onNavigate }: InvestorDashboardProps) {
  const [holdings, setHoldings] = useState<PortfolioItemDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [backendRewards, setBackendRewards] = useState<any[]>([]);
  const [totalRewardPoints, setTotalRewardPoints] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const pRes = await fetch("http://localhost:5000/api/investor/portfolio", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pData = await pRes.json();
        setHoldings(Array.isArray(pData) ? pData : []);

        const projRes = await fetch("http://localhost:5000/api/projects");
        const projData = await projRes.json();
        setProjects(Array.isArray(projData) ? projData : []);

        // Fetch real rewards from backend
        const rwRes = await fetch("http://localhost:5000/api/investor/rewards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rwData = await rwRes.json();
        setBackendRewards(Array.isArray(rwData?.rewards) ? rwData.rewards : []);
        setTotalRewardPoints(Number(rwData?.total_points) || 0);
      } catch {
        setHoldings([]);
        setProjects([]);
        setBackendRewards([]);
        setTotalRewardPoints(0);
      }
    };

    loadDashboard();
  }, []);

  const summary = useMemo(() => {
    const totalTokens = holdings.reduce((sum, h) => sum + (h.tokens || 0), 0);

    const totalInvested = holdings.reduce(
      (sum, h) => sum + (h.tokens || 0) * (h.token_price || 0),
      0
    );

    const avgROI =
      holdings.length > 0
        ? holdings.reduce((sum, h) => sum + (h.roi_percent || 0), 0) / holdings.length
        : 0;

    const expectedReturns = holdings.reduce((sum, h) => {
      const invested = (h.tokens || 0) * (h.token_price || 0);
      const expected = invested * (1 + (h.roi_percent || 0) / 100);
      return sum + expected;
    }, 0);

    return {
      totalTokens,
      totalInvested,
      expectedReturns,
      avgROI,
      projectsCount: holdings.length,
    };
  }, [holdings]);

  const portfolioData = useMemo(() => {
    const base = summary.totalInvested || 0;

    return [
      { month: "Aug", value: Math.round(base * 0.0) },
      { month: "Sep", value: Math.round(base * 0.2) },
      { month: "Oct", value: Math.round(base * 0.35) },
      { month: "Nov", value: Math.round(base * 0.52) },
      { month: "Dec", value: Math.round(base * 0.78) },
      { month: "Jan", value: Math.round(base * 1.0) },
    ];
  }, [summary.totalInvested]);

  const riskDistribution = useMemo(() => {
    const total = summary.totalInvested || 0;

    if (total <= 0) {
      return [
        { name: "Low Risk", value: 0, color: "#10b981" },
        { name: "Medium Risk", value: 0, color: "#f59e0b" },
        { name: "High Risk", value: 0, color: "#dc2626" },
      ];
    }

    let low = 0;
    let med = 0;
    let high = 0;

    for (const h of holdings) {
      const invested = (h.tokens || 0) * (h.token_price || 0);
      const roi = h.roi_percent || 0;

      if (roi <= 10) low += invested;
      else if (roi <= 13) med += invested;
      else high += invested;
    }

    return [
      { name: "Low Risk", value: Math.round(low), color: "#10b981" },
      { name: "Medium Risk", value: Math.round(med), color: "#f59e0b" },
      { name: "High Risk", value: Math.round(high), color: "#dc2626" },
    ];
  }, [holdings, summary.totalInvested]);

  const notifications = useMemo(() => {
    const items: { id: string; type: string; title: string; message: string; time: string }[] = [];

    // Escrow notification — always show if user has holdings
    if (holdings.length > 0) {
      items.push({
        id: "escrow-1",
        type: "escrow",
        title: "🔒 Escrow Protection Active",
        message: `Your investments across ${holdings.length} project(s) are secured in escrow. Funds are released only after milestone verification.`,
        time: "Live",
      });
    }

    const topHold = holdings.slice(0, 2).map((h, idx) => ({
      id: String(idx + 1),
      type: "info",
      title: idx === 0 ? "Investment Confirmed" : "Portfolio Updated",
      message:
        idx === 0
          ? `Tokens successfully minted in ${h.project_title}`
          : `Holding updated for ${h.project_title}`,
      time: idx === 0 ? "Just now" : `${idx + 1} hours ago`,
    }));

    items.push(...topHold);

    if (items.length > 0) return items;

    return [
      {
        id: "1",
        type: "info",
        title: "Welcome to InfraBondX",
        message: "Explore verified infrastructure projects and start investing from ₹100.",
        time: "Just now",
      },
    ];
  }, [holdings]);

  const recommendedProjects = useMemo(() => {
    const list = projects
      .slice(0, 2)
      .map((p, idx) => ({
        id: `project-${p.id}`,
        name: p.title,
        roi: p.roi_percent,
        risk: p.risk_score,
        progress:
          p.funding_target > 0 ? Math.round((p.funding_raised / p.funding_target) * 100) : 0,
      }));

    if (list.length > 0) return list;

    return [
      {
        id: "project-1",
        name: "Recommended Project",
        roi: 10.5,
        risk: 45,
        progress: 25,
      },
    ];
  }, [projects]);

  const impact = useMemo(() => {
    const invested = summary.totalInvested || 0;

    const roadMeters = Math.round(invested / 50);
    const solarPercent = Number(((invested / 200000) * 100).toFixed(1));
    const jobs = Math.max(1, Math.round(invested / 250));
    const co2SavedTons = Number((invested / 1200).toFixed(1));

    return { roadMeters, solarPercent, jobs, co2SavedTons };
  }, [summary.totalInvested]);

  const myRewards = useMemo(() => {
    // If we have real backend rewards, use those
    if (backendRewards.length > 0) {
      return backendRewards.map((r: any) => {
        const proj = projects.find(p => p.id === r.project_id);
        return {
          id: r.id,
          project: r.project_title || "Project",
          category: proj?.category || "Infrastructure",
          rewardType: r.reward_type || "CIVIC_REWARD",
          points: r.reward_points || 0,
          description: r.description,
          grantedAt: r.granted_at,
          location: proj?.location || "Project Location",
        };
      });
    }
    // Fallback: compute from holdings when no backend rewards exist
    return holdings.map(h => {
      const proj = projects.find(p => p.id === h.project_id);
      const cat = proj ? proj.category : "Infrastructure";
      const rewardType = categoryToRewardType(cat);
      return {
        id: h.project_id,
        project: h.project_title,
        category: cat,
        rewardType,
        points: Math.round((h.tokens || 0) * 1.5),
        location: proj?.location || "Project Location",
      };
    });
  }, [holdings, projects, backendRewards]);

  const computedTotalPoints = useMemo(() => {
    if (totalRewardPoints > 0) return totalRewardPoints;
    return myRewards.reduce((sum, r) => sum + r.points, 0);
  }, [myRewards, totalRewardPoints]);

  const handleViewRewardDetails = (reward: RewardItem) => {
    const storedUser = localStorage.getItem("user");
    let investorName = "Investor";
    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        investorName = parsed?.name || "Investor";
      }
    } catch {
      investorName = "Investor";
    }

    const validTill = getValidTill(reward.grantedAt);

    const payload = toRewardVerificationPayload({
      user_name: investorName,
      project_name: reward.project,
      reward_type: reward.rewardType,
      points: reward.points,
      location: reward.location || "Project Location",
      valid_till:
        validTill !== "-"
          ? validTill
          : formatDateOnly(new Date(new Date().setFullYear(new Date().getFullYear() + 3))),
      reward_id: reward.id,
      description: reward.description || "Reward benefit unlocked for milestone completion.",
    });

    localStorage.setItem("selected_reward_payload", JSON.stringify(payload));
    onNavigate("reward-details");
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Investment Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your portfolio, monitor milestones, and view your impact
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {summary.projectsCount} Active Investment{summary.projectsCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => onNavigate("withdraw")}>Withdraw Funds</Button>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="animate-fade-in-up delay-100">
          <ImpactCard
            icon={Wallet}
            label="Total Invested"
            value={`₹${summary.totalInvested.toLocaleString("en-IN")}`}
            color="text-primary"
            className="border-l-primary"
          />
        </div>
        <div className="animate-fade-in-up delay-200">
          <ImpactCard
            icon={Coins}
            label="Tokens Owned"
            value={`${summary.totalTokens}`}
            color="text-[#0ea5e9]"
            className="border-l-[#0ea5e9]"
          />
        </div>
        <div className="animate-fade-in-up delay-300">
          <ImpactCard
            icon={TrendingUp}
            label="Expected Returns"
            value={`₹${Math.round(summary.expectedReturns).toLocaleString("en-IN")}`}
            color="text-[#10b981]"
            className="border-l-[#10b981]"
          />
        </div>
        <div className="animate-fade-in-up delay-400">
          <ImpactCard
            icon={Target}
            label="Avg. ROI"
            value={`${summary.avgROI.toFixed(1)}%`}
            color="text-[#8b5cf6]"
            className="border-l-[#8b5cf6]"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Portfolio Growth */}
        <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Portfolio Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c4a6e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0c4a6e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0c4a6e"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Meter & Notifications */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Impact Meter */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Your Impact Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-gradient-to-r from-primary/5 to-sky-500/5 dark:from-primary/10 dark:to-sky-500/10 rounded-xl border border-primary/10">
              <p className="text-lg font-bold text-foreground">Your investment helped build:</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                <p className="text-2xl font-bold text-[#10b981]">{impact.roadMeters}m</p>
                <p className="text-xs text-muted-foreground mt-0.5">Road Length</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/40 dark:to-sky-900/20 rounded-xl border border-sky-200/50 dark:border-sky-800/30">
                <p className="text-2xl font-bold text-[#0ea5e9]">{impact.solarPercent}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Solar Capacity</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-2xl font-bold text-[#f59e0b]">{impact.jobs}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Jobs Enabled</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/40 dark:to-violet-900/20 rounded-xl border border-violet-200/50 dark:border-violet-800/30">
                <p className="text-2xl font-bold text-[#8b5cf6]">{impact.co2SavedTons}T</p>
                <p className="text-xs text-muted-foreground mt-0.5">CO₂ Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Notifications */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Live Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-3 rounded-xl border ${
                notif.type === "escrow"
                  ? "bg-sky-50/60 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-800/40"
                  : "bg-muted/50 dark:bg-muted/30 border-border/30"
              }`}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {notif.type === "escrow" && <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                    <h4 className="font-medium text-sm text-foreground">{notif.title}</h4>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{notif.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Section */}
      <MyRewardsSection
        rewards={myRewards}
        totalPoints={computedTotalPoints}
        onViewDetails={handleViewRewardDetails}
      />

      {/* Recommended Projects */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Recommended Projects for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:border-primary/40 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
                onClick={() => onNavigate(project.id)}
              >
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{project.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>ROI: {project.roi}%</span>
                    <span>Risk: {project.risk}/100</span>
                    <span>Progress: {project.progress}%</span>
                  </div>
                </div>
                <Button>View Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

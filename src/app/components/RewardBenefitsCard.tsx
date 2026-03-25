import { useState, type ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Gift, ChevronRight, Sparkles, Star } from "lucide-react";
import { formatDateTime } from "@/utils/dateFormatter";

/* ──────────────── Reward Type SVG Logos ──────────────── */

function TollDiscountLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="toll-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#toll-bg)" />
      {/* Road */}
      <rect x="10" y="50" width="60" height="8" rx="2" fill="white" opacity="0.9" />
      <rect x="18" y="52" width="6" height="4" rx="1" fill="#f97316" />
      <rect x="30" y="52" width="6" height="4" rx="1" fill="#f97316" />
      <rect x="42" y="52" width="6" height="4" rx="1" fill="#f97316" />
      <rect x="54" y="52" width="6" height="4" rx="1" fill="#f97316" />
      {/* Barrier */}
      <rect x="36" y="20" width="8" height="32" rx="2" fill="white" opacity="0.95" />
      <rect x="28" y="18" width="24" height="8" rx="3" fill="white" />
      <circle cx="40" cy="22" r="3" fill="#22c55e" />
      {/* Car */}
      <rect x="14" y="40" width="16" height="10" rx="3" fill="white" opacity="0.85" />
      <rect x="16" y="36" width="10" height="6" rx="2" fill="white" opacity="0.7" />
    </svg>
  );
}

function TravelCreditLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="travel-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#travel-bg)" />
      {/* Metro/Train body */}
      <rect x="16" y="24" width="48" height="28" rx="6" fill="white" opacity="0.95" />
      <rect x="20" y="28" width="12" height="10" rx="2" fill="#3b82f6" opacity="0.5" />
      <rect x="36" y="28" width="12" height="10" rx="2" fill="#3b82f6" opacity="0.5" />
      <rect x="52" y="28" width="8" height="10" rx="2" fill="#3b82f6" opacity="0.5" />
      {/* Door */}
      <rect x="33" y="40" width="8" height="12" rx="1" fill="#3b82f6" opacity="0.3" />
      {/* Wheels */}
      <circle cx="26" cy="56" r="4" fill="white" opacity="0.9" />
      <circle cx="54" cy="56" r="4" fill="white" opacity="0.9" />
      {/* Rail */}
      <rect x="10" y="58" width="60" height="3" rx="1" fill="white" opacity="0.5" />
      {/* Speed lines */}
      <rect x="6" y="32" width="8" height="2" rx="1" fill="white" opacity="0.5" />
      <rect x="4" y="38" width="10" height="2" rx="1" fill="white" opacity="0.4" />
    </svg>
  );
}

function ShoppingDiscountLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="shop-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#shop-bg)" />
      {/* Shopping bag */}
      <rect x="22" y="30" width="36" height="32" rx="4" fill="white" opacity="0.95" />
      <path d="M30 30 C30 20 50 20 50 30" stroke="white" strokeWidth="3" fill="none" opacity="0.8" />
      {/* Percent symbol */}
      <circle cx="34" cy="42" r="4" fill="#ec4899" opacity="0.7" />
      <circle cx="46" cy="52" r="4" fill="#ec4899" opacity="0.7" />
      <line x1="48" y1="38" x2="32" y2="56" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      {/* Star decoration */}
      <circle cx="60" cy="20" r="6" fill="#fbbf24" opacity="0.9" />
      <text x="60" y="23" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">%</text>
    </svg>
  );
}

function GreenEnergyCreditLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="green-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#green-bg)" />
      {/* Leaf */}
      <path d="M20 55 Q20 25 50 18 Q55 45 30 55 Z" fill="white" opacity="0.9" />
      <path d="M20 55 Q30 40 50 18" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.6" />
      {/* Sun */}
      <circle cx="58" cy="24" r="10" fill="#fbbf24" opacity="0.9" />
      {/* Rays */}
      <line x1="58" y1="10" x2="58" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="68" y1="18" x2="66" y2="20" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="70" y1="28" x2="66" y2="27" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* Solar panel */}
      <rect x="44" y="48" width="22" height="16" rx="2" fill="white" opacity="0.85" />
      <line x1="48" y1="48" x2="48" y2="64" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
      <line x1="55" y1="48" x2="55" y2="64" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
      <line x1="62" y1="48" x2="62" y2="64" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
      <line x1="44" y1="54" x2="66" y2="54" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
      <line x1="44" y1="60" x2="66" y2="60" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function UtilityDiscountLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="util-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#util-bg)" />
      {/* Water drop */}
      <path d="M40 16 C40 16 22 38 22 50 C22 60 30 66 40 66 C50 66 58 60 58 50 C58 38 40 16 40 16Z" fill="white" opacity="0.9" />
      <path d="M32 50 Q36 42 40 50 Q44 58 48 50" stroke="#06b6d4" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Pipe */}
      <rect x="10" y="54" width="14" height="6" rx="2" fill="white" opacity="0.6" />
      <rect x="56" y="54" width="14" height="6" rx="2" fill="white" opacity="0.6" />
    </svg>
  );
}

function HealthSubsidyLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="health-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#health-bg)" />
      {/* Cross */}
      <rect x="32" y="18" width="16" height="44" rx="3" fill="white" opacity="0.95" />
      <rect x="18" y="32" width="44" height="16" rx="3" fill="white" opacity="0.95" />
      {/* Heart */}
      <path d="M56 18 C60 14 68 16 66 24 C64 30 56 28 56 28 C56 28 48 30 46 24 C44 16 52 14 56 18Z" fill="#fbbf24" opacity="0.9" />
    </svg>
  );
}

function SafetyCreditLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="safety-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#safety-bg)" />
      {/* Shield */}
      <path d="M40 14 L58 22 C58 22 60 42 40 62 C20 42 22 22 22 22 L40 14Z" fill="white" opacity="0.95" />
      {/* Check */}
      <path d="M30 38 L37 46 L50 30" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function SmartCityPerkLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="smart-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#smart-bg)" />
      {/* Building */}
      <rect x="30" y="26" width="20" height="34" rx="2" fill="white" opacity="0.95" />
      <rect x="14" y="38" width="16" height="22" rx="2" fill="white" opacity="0.8" />
      <rect x="50" y="34" width="16" height="26" rx="2" fill="white" opacity="0.85" />
      {/* Windows */}
      <rect x="34" y="30" width="4" height="4" rx="1" fill="#6366f1" opacity="0.5" />
      <rect x="42" y="30" width="4" height="4" rx="1" fill="#6366f1" opacity="0.5" />
      <rect x="34" y="38" width="4" height="4" rx="1" fill="#6366f1" opacity="0.5" />
      <rect x="42" y="38" width="4" height="4" rx="1" fill="#6366f1" opacity="0.5" />
      {/* WiFi signal */}
      <path d="M34 18 Q40 12 46 18" stroke="white" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M36 22 Q40 17 44 22" stroke="white" strokeWidth="2" fill="none" opacity="0.8" />
      <circle cx="40" cy="24" r="2" fill="white" />
    </svg>
  );
}

function CivicRewardLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={`w-12 h-12 transition-transform duration-300 ${active ? "scale-110" : ""}`}>
      <defs>
        <linearGradient id="civic-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#civic-bg)" />
      {/* Star */}
      <path d="M40 14 L46 30 L64 30 L50 40 L54 56 L40 46 L26 56 L30 40 L16 30 L34 30 Z" fill="white" opacity="0.95" />
      <circle cx="40" cy="36" r="6" fill="#f59e0b" opacity="0.6" />
    </svg>
  );
}

/* ──────────────── Reward logo resolver ──────────────── */

const REWARD_CONFIG: Record<string, {
  logo: (props: { active: boolean }) => ReactElement;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  TOLL_DISCOUNT:      { logo: TollDiscountLogo,      label: "Toll Discounts",       color: "#f97316", bgColor: "#fff7ed", description: "Get discounts on toll plazas and road fees" },
  TRAVEL_CREDIT:      { logo: TravelCreditLogo,      label: "Travel Credits",       color: "#3b82f6", bgColor: "#eff6ff", description: "Earn transit credits for metro, rail & air travel" },
  SHOPPING_DISCOUNT:  { logo: ShoppingDiscountLogo,  label: "Shopping Discounts",   color: "#ec4899", bgColor: "#fdf2f8", description: "Exclusive discounts at partner retail outlets" },
  GREEN_ENERGY_CREDIT:{ logo: GreenEnergyCreditLogo, label: "Green Energy Credits", color: "#22c55e", bgColor: "#f0fdf4", description: "Carbon offset credits and energy bill discounts" },
  UTILITY_DISCOUNT:   { logo: UtilityDiscountLogo,   label: "Utility Discounts",    color: "#06b6d4", bgColor: "#ecfeff", description: "Discounts on water & drainage utility bills" },
  HEALTH_SUBSIDY:     { logo: HealthSubsidyLogo,     label: "Health Subsidies",     color: "#ef4444", bgColor: "#fef2f2", description: "Subsidized medical services & health checkups" },
  SAFETY_CREDIT:      { logo: SafetyCreditLogo,      label: "Safety Credits",       color: "#8b5cf6", bgColor: "#f5f3ff", description: "Safety infrastructure credits & insurance discounts" },
  SMART_CITY_PERK:    { logo: SmartCityPerkLogo,     label: "Smart City Perks",     color: "#6366f1", bgColor: "#eef2ff", description: "Access digital services & IoT benefits" },
  CIVIC_REWARD:       { logo: CivicRewardLogo,       label: "Civic Rewards",        color: "#f59e0b", bgColor: "#fffbeb", description: "Earn civic reward points for public infra investment" },
  INFRA_POINTS:       { logo: CivicRewardLogo,       label: "Civic Rewards",        color: "#f59e0b", bgColor: "#fffbeb", description: "Earn civic reward points for public infra investment" },
};

/** Map project category to a reward type key */
export function categoryToRewardType(category: string): string {
  const map: Record<string, string> = {
    "Highway":          "TOLL_DISCOUNT",
    "Road":             "TOLL_DISCOUNT",
    "Bridge":           "TOLL_DISCOUNT",
    "Metro":            "TRAVEL_CREDIT",
    "Transport":        "TRAVEL_CREDIT",
    "Railway":          "TRAVEL_CREDIT",
    "Airport":          "TRAVEL_CREDIT",
    "Mall":             "SHOPPING_DISCOUNT",
    "Commercial":       "SHOPPING_DISCOUNT",
    "Energy":           "GREEN_ENERGY_CREDIT",
    "Solar":            "GREEN_ENERGY_CREDIT",
    "Waste Management": "GREEN_ENERGY_CREDIT",
    "Water":            "UTILITY_DISCOUNT",
    "Drainage":         "UTILITY_DISCOUNT",
    "Hospital":         "HEALTH_SUBSIDY",
    "Health":           "HEALTH_SUBSIDY",
    "Safety":           "SAFETY_CREDIT",
    "Smart City":       "SMART_CITY_PERK",
  };
  return map[category] || "CIVIC_REWARD";
}

export function getRewardConfig(rewardType: string) {
  return REWARD_CONFIG[rewardType] || REWARD_CONFIG["CIVIC_REWARD"];
}

/* ──────────────── Project Details: Reward Benefits Section ──────────────── */

interface RewardBenefitsCardProps {
  category: string;
  projectName: string;
}

export function RewardBenefitsCard({ category, projectName }: RewardBenefitsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rewardType = categoryToRewardType(category);
  const config = getRewardConfig(rewardType);
  const LogoComponent = config.logo;

  // Show a few "related" reward types for visual richness
  const allTypes = Object.entries(REWARD_CONFIG).filter(([k]) => k !== "INFRA_POINTS");
  const otherRewards = allTypes.filter(([k]) => k !== rewardType).slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Reward Benefits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Reward */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <div
            className="p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer"
            style={{
              borderColor: config.color + "40",
              backgroundColor: config.bgColor,
            }}
          >
            <div className="flex items-center gap-3">
              <LogoComponent active={expanded} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-sm font-bold"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Invest in <strong>{projectName}</strong> to earn{" "}
                  <strong>{config.label.toLowerCase()}</strong> upon each milestone completion.
                </p>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                  expanded ? "rotate-90" : ""
                }`}
              />
            </div>

            {expanded && (
              <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: config.color + "20" }}>
                <p className="text-xs text-muted-foreground">{config.description}</p>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Gift className="w-3 h-3" /> Granted per milestone
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Sparkles className="w-3 h-3" /> Points: ~50 per milestone
                  </span>
                </div>
              </div>
            )}
          </div>
        </button>

        {/* Other available rewards preview */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
            Other Reward Categories
          </p>
          <div className="flex gap-2">
            {otherRewards.map(([key, cfg]) => {
              const Logo = cfg.logo;
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors hover:bg-accent/50 cursor-default flex-1"
                  title={cfg.label}
                >
                  <Logo active={false} />
                  <span className="text-[9px] text-muted-foreground text-center leading-tight font-medium">
                    {cfg.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center border-t pt-2">
          Rewards are granted automatically upon each milestone approval.
          Check "My Rewards" in your dashboard.
        </p>
      </CardContent>
    </Card>
  );
}

/* ──────────────── Investor Dashboard: My Rewards Section ──────────────── */

export interface RewardItem {
  id: number;
  project: string;
  category: string;
  rewardType: string;
  points: number;
  description?: string;
  grantedAt?: string;
  location?: string;
}

interface MyRewardsSectionProps {
  rewards: RewardItem[];
  totalPoints: number;
  onViewDetails?: (reward: RewardItem) => void;
}

export function MyRewardsSection({ rewards, totalPoints, onViewDetails }: MyRewardsSectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Group rewards by type
  const rewardsByType = rewards.reduce<Record<string, RewardItem[]>>((acc, r) => {
    const key = r.rewardType || "CIVIC_REWARD";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const typeKeys = Object.keys(rewardsByType);

  const filteredRewards = selectedType
    ? (rewardsByType[selectedType] || [])
    : rewards;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            My Rewards
          </CardTitle>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-lg font-bold text-amber-600">{totalPoints}</span>
            <span className="text-xs text-muted-foreground">total pts</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rewards.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
              <Gift className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-medium">No Rewards Yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Invest in projects and earn rewards when milestones are completed.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter chips by reward type */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  !selectedType
                    ? "bg-amber-100 text-amber-700 border border-amber-300"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                All ({rewards.length})
              </button>
              {typeKeys.map((key) => {
                const cfg = getRewardConfig(key);
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedType(selectedType === key ? null : key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      selectedType === key
                        ? "border shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                    style={
                      selectedType === key
                        ? { backgroundColor: cfg.bgColor, color: cfg.color, borderColor: cfg.color + "60" }
                        : undefined
                    }
                  >
                    {cfg.label.split(" ")[0]}
                    <span className="opacity-70">({rewardsByType[key].length})</span>
                  </button>
                );
              })}
            </div>

            {/* Reward Cards Grid */}
            <div className="grid md:grid-cols-3 gap-3">
              {filteredRewards.map((reward) => {
                const cfg = getRewardConfig(reward.rewardType);
                const LogoComponent = cfg.logo;
                return (
                  <div
                    key={reward.id}
                    onClick={() => onViewDetails?.(reward)}
                    className="group p-3 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer"
                    style={{ backgroundColor: cfg.bgColor, borderColor: cfg.color + "25" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 group-hover:scale-105 transition-transform">
                        <LogoComponent active={false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold truncate" style={{ color: cfg.color }}>
                            {cfg.label}
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: cfg.color + "20", color: cfg.color }}
                          >
                            {reward.points} pts
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-foreground truncate">
                          {reward.project}
                        </p>
                        {reward.description && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {reward.description}
                          </p>
                        )}
                        {reward.grantedAt && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Granted: {formatDateTime(reward.grantedAt)}
                          </p>
                        )}
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails?.(reward);
                            }}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-md border"
                            style={{ borderColor: cfg.color + "70", color: cfg.color, backgroundColor: "#ffffff" }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

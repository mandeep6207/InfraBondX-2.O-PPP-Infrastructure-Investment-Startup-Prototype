import { Users, Building2, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

import { UserRole } from "@/contexts/AuthContext";

/* ── Inline brand logo ────────────────────────────────────────── */
function InfraBondXLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 4L6 16v16c0 16 11.2 30.4 26 34 14.8-3.6 26-18 26-34V16L32 4z" fill="#0c4a6e" opacity="0.12" />
      <path d="M14 38c0-10 8-18 18-18s18 8 18 18" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="18" y="36" width="3" height="12" rx="1.5" fill="#0c4a6e" />
      <rect x="30.5" y="20" width="3" height="28" rx="1.5" fill="#0c4a6e" />
      <rect x="43" y="36" width="3" height="12" rx="1.5" fill="#0c4a6e" />
      <path d="M22 42l10-16 10 16" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

interface RoleSelectPageProps {
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

export function RoleSelectPage({ onSelectRole, onBack }: RoleSelectPageProps) {
  const roles = [
    {
      id: "investor" as const,
      icon: Users,
      title: "Investor / Citizen",
      description: "Browse projects, invest in opportunities, and track your portfolio.",
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600",
      lightBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderHover: "hover:border-emerald-300",
      features: [
        "Start investing with ₹100",
        "View milestone progress",
        "Track returns & impact",
        "Access secondary market",
      ],
    },
    {
      id: "issuer" as const,
      icon: Building2,
      title: "Project Developer / Government / PPP",
      description: "Launch investment opportunities, manage milestones, and raise investments.",
      color: "sky",
      gradient: "from-sky-500 to-sky-600",
      lightBg: "bg-sky-50",
      iconColor: "text-sky-600",
      borderHover: "hover:border-sky-300",
      features: [
        "Launch investment opportunities",
        "Submit progress proofs",
        "Track investor base",
        "Manage escrow releases",
      ],
    },
    {
      id: "admin" as const,
      icon: ShieldCheck,
      title: "Platform Operations",
      description: "Verify project developers, approve projects, and track platform integrity.",
      color: "amber",
      gradient: "from-amber-500 to-amber-600",
      lightBg: "bg-amber-50",
      iconColor: "text-amber-600",
      borderHover: "hover:border-amber-300",
      features: [
        "Verify project developer credentials",
        "Approve bond listings",
        "Track investment fraud alerts",
        "Generate platform reports",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0c4a6e] to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.03]" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 mb-4 text-sm"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <InfraBondXLogo size={36} />
            <span className="text-xl font-bold tracking-tight text-white">InfraBondX</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Choose Your Role</h1>
          <p className="text-base text-white/60">
            Select how you want to interact with the platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer group border-2 border-transparent ${role.borderHover} transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1 bg-white/[0.97] backdrop-blur-sm`}
              onClick={() => onSelectRole(role.id)}
            >
              <CardContent className="p-6">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${role.lightBg} flex items-center justify-center mb-5`}>
                  <role.icon className={`w-7 h-7 ${role.iconColor}`} />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1.5">{role.title}</h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">{role.description}</p>

                <ul className="space-y-2.5 mb-6">
                  {role.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-center gap-2.5 text-slate-600">
                      <span className={`w-1.5 h-1.5 rounded-full bg-${role.color}-500 shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${role.gradient} text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg group-hover:shadow-xl transition-all`}>
                  Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            All roles use demo authentication for this hackathon · No real financial transactions
          </p>
        </div>
      </div>
    </div>
  );
}

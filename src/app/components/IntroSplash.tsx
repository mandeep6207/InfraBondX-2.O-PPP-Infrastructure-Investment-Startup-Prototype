import { useEffect, useState } from "react";
import {
  Coins,
  Lock,
  BarChart3,
  Gift,
  TrendingUp,
  HardHat,
  Globe,
  Zap,
} from "lucide-react";

interface IntroSplashProps {
  onComplete: () => void;
}

function InfraBondXSplashLogo({ size = 92 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 4L6 16v16c0 16 11.2 30.4 26 34 14.8-3.6 26-18 26-34V16L32 4z"
        fill="#38bdf8"
        opacity="0.2"
      />
      <path
        d="M14 38c0-10 8-18 18-18s18 8 18 18"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="18" y="36" width="3" height="12" rx="1.5" fill="#38bdf8" />
      <rect x="43" y="36" width="3" height="12" rx="1.5" fill="#38bdf8" />
      <rect x="12" y="46" width="40" height="3" rx="1.5" fill="#38bdf8" />
      <path
        d="M22 34l6-6 4 3 8-10"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M38 19l3 2-3 2" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="14" r="3.5" fill="#34d399" opacity="0.85" />
      <circle cx="26" cy="17" r="2" fill="#38bdf8" opacity="0.65" />
      <circle cx="38" cy="17" r="2" fill="#38bdf8" opacity="0.65" />
    </svg>
  );
}

const splashHighlights = [
  { icon: Coins, title: "Invest from ₹100", subtitle: "Low-barrier entry" },
  { icon: Lock, title: "Escrow Secured", subtitle: "Milestone protection" },
  { icon: BarChart3, title: "Real-Time Tracking", subtitle: "Live project metrics" },
  { icon: Gift, title: "Earn Rewards", subtitle: "Citizen investor perks" },
  { icon: TrendingUp, title: "High ROI Potential", subtitle: "Data-backed returns" },
  { icon: HardHat, title: "Verified Projects", subtitle: "Due diligence first" },
  { icon: Globe, title: "Nationwide Impact", subtitle: "Across India" },
  { icon: Zap, title: "Fast & Transparent", subtitle: "Digital-first flow" },
];

export function IntroSplash({ onComplete }: IntroSplashProps) {
  const [logoVisible, setLogoVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timers: number[] = [];

    timers.push(window.setTimeout(() => setLogoVisible(true), 80));
    timers.push(window.setTimeout(() => setVisibleCount(1), 2000));
    timers.push(window.setTimeout(() => setVisibleCount(2), 2300));
    timers.push(window.setTimeout(() => setVisibleCount(3), 2600));
    timers.push(window.setTimeout(() => setVisibleCount(4), 2900));
    timers.push(window.setTimeout(() => setVisibleCount(5), 3200));
    timers.push(window.setTimeout(() => setVisibleCount(6), 3500));
    timers.push(window.setTimeout(() => setVisibleCount(7), 3800));
    timers.push(window.setTimeout(() => setVisibleCount(8), 4100));
    timers.push(window.setTimeout(() => setIsExiting(true), 5000));
    timers.push(window.setTimeout(onComplete, 6000));

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#0c4a6e]"
      style={{
        opacity: isExiting ? 0 : 1,
        transition: "opacity 1000ms ease",
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading InfraBondX"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.22), transparent 40%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.2), transparent 45%)",
          animation: "splashGradientDrift 10s ease-in-out infinite",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.22) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/30"
            style={{
              left: `${10 + i * 9}%`,
              top: `${15 + (i % 4) * 18}%`,
              animation: `splashParticle ${4 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 text-center">
        <div
          className="mx-auto mb-7 inline-flex h-28 w-28 items-center justify-center rounded-3xl border border-white/15 bg-white/[0.03] shadow-[0_0_60px_rgba(56,189,248,0.35)]"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? "scale(1)" : "scale(0.84)",
            transition: "opacity 1200ms ease, transform 1200ms ease",
            animation: "splashPulse 2.2s ease-in-out infinite",
          }}
        >
          <div style={{ animation: "splashTilt 5.5s ease-in-out infinite" }}>
            <InfraBondXSplashLogo />
          </div>
        </div>

        <h1
          className="text-3xl font-bold tracking-tight text-white md:text-4xl"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 700ms ease 120ms, transform 700ms ease 120ms",
          }}
        >
          InfraBondX
        </h1>
        <p
          className="mt-2 text-base text-slate-300 md:text-lg"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 1000ms ease 220ms, transform 1000ms ease 220ms",
          }}
        >
          Invest in India&#39;s Infrastructure
        </p>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {splashHighlights.map((item, idx) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_14px_35px_rgba(56,189,248,0.35)]"
              style={{
                opacity: visibleCount > idx ? 1 : 0,
                transform: visibleCount > idx ? "translateY(0) scale(1)" : "translateY(14px) scale(0.9)",
                transition: "opacity 450ms ease, transform 450ms ease",
              }}
            >
              <div style={{ animation: `splashFloat 3.6s ease-in-out ${idx * 0.18}s infinite` }}>
                <item.icon className="mx-auto mb-2 h-6 w-6 text-emerald-300 transition-transform duration-300 group-hover:scale-110" />
                <p className="text-base font-semibold tracking-tight text-slate-100 md:text-xl">{item.title}</p>
                <p className="mt-1 text-xs text-slate-300/90 md:text-sm">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <p
          className="mt-7 text-sm text-emerald-200/90"
          style={{
            opacity: visibleCount >= 8 ? 1 : 0,
            transform: visibleCount >= 8 ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 450ms ease, transform 450ms ease",
          }}
        >
          Empowering India&#39;s Infrastructure 🇮🇳
        </p>
      </div>

      <style>{`
        @keyframes splashGradientDrift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-2%, 1%, 0) scale(1.03); }
        }
        @keyframes splashParticle {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-10px); opacity: 0.8; }
        }
        @keyframes splashFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes splashPulse {
          0%, 100% { box-shadow: 0 0 45px rgba(56, 189, 248, 0.25); }
          50% { box-shadow: 0 0 70px rgba(16, 185, 129, 0.35); }
        }
        @keyframes splashTilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-4deg); }
        }
      `}</style>
    </div>
  );
}

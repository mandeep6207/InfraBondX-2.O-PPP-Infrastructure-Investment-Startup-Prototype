import { useEffect, useRef, useState } from "react";
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
  Lock,
  FileCheck,
  Zap,
  Coins,
  LineChart,
  HardHat,
  Eye,
  Gift,
  Globe,
  Landmark,
  BarChart3,
  ChevronRight,
  ExternalLink,
  Award,
  Leaf,
  MapPin,
  BriefcaseBusiness,
  ChevronLeft,
  Newspaper,
  Sun,
  TrainFront,
  Cpu,
  Route,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";

/* ═══════════════════════════════════════════════════════════════════
   INLINE SVG COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function InfraBondXLogo({ size = 50 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer shield */}
      <path
        d="M32 4L6 16v16c0 16 11.2 30.4 26 34 14.8-3.6 26-18 26-34V16L32 4z"
        fill="#0c4a6e"
        opacity="0.12"
      />
      {/* Bridge arch */}
      <path
        d="M14 38c0-10 8-18 18-18s18 8 18 18"
        stroke="#0c4a6e"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bridge pillars */}
      <rect x="18" y="36" width="3" height="12" rx="1.5" fill="#0c4a6e" />
      <rect x="43" y="36" width="3" height="12" rx="1.5" fill="#0c4a6e" />
      {/* Road surface */}
      <rect x="12" y="46" width="40" height="3" rx="1.5" fill="#0c4a6e" />
      {/* Upward graph line */}
      <path
        d="M22 34l6-6 4 3 8-10"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Graph arrow tip */}
      <path d="M38 19l3 2-3 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Token circles */}
      <circle cx="32" cy="14" r="3.5" fill="#10b981" opacity="0.8" />
      <circle cx="26" cy="17" r="2" fill="#0ea5e9" opacity="0.6" />
      <circle cx="38" cy="17" r="2" fill="#0ea5e9" opacity="0.6" />
    </svg>
  );
}

function InfraBondXTextLogo({ height = 28 }: { height?: number }) {
  const w = height * 6;
  return (
    <svg width={w} height={height} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="30" fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif" fontWeight="700" fontSize="28" fill="#0c4a6e" letterSpacing="-0.5">
        Infra
      </text>
      <text x="72" y="30" fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif" fontWeight="700" fontSize="28" fill="#10b981" letterSpacing="-0.5">
        Bond
      </text>
      <text x="138" y="30" fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif" fontWeight="800" fontSize="28" fill="#0c4a6e" letterSpacing="-0.5">
        X
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED HOOKS & HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════ */

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [isPageReady, setIsPageReady] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [heroTextVisible, setHeroTextVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsPageReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY;
        setIsScrolled(y > 8);
        setScrollY(y);
        rafId = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  /* ── Hero carousel slides ──────────────────────────────────────── */
  const heroSlides = [
    {
      img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh78H6hm3Guutgr55uvXMCPMVYFGqU0LPB7PcjZrp7BfHmT1u_vXXDYrP3h3wB_ETFNPwGILcZ_clycioCSJf9q8qoG1Pspv1ieDJ81IK-CaaD_O4FXhwakAqodwazse_WH4d0dslSNFJIt/w640-h360/55576-infrastructure-bridge-dna.jpg",
      title: "Invest in India's Highways",
      sub: "Support expansion of strategic highway corridors connecting growth centers across India.",
    },
    {
      img: "https://t4.ftcdn.net/jpg/10/24/64/71/240_F_1024647142_ir46cbPjvRaFZBXiVPfmsQvLMRCViqmw.jpg",
      title: "Back Delhi Metro Expansion",
      sub: "Enable faster, cleaner urban mobility with milestone-based funding for metro networks.",
    },
    {
      img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80",
      title: "Build Smart Cities Together",
      sub: "Fund digital-first civic systems for water, mobility, safety, and energy in new smart districts.",
    },
    {
      img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80",
      title: "Power India's Solar Future",
      sub: "Accelerate utility-scale and distributed solar infrastructure through transparent public investing.",
    },
    {
      img: "https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=1920&q=80",
      title: "Scale Mumbai Coastal Connectivity",
      sub: "Participate in resilient coastal road and bridge networks that reduce congestion and fuel growth.",
    },
  ];
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setHeroTextVisible(false);
    const t = window.setTimeout(() => setHeroTextVisible(true), 90);
    return () => window.clearTimeout(t);
  }, [heroIdx]);

  /* ── Ticker data ───────────────────────────────────────────────── */
  const tickerItems = [
    { label: "Infrastructure Index", value: "▲ 2.4%", color: "text-emerald-400" },
    { label: "Projects Funded", value: "₹250Cr", color: "text-sky-300" },
    { label: "Retail Investors", value: "12,000+", color: "text-amber-300" },
    { label: "CO₂ Reduction", value: "18,500 T", color: "text-emerald-400" },
    { label: "Avg ROI", value: "11.8%", color: "text-sky-300" },
    { label: "Active Projects", value: "43", color: "text-amber-300" },
    { label: "Bond Maturity", value: "18-36 mo", color: "text-emerald-400" },
    { label: "Min Investment", value: "₹100", color: "text-sky-300" },
  ];

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        opacity: isPageReady ? 1 : 0,
        transform: isPageReady ? "scale(1)" : "scale(0.985)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
      }}
    >
      {/* ═══ SECTION 0 — NAVBAR ═══════════════════════════════════ */}
      <nav className={`border-b sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_10px_35px_rgba(15,23,42,0.12)] border-slate-200/70"
          : "bg-white/85 backdrop-blur-md shadow-sm border-slate-200/60"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <InfraBondXLogo size={42} />
            <InfraBondXTextLogo height={26} />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              className="hover:text-primary transition-colors"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              How It Works
            </button>
            <button
              className="hover:text-primary transition-colors"
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              Projects
            </button>
            <button
              className="hover:text-primary transition-colors"
              onClick={() => document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Impact
            </button>
            <button
              className="hover:text-primary transition-colors"
              onClick={() => document.getElementById("trust")?.scrollIntoView({ behavior: "smooth" })}
            >
              Trust
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-primary font-medium transition-all duration-300 hover:scale-[1.03] hover:shadow-md"
              onClick={() => onNavigate("role-select")}
            >
              Sign In
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
              onClick={() => onNavigate("role-select")}
            >
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══ SECTION 1 — HERO CAROUSEL BANNER ═══════════════════ */}
      <section className="relative h-[66vh] min-h-[460px] max-h-[720px] flex items-center overflow-hidden">
        {/* Carousel background images */}
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-cover bg-center transition-[opacity,transform] duration-[1200ms] ease-in-out will-change-transform"
            style={{
              backgroundImage: `url('${slide.img}')`,
              opacity: i === heroIdx ? 1 : 0,
              transform: i === heroIdx ? `scale(1.05) translateY(${Math.min(scrollY * 0.12, 44)}px)` : "scale(1)",
            }}
          />
        ))}
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.88)_8%,rgba(12,74,110,0.78)_45%,rgba(15,23,42,0.56)_100%)]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.16),transparent_42%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 mb-6">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">National Infrastructure Investment Initiative</span>
            </div>

            {/* Animated headline from current slide */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] mb-4 tracking-tight"
              style={{
                opacity: heroTextVisible ? 1 : 0,
                transform: heroTextVisible ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.65s ease, transform 0.65s ease",
              }}
            >
              {heroSlides[heroIdx].title}
            </h1>
            <p
              className="text-base md:text-lg text-white/80 leading-relaxed mb-8 max-w-2xl"
              style={{
                opacity: heroTextVisible ? 1 : 0,
                transform: heroTextVisible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.6s ease 0.12s, transform 0.6s ease 0.12s",
              }}
            >
              {heroSlides[heroIdx].sub}
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap items-center gap-4 mb-8"
              style={{
                opacity: heroTextVisible ? 1 : 0,
                transform: heroTextVisible ? "scale(1)" : "scale(0.92)",
                transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
              }}
            >
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 text-base px-7 py-5 h-auto transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_16px_35px_rgba(16,185,129,0.45)]"
                onClick={() => onNavigate("role-select")}
              >
                Explore Projects <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 text-base px-7 py-5 h-auto transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                onClick={() => onNavigate("role-select")}
              >
                Become an Issuer <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 text-white/80">
              {[
                { icon: ShieldCheck, label: "Government Aligned" },
                { icon: Lock, label: "Escrow Protected" },
                { icon: Eye, label: "Transparent Funding" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <b.icon className="w-4 h-4 text-emerald-400" />
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === heroIdx ? "w-8 bg-emerald-400" : "w-3 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        {/* Nav arrows */}
        <button
          onClick={() => setHeroIdx((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur hover:bg-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setHeroIdx((i) => (i + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur hover:bg-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* ═══ SECTION 2 — MARKET TICKER ═══════════════════════════ */}
      <div className="bg-[#0f172a] border-y border-white/10 overflow-hidden relative">
        {/* Live indicator */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-[#0f172a] pr-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
        </div>
        <div className="flex animate-ticker whitespace-nowrap py-3 pl-20">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 px-6 shrink-0">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
              <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              <span className="text-slate-700 text-xs">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SECTION 3 — GOV INFO BAR ════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#0c4a6e] to-[#075985] py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-xs md:text-sm text-white/90 font-medium">
          <span className="flex items-center gap-2"><Landmark className="w-3.5 h-3.5 text-amber-300" /> National Infrastructure Investment Initiative</span>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-emerald-300" /> SDG 9: Industry, Innovation & Infrastructure</span>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-sky-300" /> Public Participation in Infrastructure Finance</span>
        </div>
      </div>

      {/* ═══ SECTION 4 — GOV UPDATES + PROJECT CATEGORIES ════════ */}
      <section id="projects" className="relative py-20 px-6 bg-gradient-to-b from-slate-50 to-slate-100/60">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* LEFT — Live Infrastructure Updates */}
          <FadeIn>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#0c4a6e] to-[#075985]">
                <Newspaper className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-white text-base">Infrastructure Updates</h3>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Live</span>
                </span>
              </div>
              {/* Scrolling updates */}
              <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[380px]">
                {[
                  { text: "Delhi Metro Phase 4 funding milestone approved", time: "2 hours ago", icon: TrainFront, color: "text-sky-600 bg-sky-50" },
                  { text: "Mumbai Coastal Road project crosses 60% completion", time: "4 hours ago", icon: Route, color: "text-emerald-600 bg-emerald-50" },
                  { text: "Solar infrastructure bonds open for retail participation", time: "6 hours ago", icon: Sun, color: "text-amber-600 bg-amber-50" },
                  { text: "Smart City infrastructure tokens launched for 12 cities", time: "8 hours ago", icon: Cpu, color: "text-violet-600 bg-violet-50" },
                  { text: "Highway corridor development funding milestone verified", time: "12 hours ago", icon: Route, color: "text-emerald-600 bg-emerald-50" },
                  { text: "Bengaluru metro extension bond reaches ₹45Cr target", time: "1 day ago", icon: TrainFront, color: "text-sky-600 bg-sky-50" },
                  { text: "Renewable energy fund shows 14.2% projected ROI", time: "1 day ago", icon: Sun, color: "text-amber-600 bg-amber-50" },
                  { text: "Chennai smart water project escrow release approved", time: "2 days ago", icon: Cpu, color: "text-violet-600 bg-violet-50" },
                ].map((update, i) => (
                  <div key={i} className="flex items-start gap-3 px-6 py-3.5 hover:bg-slate-50/80 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 hover:shadow-sm">
                    <div className={`w-8 h-8 rounded-lg ${update.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <update.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-medium leading-snug group-hover:text-[#0c4a6e] transition-colors">{update.text}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{update.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 mt-1 shrink-0 group-hover:text-slate-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* RIGHT — Infrastructure Categories */}
          <FadeIn delay={0.15}>
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Infrastructure That Transforms India</h3>
                <p className="text-sm text-slate-500">Explore real categories of infrastructure projects open for retail investment</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 content-start">
                {[
                  { icon: Route, title: "Highways", desc: "12,000 km national upgrades", color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
                  { icon: TrainFront, title: "Metro Rail", desc: "Transit for 25 cities", color: "from-sky-500 to-blue-600", bg: "bg-sky-50", iconColor: "text-sky-600" },
                  { icon: Cpu, title: "Smart Cities", desc: "100 urban modernizations", color: "from-violet-500 to-purple-600", bg: "bg-violet-50", iconColor: "text-violet-600" },
                  { icon: Sun, title: "Renewable Energy", desc: "50 GW solar target", color: "from-amber-500 to-orange-600", bg: "bg-amber-50", iconColor: "text-amber-600" },
                  { icon: Building2, title: "Urban Infra", desc: "Bridges & flyovers", color: "from-rose-500 to-pink-600", bg: "bg-rose-50", iconColor: "text-rose-600" },
                  { icon: Globe, title: "Water & Sanitation", desc: "Clean water access", color: "from-cyan-500 to-teal-600", bg: "bg-cyan-50", iconColor: "text-cyan-600" },
                ].map((cat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                    <div className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <cat.icon className={`w-5 h-5 ${cat.iconColor}`} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-0.5">{cat.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 5 — PLATFORM STATISTICS ═════════════════════ */}
      <section className="relative py-24 px-6 bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Platform at a Glance</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Trusted by Thousands, Backed by Data
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, value: "₹8.7T", label: "Infrastructure Demand", color: "from-sky-500 to-blue-600" },
              { icon: Building2, value: "43", label: "Active Projects", color: "from-emerald-500 to-teal-600" },
              { icon: Coins, value: "₹250Cr", label: "Capital Mobilized", color: "from-amber-500 to-orange-600" },
              { icon: Users, value: "12,000+", label: "Retail Investors", color: "from-violet-500 to-purple-600" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] p-6 text-center group overflow-hidden">
                  {/* Gradient top accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.color}`} />
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-105 transition-transform`}>
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{s.value}</p>
                  <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6 — HOW IT WORKS ════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 px-6 bg-gradient-to-b from-slate-50 to-slate-100/70">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Step-by-Step</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                How the Platform Works
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Simple, transparent, and secure infrastructure financing in 4 steps
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-0 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {[
              { step: "01", icon: LineChart, title: "Choose Infrastructure Project", desc: "Browse verified infrastructure projects with transparent risk ratings, ROI projections, and milestone tracking.", color: "bg-sky-500" },
              { step: "02", icon: Coins, title: "Invest Small Amount", desc: "Invest as low as ₹100 through InfraTokens — regulated fractional bonds, not cryptocurrency.", color: "bg-emerald-500" },
              { step: "03", icon: Lock, title: "Escrow Secures Funds", desc: "Your funds are locked in milestone-based escrow, released only after independent verification.", color: "bg-amber-500" },
              { step: "04", icon: Eye, title: "Track Construction Progress", desc: "Monitor real-time photos, drone footage, audit proofs, and earn returns upon completion.", color: "bg-violet-500" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center px-4 relative">
                  {/* Step number circle */}
                  <div className={`w-24 h-24 rounded-full ${s.color} flex items-center justify-center mb-6 shadow-lg relative z-10 ring-4 ring-white`}>
                    <div className="text-center">
                      <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider block">Step</span>
                      <span className="text-white text-2xl font-extrabold">{s.step}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7 — TRUST & GOVERNANCE ══════════════════════ */}
      <section id="trust" className="relative py-24 px-6 bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Governance Framework</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Built on Trust & Transparency
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Every layer designed for accountability and investor protection
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Verified Issuers", desc: "Only government bodies and verified PPP companies can list projects after rigorous KYC verification.", gradient: "from-sky-500 to-blue-600" },
              { icon: FileCheck, title: "Milestone Verification", desc: "Every milestone requires documentary proof — photos, invoices, third-party audit reports.", gradient: "from-emerald-500 to-teal-600" },
              { icon: Lock, title: "Escrow Protected Funds", desc: "Funds unlock automatically only when independent authorities verify milestone completion.", gradient: "from-amber-500 to-orange-600" },
              { icon: Zap, title: "Blockchain-ready Audit Trail", desc: "Tamper-proof, automated, transparent fund flow with complete digital audit trail.", gradient: "from-violet-500 to-purple-600" },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <Card className="border border-slate-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] group h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8 — INVESTOR BENEFITS ═══════════════════════ */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 to-sky-50/30">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/70 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Why Invest</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Benefits for Every Citizen-Investor
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Coins, title: "Invest from ₹100", desc: "No ₹1 Lakh minimums. Fractional tokenized bonds make infrastructure investment accessible to all.", accent: "bg-emerald-500" },
              { icon: Eye, title: "Transparent Milestones", desc: "Track every rupee through auditable milestones with photographic proof and third-party verification.", accent: "bg-sky-500" },
              { icon: BarChart3, title: "Real-time Monitoring", desc: "Live dashboards with drone footage, construction timelines, and progress analytics.", accent: "bg-amber-500" },
              { icon: Gift, title: "Civic Rewards", desc: "Earn toll discounts, travel credits, green energy perks, and city-specific benefits when projects complete.", accent: "bg-violet-500" },
            ].map((b, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] h-full">
                  <div className={`w-11 h-11 rounded-lg ${b.accent} flex items-center justify-center mb-4 shadow-md`}>
                    <b.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 9 — PROJECT IMPACT METRICS ══════════════════ */}
      <section id="impact" className="relative py-24 px-6 bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full text-emerald-700 mb-4">
                <Leaf className="w-4 h-4" />
                <span className="text-sm font-semibold">SDG 9: Industry, Innovation & Infrastructure</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Real Impact, Measurable Change
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Your investment creates tangible infrastructure and economic growth
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { icon: BriefcaseBusiness, value: "2,450+", label: "Jobs Created", color: "text-sky-600", bg: "bg-sky-50" },
              { icon: MapPin, value: "127 KM", label: "Roads Built", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Leaf, value: "18,500 T", label: "CO₂ Reduced", color: "text-teal-600", bg: "bg-teal-50" },
              { icon: Building2, value: "12", label: "Cities Developed", color: "text-violet-600", bg: "bg-violet-50" },
            ].map((m, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className={`${m.bg} rounded-2xl p-8 text-center border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]`}>
                  <m.icon className={`w-8 h-8 ${m.color} mx-auto mb-3`} />
                  <p className={`text-3xl md:text-4xl font-extrabold ${m.color} mb-1`}>{m.value}</p>
                  <p className="text-sm text-slate-600 font-medium">{m.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* CTA Banner */}
          <FadeIn delay={0.2}>
            <div className="mt-16 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c4a6e] to-[#075985] p-10 md:p-14 text-center shadow-xl">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20h20v20H20zM0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
              <div className="relative z-10">
                <Award className="w-10 h-10 text-amber-300 mx-auto mb-4" />
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to Build India's Future?
                </h3>
                <p className="text-white/85 mb-8 max-w-2xl mx-auto text-lg">
                  Join thousands of retail investors participating in transparent, milestone-verified
                  infrastructure financing. Start with as little as ₹100.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 text-base px-8 py-6 h-auto transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_16px_35px_rgba(16,185,129,0.45)]"
                    onClick={() => onNavigate("role-select")}
                  >
                    Start Investing Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-base px-8 py-6 h-auto transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                    onClick={() => onNavigate("role-select")}
                  >
                    Register as Issuer
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 10 — PROFESSIONAL FOOTER ════════════════════ */}
      <footer className="bg-[#0f172a] text-white">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500" />

        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <InfraBondXLogo size={38} />
                <div>
                  <span className="text-lg font-bold">InfraBondX</span>
                  <span className="block text-xs text-slate-400 -mt-0.5">Infrastructure Investment Platform</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4 max-w-sm">
                Democratizing infrastructure finance through tokenization and transparency.
                Bridging the gap between retail investors and nation-building projects.
              </p>
              <div className="flex gap-3">
                {["SDG 9", "ESG", "SEBI"].map((badge) => (
                  <span key={badge} className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded uppercase tracking-wider text-slate-300">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-300">Platform</h4>
              <ul className="space-y-2.5">
                {["Projects", "Issuer Portal", "How It Works", "Documentation"].map((l) => (
                  <li key={l} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-600" />{l}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-300">Legal</h4>
              <ul className="space-y-2.5">
                {["Terms of Service", "Privacy Policy", "Risk Disclosure", "Compliance"].map((l) => (
                  <li key={l} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-600" />{l}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-300">Disclaimer</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This is a hackathon MVP simulation. No real money or financial transactions are
                involved. Tokens represent fractional ownership of regulated bonds, NOT
                cryptocurrency. Not meant for collecting PII or securing sensitive data.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 InfraBondX. Hackathon MVP Demo.
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span>Infrastructure Investment Initiative</span>
              <span className="text-slate-700">|</span>
              <span>SDG 9 Aligned</span>
              <span className="text-slate-700">|</span>
              <span>ESG Compliant</span>
            </div>
          </div>
        </div>
      </footer>

      <button
        onClick={() => onNavigate("role-select")}
        className="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-emerald-600 hover:shadow-[0_20px_45px_rgba(16,185,129,0.5)] animate-bounce [animation-duration:2.8s]"
        aria-label="Start Investing"
      >
        Start Investing <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

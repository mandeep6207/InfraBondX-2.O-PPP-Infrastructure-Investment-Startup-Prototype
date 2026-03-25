import { useState } from "react";
import { ArrowLeft, Mail, Lock, Users, Building2, ShieldCheck, Fingerprint, LogIn } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAuth, UserRole } from "@/contexts/AuthContext";

/* ── Inline brand logo (matches LandingPage) ──────────────────── */
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

interface LoginPageProps {
  role: UserRole;
  onBack: () => void;
  onLoginSuccess: () => void;
}

const demoCredentials: Record<UserRole, { email: string; password: string; label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  investor: {
    email: "investor@infrabondx.com",
    password: "investor123",
    label: "Investor",
    icon: Users,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  },
  issuer: {
    email: "issuer@infrabondx.com",
    password: "issuer123",
    label: "Project Developer",
    icon: Building2,
    color: "text-sky-700",
    bgColor: "bg-sky-50 border-sky-200 hover:bg-sky-100",
  },
  admin: {
    email: "admin@infrabondx.com",
    password: "admin123",
    label: "Platform",
    icon: ShieldCheck,
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
};

export function LoginPage({ role, onBack, onLoginSuccess }: LoginPageProps) {
  const demo = demoCredentials[role];
  const [loginMode, setLoginMode] = useState<"quick" | "secure">(
    localStorage.getItem("login_mode") === "secure" ? "secure" : "quick"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();

  const doLogin = async (emailVal: string, passwordVal: string) => {
    setErrorMsg("");
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal, password: passwordVal }),
      });
      const data = await res.json();
      if (!res.ok || !data?.token || !data?.user) {
        setErrorMsg(data?.error || "Login failed");
        return;
      }
      if (role === "investor") {
        localStorage.setItem("login_mode", loginMode);
      }
      login(data.user, data.token);
      onLoginSuccess();
    } catch {
      setErrorMsg("Server not reachable. Please start backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    doLogin(email, password);
  };

  const handleDemoLogin = (cred: { email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
    doLogin(cred.email, cred.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0c4a6e] to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 mb-4 text-sm"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>

        <Card className="border-0 shadow-2xl shadow-black/20 bg-white/[0.97] backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Brand header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <InfraBondXLogo size={36} />
                <span className="text-xl font-bold tracking-tight text-slate-900">InfraBondX</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Access Platform</h2>
              <p className="text-sm text-slate-500">Secure infrastructure investment portal</p>
            </div>

            {/* One-click demo login */}
            {role === "investor" && (
              <div className="mb-5 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-xs font-semibold text-slate-700 mb-2">Login Mode</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginMode("quick")}
                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                      loginMode === "quick"
                        ? "bg-[#0c4a6e] text-white border-[#0c4a6e]"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Quick Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode("secure")}
                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors ${
                      loginMode === "secure"
                        ? "bg-[#0c4a6e] text-white border-[#0c4a6e]"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Full Secure
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {loginMode === "quick"
                    ? "Quick mode signs in directly (default)."
                    : "Secure mode requires KYC after login."}
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Quick Demo Access</span>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin(demo)}
                disabled={loading}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${demo.bgColor} group`}
              >
                <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center`}>
                  <demo.icon className={`w-5 h-5 ${demo.color}`} />
                </div>
                <div className="text-left flex-1">
                  <p className={`font-semibold text-sm ${demo.color}`}>Login as {demo.label}</p>
                  <p className="text-xs text-slate-500">{demo.email}</p>
                </div>
                <LogIn className={`w-4 h-4 ${demo.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              </button>

              {/* Other role quick access */}
              <div className="flex gap-2 mt-2">
                {(Object.keys(demoCredentials) as UserRole[])
                  .filter((r) => r !== role)
                  .map((r) => {
                    const c = demoCredentials[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleDemoLogin(c)}
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${c.bgColor} ${c.color}`}
                      >
                        <c.icon className="w-3.5 h-3.5" />
                        {c.label}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 uppercase tracking-wider font-medium">or sign in manually</span>
              </div>
            </div>

            {/* Manual login form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-slate-200 focus:border-[#0c4a6e] focus:ring-[#0c4a6e]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 border-slate-200 focus:border-[#0c4a6e] focus:ring-[#0c4a6e]/20"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-[#0c4a6e] hover:bg-[#0a3d5c] text-white font-medium"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                This is a hackathon demo · No real financial transactions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

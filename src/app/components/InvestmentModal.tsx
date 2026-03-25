import { useMemo, useState } from "react";
import { X, Coins, CheckCircle, Loader2, Shield, Lock, ChevronRight, AlertCircle, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { apiPost, apiGet } from "@/app/services/api";
import { sendInvestmentEmail } from "@/utils/emailService";
import { toast } from "sonner";

/* ──────────────────── Brand Logo SVGs ──────────────────── */

function VisaLogo({ className = "h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="500" rx="40" fill="#1A1F71"/>
      <path d="M293.2 348.7l33.4-195.7h53.4l-33.4 195.7H293.2zM540.7 157.3c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.6-.3 28.1 26.5 43.8 46.8 53.2 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-32 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.6 10.2 59.6 10.5 56.2 0 92.6-26.3 93-66.8.2-22.3-14-39.3-44.8-53.3-18.6-9.1-30-15.1-29.9-24.3 0-8.1 9.7-16.8 30.5-16.8 17.4-.3 30 3.5 39.8 7.5l4.8 2.2 7.3-42.4zM641.3 153h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.4 179.4h56.2s9.2-24.1 11.3-29.4h68.6c1.6 6.9 6.5 29.4 6.5 29.4h49.7l-43.6-195.7zm-65.8 126.1c4.4-11.3 21.4-54.7 21.4-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.5 56.5h-44.6zM232.8 153l-52.4 133.4-5.6-27.1c-9.7-31.3-40-65.2-73.9-82.2l47.9 171.4 56.6-.1 84.2-195.5h-56.8z" fill="white"/>
      <path d="M131.9 153H46.5l-.7 4c67.2 16.2 111.7 55.4 130.1 102.5L157.6 170c-3.2-12.3-12.7-16.3-25.7-17z" fill="#F9A533"/>
    </svg>
  );
}

function MastercardLogo({ className = "h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="500" rx="40" fill="#252525"/>
      <circle cx="310" cy="250" r="150" fill="#EB001B"/>
      <circle cx="470" cy="250" r="150" fill="#F79E1B"/>
      <path d="M390 130.7c35.8 28.5 58.8 72.4 58.8 121.3s-23 92.8-58.8 121.3c-35.8-28.5-58.8-72.4-58.8-121.3s23-92.8 58.8-121.3z" fill="#FF5F00"/>
    </svg>
  );
}

function RuPayLogo({ className = "h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="500" rx="40" fill="white" stroke="#ddd" strokeWidth="2"/>
      <text x="390" y="235" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="100" fontWeight="bold" fill="#097A44">Ru</text>
      <text x="390" y="335" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="100" fontWeight="bold" fill="#F37021">Pay</text>
    </svg>
  );
}

function UPILogo({ className = "h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="200" rx="20" fill="white" stroke="#ddd" strokeWidth="2"/>
      <text x="250" y="125" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="90" fontWeight="bold" fill="#4CAF50">U</text>
      <text x="310" y="125" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="90" fontWeight="bold" fill="#FF9800">P</text>
      <text x="370" y="125" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="90" fontWeight="bold" fill="#2196F3">I</text>
      <path d="M80 85 L135 55 L135 145 L80 115 Z" fill="#4CAF50"/>
      <path d="M110 75 L165 45 L165 135 L110 105 Z" fill="#FF9800"/>
    </svg>
  );
}

function GPay({ className = "h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="80" rx="12" fill="white" stroke="#eee" strokeWidth="1"/>
      <circle cx="35" cy="40" r="14" fill="#4285F4"/>
      <text x="60" y="50" fontFamily="Arial,sans-serif" fontSize="28" fontWeight="bold" fill="#5F6368">Pay</text>
    </svg>
  );
}

function PhonePeIcon({ className = "h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="80" rx="12" fill="#5F259F"/>
      <text x="100" y="50" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="bold" fill="white">PhonePe</text>
    </svg>
  );
}

function PaytmIcon({ className = "h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="80" rx="12" fill="#00BAF2"/>
      <text x="100" y="50" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="bold" fill="white">Paytm</text>
    </svg>
  );
}

function BankIcon({ className = "h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#f0f4f8"/>
      <path d="M32 8L6 22h52L32 8z" fill="#1e40af"/>
      <rect x="12" y="24" width="6" height="24" rx="1" fill="#3b82f6"/>
      <rect x="22" y="24" width="6" height="24" rx="1" fill="#3b82f6"/>
      <rect x="36" y="24" width="6" height="24" rx="1" fill="#3b82f6"/>
      <rect x="46" y="24" width="6" height="24" rx="1" fill="#3b82f6"/>
      <rect x="8" y="48" width="48" height="6" rx="2" fill="#1e40af"/>
      <circle cx="32" cy="16" r="3" fill="#fbbf24"/>
    </svg>
  );
}

function WalletIcon({ className = "h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#f0fdf4"/>
      <rect x="8" y="16" width="48" height="36" rx="6" fill="#059669" />
      <rect x="36" y="28" width="20" height="12" rx="4" fill="#34d399"/>
      <circle cx="46" cy="34" r="3" fill="white"/>
      <path d="M12 16 L12 12 L48 12 C50 12 52 14 52 16" stroke="#059669" strokeWidth="3" fill="none"/>
    </svg>
  );
}

/* ──────────────── Utility: format card number ──────────────── */
function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

interface InvestmentModalProps {
  project: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function InvestmentModal({ project, onClose, onSuccess }: InvestmentModalProps) {
  const [step, setStep] = useState<"input" | "confirm" | "payment" | "processing" | "success">("input");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [amount, setAmount] = useState<string>("1000");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [txHash, setTxHash] = useState<string>("0x7f9a...4b3c");
  const [tokensIssued, setTokensIssued] = useState<number>(0);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [totalPayable, setTotalPayable] = useState<number>(0);

  // Payment form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState(0);

  const token = localStorage.getItem("token") || "";

  // ✅ FIX: Support Backend + UI both
  const safeTokenPrice = Number(project?.token_price ?? project?.tokenPrice ?? 100);
  const safeROI = Number(project?.roi_percent ?? project?.roi ?? 0);

  // ✅ Backend tenure is months, UI sometimes gives years
  const safeTenure = Number(
    project?.tenure_months
      ? Math.max(1, Math.round(Number(project.tenure_months) / 12))
      : project?.tenure ?? 1
  );

  const tokens = useMemo(() => {
    const amt = Number(amount || 0);
    if (!safeTokenPrice || safeTokenPrice <= 0) return 0;
    return Math.floor(amt / safeTokenPrice);
  }, [amount, safeTokenPrice]);

  const expectedReturn = useMemo(() => {
    const amt = Number(amount || 0);

    // ✅ FIX: now expected return respects tenure years too (Compound)
    const years = Number(safeTenure || 1);
    const roi = Number(safeROI || 0) / 100;

    // compound interest (demo)
    return amt * Math.pow(1 + roi, years);
  }, [amount, safeROI, safeTenure]);

  const calculatedPlatformFee = useMemo(() => {
    return Number((Number(amount || 0) * 0.01).toFixed(2));
  }, [amount]);

  const calculatedTotalPayable = useMemo(() => {
    return Number((Number(amount || 0) + calculatedPlatformFee).toFixed(2));
  }, [amount, calculatedPlatformFee]);

  const backendProjectId = useMemo(() => {
    const raw = project?.id;

    if (typeof raw === "number") return raw;

    const str = String(raw || "").trim();

    if (/^\d+$/.test(str)) return Number(str);

    const match = str.match(/\d+/);
    if (match) return Number(match[0]);

    return 1;
  }, [project?.id]);

  const handleInvest = () => {
    if (!acceptedTerms) return;
    setStep("confirm");
  };

  const handleProceedToPayment = async () => {
    // Fetch wallet balance when moving to payment step
    try {
      const me = await apiGet("/auth/me", token);
      if (me?.wallet_balance !== undefined) {
        setWalletBalance(Number(me.wallet_balance));
      }
    } catch {
      // silently continue
    }
    setStep("payment");
  };

  const isPaymentFormValid = () => {
    const amt = Number(amount);
    if (paymentMethod === "card") {
      return cardNumber.replace(/\s/g, "").length === 16 && cardExpiry.length >= 4 && cardCvv.length >= 3 && cardName.length >= 2;
    }
    if (paymentMethod === "upi") {
      return upiId.includes("@") && upiId.length >= 5;
    }
    if (paymentMethod === "netbanking") {
      return selectedBank.length > 0;
    }
    if (paymentMethod === "wallet") {
      return walletBalance >= amt;
    }
    return false;
  };

  const handleConfirm = async () => {
    try {
      setStep("processing");
      setProcessingStage(0);

      // Stage 1: Validating
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStage(1);

      // Stage 2: Processing
      await new Promise((r) => setTimeout(r, 1000));
      setProcessingStage(2);

      if (!token) {
        alert("Unauthorized. Please login again.");
        setStep("input");
        return;
      }

      const investAmount = Number(amount);

      if (!backendProjectId || Number.isNaN(backendProjectId)) {
        alert("Invalid project id.");
        setStep("input");
        return;
      }

      if (!investAmount || investAmount < safeTokenPrice) {
        alert(`Amount too low. Minimum ₹${safeTokenPrice}`);
        setStep("input");
        return;
      }

      // Stage 3: Calling backend
      setProcessingStage(3);

      const res = await apiPost(
        "/investor/invest",
        {
          project_id: backendProjectId,
          amount: investAmount,
          payment_method: paymentMethod,
        },
        token
      );

      if (res?.error || (res?.status && res.status !== "success")) {
        alert(res.error || "Investment failed");
        setStep("input");
        return;
      }

      // Stage 4: Success
      setProcessingStage(4);
      await new Promise((r) => setTimeout(r, 600));

      setTxHash(res?.tx_hash || "0x7f9a...4b3c");
      setTokensIssued(Number(res?.tokens_minted ?? res?.tokens_issued ?? tokens));
      setPlatformFee(Number(res?.platform_fee ?? calculatedPlatformFee));
      setTotalPayable(Number(res?.total_amount ?? calculatedTotalPayable));

      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const emailResult = await sendInvestmentEmail({
        user_name: parsedUser?.name || "Investor",
        project_name: project?.title || project?.name || "InfraBondX Project",
        amount: Number(res?.amount_invested ?? investAmount),
        tokens: Number(res?.tokens_minted ?? res?.tokens_issued ?? tokens),
        roi: safeROI,
        rewards: "Infra points and partner benefits",
        to_email: parsedUser?.email || "investor@infrabondx.com",
      });

      if (emailResult.success) {
        toast.success("📩 Investment email sent");
      } else {
        toast.error("Investment email failed", {
          description: emailResult.error || "Please verify EmailJS template IDs",
        });
      }

      setStep("success");
    } catch {
      alert("Investment failed. Backend not responding.");
      setStep("input");
    }
  };

  const handleSuccess = () => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {step === "input" && "Invest in Project"}
              {step === "confirm" && "Confirm Investment"}
              {step === "payment" && "Select Payment Method"}
              {step === "processing" && "Processing Transaction"}
              {step === "success" && "Investment Successful!"}
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded-full transition-colors"
              disabled={step === "processing"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Input Step */}
          {step === "input" && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">{project?.title || project?.name}</h4>
                <p className="text-sm text-muted-foreground">{project?.location}</p>
              </div>

              <div>
                <label className="text-sm mb-2 block">Investment Amount (₹)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={safeTokenPrice}
                  step={safeTokenPrice}
                  placeholder="Enter amount"
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum: ₹{safeTokenPrice}</p>
              </div>

              {/* Quick Select */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="px-3 py-2 border rounded-md hover:border-primary hover:bg-accent transition-colors text-sm"
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              {/* Investment Preview */}
              <div className="p-4 bg-accent rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tokens Received</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="font-medium">{tokens}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ROI</span>
                  <span className="font-medium text-[#10b981]">{safeROI}% p.a.</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tenure</span>
                  <span className="font-medium">{safeTenure} years</span>
                </div>

                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-sm">Expected Return</span>
                  <span className="text-lg font-semibold text-[#10b981]">
                    ₹{expectedReturn.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-muted-foreground">
                  I understand that this investment carries risk and returns are not guaranteed. I
                  have read the risk disclosure and project documents. This is a demo simulation
                  with no real money.
                </span>
              </label>

              <Button
                className="w-full"
                size="lg"
                onClick={handleInvest}
                disabled={!acceptedTerms || Number(amount) < safeTokenPrice}
              >
                Continue to Confirm
              </Button>
            </div>
          )}

          {/* Confirm Step */}
          {step === "confirm" && (
            <div className="space-y-6">
              <div className="p-4 bg-accent rounded-lg space-y-3">
                <h4 className="font-medium">Transaction Summary</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project</span>
                    <span className="font-medium text-right max-w-xs truncate">
                      {project?.title || project?.name}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Amount</span>
                    <span className="font-medium">₹{Number(amount).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (1%)</span>
                    <span className="font-medium">₹{calculatedPlatformFee.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Payable</span>
                    <span className="font-semibold">₹{calculatedTotalPayable.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-medium">{tokens} InfraTokens</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Return</span>
                    <span className="font-medium text-[#10b981]">
                      ₹{expectedReturn.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0ea5e9]/10 rounded-lg text-sm">
                <p className="text-foreground">
                  <strong>Simulated Blockchain Transaction:</strong> Your funds will be locked in
                  escrow and released to the issuer only after milestone verification. This is a
                  demo - no real money is involved.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleProceedToPayment}>
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Payment Step — Full Payment Gateway */}
          {step === "payment" && (
            <div className="space-y-5">
              {/* Amount Bar */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Payable (incl. fee)</span>
                </div>
                <span className="text-xl font-bold">₹{calculatedTotalPayable.toLocaleString("en-IN")}</span>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted rounded-lg">
                {[
                  { key: "card", label: "Card" },
                  { key: "upi", label: "UPI" },
                  { key: "netbanking", label: "Banking" },
                  { key: "wallet", label: "Wallet" },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    className={`py-2 px-1 rounded-md text-xs font-semibold transition-all ${
                      paymentMethod === m.key
                        ? "bg-white shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* ─── Credit / Debit Card ─── */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  {/* Card brand logos */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">We accept</span>
                    <div className="flex items-center gap-2">
                      <VisaLogo className="h-6 w-auto rounded" />
                      <MastercardLogo className="h-6 w-auto rounded" />
                      <RuPayLogo className="h-6 w-auto rounded" />
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div className="relative h-44 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-5 text-white shadow-lg">
                    <div className="absolute top-4 right-4">
                      {cardNumber.startsWith("4") ? (
                        <VisaLogo className="h-8 w-auto opacity-90" />
                      ) : cardNumber.startsWith("5") || cardNumber.startsWith("2") ? (
                        <MastercardLogo className="h-8 w-auto opacity-90" />
                      ) : (
                        <div className="text-xs opacity-60 font-mono">CARD</div>
                      )}
                    </div>
                    {/* Chip */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 mt-2 mb-4" />
                    <div className="font-mono text-lg tracking-[0.2em] mb-4">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[9px] opacity-60 uppercase">Card Holder</div>
                        <div className="text-sm font-medium tracking-wide">
                          {cardName || "YOUR NAME"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] opacity-60 uppercase">Expires</div>
                        <div className="text-sm font-mono">{cardExpiry || "MM/YY"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Card Number</label>
                      <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Cardholder Name</label>
                      <Input
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Expiry</label>
                        <Input
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">CVV</label>
                        <Input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                          maxLength={4}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── UPI ─── */}
              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Pay via</span>
                    <UPILogo className="h-7 w-auto" />
                  </div>

                  {/* UPI Apps */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Google Pay", component: <GPay className="h-7 w-auto" /> },
                      { name: "PhonePe", component: <PhonePeIcon className="h-7 w-auto" /> },
                      { name: "Paytm", component: <PaytmIcon className="h-7 w-auto" /> },
                    ].map((app) => (
                      <button
                        key={app.name}
                        onClick={() => setUpiId(app.name.toLowerCase().replace(/\s/g, "") + "@upi")}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all hover:shadow-sm ${
                          upiId.startsWith(app.name.toLowerCase().replace(/\s/g, ""))
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "hover:border-gray-300"
                        }`}
                      >
                        {app.component}
                        <span className="text-[10px] text-muted-foreground">{app.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed" />
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-muted-foreground">or enter UPI ID</span>
                    </div>
                  </div>

                  <div>
                    <Input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="font-mono text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Example: username@okicici, user@ybl</p>
                  </div>
                </div>
              )}

              {/* ─── Net Banking ─── */}
              {paymentMethod === "netbanking" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BankIcon className="h-7 w-auto" />
                    <span className="text-sm font-medium">Select Your Bank</span>
                  </div>

                  {/* Popular Banks */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "sbi", name: "State Bank of India", color: "#22409A" },
                      { id: "hdfc", name: "HDFC Bank", color: "#004C8F" },
                      { id: "icici", name: "ICICI Bank", color: "#F37B20" },
                      { id: "axis", name: "Axis Bank", color: "#97144D" },
                      { id: "kotak", name: "Kotak Mahindra", color: "#ED1C24" },
                      { id: "pnb", name: "Punjab National Bank", color: "#003580" },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 border rounded-lg flex items-center gap-3 transition-all text-left ${
                          selectedBank === bank.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "hover:border-gray-300 hover:bg-accent/50"
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: bank.color }}
                        >
                          {bank.name.split(" ").map((w) => w[0]).join("").slice(0, 3)}
                        </div>
                        <span className="text-xs font-medium leading-tight">{bank.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Other banks dropdown */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Other Banks</label>
                    <select
                      className="w-full h-9 rounded-md border bg-transparent px-3 text-sm"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="">Select a bank...</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="canara">Canara Bank</option>
                      <option value="union">Union Bank of India</option>
                      <option value="indian">Indian Bank</option>
                      <option value="idbi">IDBI Bank</option>
                      <option value="yes">Yes Bank</option>
                      <option value="federal">Federal Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ─── InfraBondX Wallet ─── */}
              {paymentMethod === "wallet" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <WalletIcon className="h-9 w-auto" />
                    <div>
                      <div className="text-sm font-semibold">InfraBondX Wallet</div>
                      <div className="text-xs text-muted-foreground">Pay directly from your wallet</div>
                    </div>
                  </div>

                  {/* Wallet Balance Card */}
                  <div className="rounded-xl border-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
                      <div className="text-xs opacity-80 mb-1">Available Balance</div>
                      <div className="text-2xl font-bold">₹{walletBalance.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Amount</span>
                        <span className="font-medium">- ₹{Number(amount).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining Balance</span>
                        <span className={`font-bold ${walletBalance >= Number(amount) ? "text-emerald-600" : "text-red-500"}`}>
                          ₹{Math.max(0, walletBalance - Number(amount)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {walletBalance < Number(amount) && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-700">Insufficient Balance</p>
                        <p className="text-[10px] text-red-600 mt-0.5">
                          You need ₹{(Number(amount) - walletBalance).toLocaleString("en-IN")} more. Try a different payment method.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-[10px] text-green-700">
                  256-bit SSL encrypted. Your payment information is secure. This is a demo simulation.
                </span>
                <Lock className="w-3 h-3 text-green-600 shrink-0 ml-auto" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setStep("confirm")}>
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleConfirm}
                  disabled={!isPaymentFormValid()}
                >
                  Pay ₹{calculatedTotalPayable.toLocaleString("en-IN")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="py-10 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <IndianRupee className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-1">Processing Payment...</h4>
                <p className="text-sm text-muted-foreground">Please do not close this window</p>
              </div>

              <div className="max-w-xs mx-auto space-y-2.5 text-left">
                {[
                  "Verifying payment details",
                  "Processing payment",
                  "Locking funds in escrow",
                  "Minting InfraTokens",
                  "Recording on blockchain",
                ].map((label, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {processingStage > i ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : processingStage === i ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={`text-sm ${processingStage >= i ? "text-foreground" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold mb-1">Payment Successful!</h4>
                <p className="text-sm text-muted-foreground">
                  ₹{Number(totalPayable || calculatedTotalPayable).toLocaleString("en-IN")} processed for{" "}
                  {project?.title || project?.name}
                </p>
              </div>

              <div className="p-4 bg-accent rounded-lg space-y-2.5 text-left text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Investment Receipt</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project</span>
                  <span className="font-medium max-w-[60%] truncate text-right">{project?.title || project?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">
                    {txHash?.length > 14 ? `${txHash.substring(0, 14)}...` : txHash}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Amount</span>
                  <span className="font-medium">₹{Number(amount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">₹{Number(platformFee || calculatedPlatformFee).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-semibold">₹{Number(totalPayable || calculatedTotalPayable).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">
                    {paymentMethod === "card" ? "Credit/Debit Card" : paymentMethod === "upi" ? "UPI" : paymentMethod === "netbanking" ? "Net Banking" : "InfraBondX Wallet"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens Minted</span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">{tokensIssued || tokens} InfraTokens</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="font-medium text-[#10b981]">{safeROI}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Confirmed
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button className="flex-1" onClick={handleSuccess}>
                  View Portfolio
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

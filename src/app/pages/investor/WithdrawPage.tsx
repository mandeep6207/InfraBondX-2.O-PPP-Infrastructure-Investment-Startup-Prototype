import { useMemo, useState } from "react";
import { ArrowDownCircle, BadgeCheck, IndianRupee, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { apiPost } from "@/app/services/api";
import { sendWithdrawEmail } from "@/utils/emailService";
import { toast } from "sonner";

export function WithdrawPage() {
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  const [walletBalance, setWalletBalance] = useState<number>(
    Number(parsedUser?.wallet_balance || 15000)
  );
  const [amount, setAmount] = useState<string>("");
  const [lastTxId, setLastTxId] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const amountNum = Number(amount || 0);
  const isValidAmount = amountNum > 0 && amountNum <= walletBalance;
  const remainingBalance = useMemo(
    () => Math.max(0, walletBalance - (Number.isFinite(amountNum) ? amountNum : 0)),
    [walletBalance, amountNum]
  );

  const handleWithdraw = async () => {
    if (!isValidAmount || isProcessing) return;

    setIsProcessing(true);
    setIsSuccess(false);

    const token = localStorage.getItem("token") || "";
    const withdrawnAmount = amountNum;
    const res = await apiPost("/investor/withdraw", { amount: withdrawnAmount }, token);

    if (res?.error) {
      toast.error("Withdraw failed", {
        description: res.error,
      });
      setIsProcessing(false);
      return;
    }

    const txId = String(res?.tx_hash || "");
    const updatedBalance = Number(res?.updated_balance ?? walletBalance);

    setWalletBalance(updatedBalance);
    setLastTxId(txId);
    setIsSuccess(true);
    setAmount("");

    toast.success("Withdraw successful", {
      description: "Email notification sent",
    });

    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        parsed.wallet_balance = updatedBalance;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
    } catch {}

    const emailRes = await sendWithdrawEmail({
      user_name: parsedUser?.name || "Investor",
      amount: withdrawnAmount,
      to_email: parsedUser?.email || "investor@infrabondx.com",
    });

    if (emailRes.success) {
      toast.success("📩 Withdraw confirmation email sent");
    } else {
      toast.error("Withdraw email failed", {
        description: emailRes.error || "Please check EmailJS templates",
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
          <p className="text-muted-foreground">Withdraw instantly (Demo)</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-semibold">Secure Transaction</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5" /> Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">₹{walletBalance.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground mt-2">Available for instant demo withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5" /> Withdraw Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="number"
              min={1}
              max={walletBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter withdraw amount"
            />
            {!isValidAmount && amount && (
              <p className="text-xs text-red-600">Enter a valid amount up to ₹{walletBalance.toLocaleString("en-IN")}</p>
            )}
            <Button className="w-full" disabled={!isValidAmount || isProcessing} onClick={handleWithdraw}>
              {isProcessing ? "Processing..." : "Withdraw"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requested Amount</span>
            <span className="font-medium">₹{amountNum > 0 ? amountNum.toLocaleString("en-IN") : "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining Balance</span>
            <span className="font-medium">₹{remainingBalance.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Transaction ID</span>
            <span className="font-mono text-xs">{lastTxId || "--"}</span>
          </div>

          {isSuccess && (
            <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <BadgeCheck className="w-5 h-5" /> Transaction Success
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Your withdrawal request is completed and recorded. Email notification sent.
              </p>
              <div className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" /> Demo instant settlement applied
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

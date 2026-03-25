import { useMemo } from "react";
import { BadgeCheck, CheckCircle2, QrCode, ShieldCheck } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  RewardVerificationPayload,
  encodeRewardPayload,
  getRewardTypeLabel,
} from "@/utils/rewardVerification";

interface RewardDetailsPageProps {
  reward: RewardVerificationPayload | null;
  onNavigate: (page: string) => void;
}

export function RewardDetailsPage({ reward, onNavigate }: RewardDetailsPageProps) {
  const qrValue = useMemo(() => (reward ? encodeRewardPayload(reward) : ""), [reward]);

  if (!reward) {
    return (
      <Card>
        <CardContent className="p-10 text-center space-y-4">
          <p className="text-lg font-semibold">Reward details not found</p>
          <p className="text-sm text-muted-foreground">Open this page from My Rewards to view verification details.</p>
          <Button onClick={() => onNavigate("investor-dashboard")}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  const encodedForLink = encodeURIComponent(qrValue);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <BadgeCheck className="w-4 h-4" /> Verified Reward
          </div>
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Blockchain-backed proof
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reward Details</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Project Name</p>
            <p className="font-semibold">{reward.project_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reward Type</p>
            <p className="font-semibold">{getRewardTypeLabel(reward.reward_type)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reward Points</p>
            <p className="font-semibold">{reward.points}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Investor Name</p>
            <p className="font-semibold">{reward.user_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-semibold">{reward.location}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Validity / Deadline</p>
            <p className="font-semibold">Valid till: {reward.valid_till}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-muted-foreground">Description</p>
            <p className="font-medium">{reward.description || "Reward issued for verified milestone completion."}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Reward Verification QR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-xl border bg-white">
              <QRCodeCanvas value={qrValue} size={220} includeMargin />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Scan to verify reward</p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => onNavigate(`qr-view-${encodedForLink}`)}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Open Scan Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { BadgeCheck, QrCode, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  RewardVerificationPayload,
  getRewardTypeLabel,
  parseRewardPayload,
} from "@/utils/rewardVerification";

interface QRViewPageProps {
  encodedData?: string;
  rewardData?: RewardVerificationPayload | null;
}

export function QRViewPage({ encodedData, rewardData }: QRViewPageProps) {
  const fromPageState = encodedData ? decodeURIComponent(encodedData) : null;
  const fromQuery = new URLSearchParams(window.location.search).get("data");
  const parsed = rewardData || parseRewardPayload(fromPageState) || parseRewardPayload(fromQuery);

  if (!parsed) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-lg font-semibold">Invalid QR payload</p>
          <p className="text-sm text-muted-foreground mt-1">No reward data was found in the scanned QR.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
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
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" /> Reward Verification View
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Project Name</p>
            <p className="font-semibold">{parsed.project_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reward Type</p>
            <p className="font-semibold">{getRewardTypeLabel(parsed.reward_type)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reward Points</p>
            <p className="font-semibold">{parsed.points}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Investor Name</p>
            <p className="font-semibold">{parsed.user_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-semibold">{parsed.location}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Validity / Deadline</p>
            <p className="font-semibold">Valid till: {parsed.valid_till}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-muted-foreground">Reward ID</p>
            <p className="font-semibold">#{parsed.reward_id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
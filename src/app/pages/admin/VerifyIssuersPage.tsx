import { useEffect, useState } from "react";
import { Shield, BadgeCheck, Building2, Wallet, Calendar, Briefcase, Loader, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { apiGet } from "@/app/services/api";
import { formatDateTime } from "@/utils/dateFormatter";

interface VerifyIssuersPageProps {
  onNavigate: (page: string) => void;
}

type IssuerDTO = {
  id: number;
  name: string;
  email: string;
  wallet_balance: number;
  project_count: number;
  completed_projects: number;
  created_at: string | null;
};

export function VerifyIssuersPage({ onNavigate }: VerifyIssuersPageProps) {
  const [issuers, setIssuers] = useState<IssuerDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await apiGet("/admin/issuers", token);
        if (Array.isArray(res)) setIssuers(res);
      } catch {
        setIssuers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Administration</span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Verify Issuers</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Verified Issuers</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All registered issuers on the platform with their project history and verification status
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/30 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{issuers.length}</p>
          <p className="text-xs text-muted-foreground">Total Issuers</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 text-center">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {issuers.reduce((sum, i) => sum + i.project_count, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total Projects Listed</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/30 text-center">
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {issuers.reduce((sum, i) => sum + i.completed_projects, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Completed Projects</p>
        </div>
      </div>

      {/* Issuer Cards Grid */}
      {issuers.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No registered issuers found on the platform.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issuers.map((issuer) => (
            <Card
              key={issuer.id}
              className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900/50 dark:to-blue-800/30 flex items-center justify-center border border-sky-200 dark:border-sky-800">
                      <Building2 className="w-5 h-5 text-sky-700 dark:text-sky-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{issuer.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{issuer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800/40">
                    <BadgeCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-[10px] font-semibold text-green-700 dark:text-green-300">Verified</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-muted/50 dark:bg-muted/30">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Briefcase className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Projects</span>
                    </div>
                    <p className="text-sm font-bold">{issuer.project_count}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 dark:bg-muted/30">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Shield className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Completed</span>
                    </div>
                    <p className="text-sm font-bold">{issuer.completed_projects}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 dark:bg-muted/30">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Wallet className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Wallet</span>
                    </div>
                    <p className="text-sm font-bold">₹{issuer.wallet_balance.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 dark:bg-muted/30">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Joined</span>
                    </div>
                    <p className="text-sm font-bold">
                      {issuer.created_at ? formatDateTime(issuer.created_at) : "—"}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onNavigate("approve-projects")}
                >
                  View Projects
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

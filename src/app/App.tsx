import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import { LandingPage } from "@/app/pages/LandingPage";
import { RoleSelectPage } from "@/app/pages/RoleSelectPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { KYCOnboarding } from "@/app/pages/KYCOnboarding";

import { InvestorLayout } from "@/app/components/InvestorLayout";
import { AdminLayout } from "@/app/components/AdminLayout";
import { IssuerLayout } from "@/app/components/IssuerLayout";

import { InvestorDashboard } from "@/app/pages/investor/InvestorDashboard";
import { MarketplacePage } from "@/app/pages/investor/MarketplacePage";
import { ProjectDetailsPage } from "@/app/pages/investor/ProjectDetailsPage";
import { PortfolioPage } from "@/app/pages/investor/PortfolioPage";
import { TransactionLedger } from "@/app/pages/investor/TransactionLedger";
import { SecondaryMarketPage } from "@/app/pages/investor/SecondaryMarketPage";
import { WithdrawPage } from "@/app/pages/investor/WithdrawPage";
import { RewardDetailsPage } from "@/app/pages/investor/RewardDetailsPage";

import { IssuerDashboard } from "@/app/pages/issuer/IssuerDashboard";
import { CreateBondPage } from "@/app/pages/issuer/CreateBondPage";
import { MilestoneManagementPage } from "@/app/pages/issuer/MilestoneManagementPage";
import { ProjectUpdatesPage } from "@/app/pages/issuer/ProjectUpdatesPage";

import { AdminDashboard } from "@/app/pages/admin/AdminDashboard";
import { ApproveProjectsPage } from "@/app/pages/admin/ApproveProjectsPage";
import { FraudMonitoringPage } from "@/app/pages/admin/FraudMonitoringPage";
import { AdminProjectPreviewPage } from "@/app/pages/admin/AdminProjectPreviewPage";
import { VerifyIssuersPage } from "@/app/pages/admin/VerifyIssuersPage";

import { ProfilePage } from "@/app/pages/shared/ProfilePage";
import { SettingsPage } from "@/app/pages/shared/SettingsPage";
import { HelpPage } from "@/app/pages/shared/HelpPage";
import { QRViewPage } from "@/app/pages/shared/QRViewPage";
import { IntroSplash } from "@/app/components/IntroSplash";
import { parseRewardPayload, type RewardVerificationPayload } from "@/utils/rewardVerification";
import { Toaster } from "sonner";

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [appVisible, setAppVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedRole, setSelectedRole] = useState<
    "investor" | "issuer" | "admin" | null
  >(null);

  const { user, isAuthenticated, completeKYC } = useAuth();

  const getSelectedReward = (): RewardVerificationPayload | null => {
    try {
      const raw = localStorage.getItem("selected_reward_payload");
      return parseRewardPayload(raw);
    } catch {
      return null;
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleRoleSelect = (role: "investor" | "issuer" | "admin") => {
    setSelectedRole(role);
    setCurrentPage("login");
  };

  const handleLoginSuccess = () => {
    // ✅ FIX: use latest user from localStorage (avoid async state timing issue)
    let latestUser = user;
    try {
      const stored = localStorage.getItem("user");
      if (stored) latestUser = JSON.parse(stored);
    } catch {}

    const loginMode = localStorage.getItem("login_mode") === "secure" ? "secure" : "quick";

    if (latestUser?.role === "investor" && !latestUser?.kycCompleted) {
      if (loginMode === "secure") {
        setCurrentPage("kyc");
        return;
      }
      completeKYC();
    }

    if (latestUser?.role === "investor") setCurrentPage("investor-dashboard");
    if (latestUser?.role === "issuer") setCurrentPage("issuer-dashboard");
    if (latestUser?.role === "admin") setCurrentPage("admin-dashboard");
  };

  const handleKYCComplete = () => {
    setCurrentPage("investor-dashboard");
  };

  useEffect(() => {
    if (showSplash) return;
    const frame = requestAnimationFrame(() => setAppVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  let content: React.ReactNode;

  // ✅ Landing + Auth flow
  if (currentPage === "landing") {
    content = <LandingPage onNavigate={handleNavigate} />;
  } else if (currentPage === "role-select") {
    content = (
      <RoleSelectPage
        onSelectRole={handleRoleSelect}
        onBack={() => setCurrentPage("landing")}
      />
    );
  } else if (currentPage === "login" && selectedRole) {
    content = (
      <LoginPage
        role={selectedRole}
        onBack={() => setCurrentPage("role-select")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  } else if (currentPage === "kyc") {
    content = <KYCOnboarding onComplete={handleKYCComplete} />;
  } else if (isAuthenticated && user?.role === "investor") {
    // ✅ Investor Pages
    content = (
      <InvestorLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "investor-dashboard" && (
          <InvestorDashboard onNavigate={handleNavigate} />
        )}
        {currentPage === "marketplace" && (
          <MarketplacePage onNavigate={handleNavigate} />
        )}
        {currentPage.startsWith("project-") && (
          <ProjectDetailsPage projectId={currentPage} onNavigate={handleNavigate} />
        )}
        {currentPage === "portfolio" && <PortfolioPage onNavigate={handleNavigate} />}
        {currentPage === "transactions" && <TransactionLedger />}
        {currentPage === "secondary-market" && (
          <SecondaryMarketPage onNavigate={handleNavigate} />
        )}
        {currentPage === "withdraw" && <WithdrawPage />}
        {currentPage === "reward-details" && (
          <RewardDetailsPage reward={getSelectedReward()} onNavigate={handleNavigate} />
        )}
        {currentPage.startsWith("qr-view-") && (
          <QRViewPage encodedData={currentPage.replace("qr-view-", "")} rewardData={getSelectedReward()} />
        )}
        {currentPage === "profile" && <ProfilePage />}
        {currentPage === "settings" && <SettingsPage />}
        {currentPage === "help" && <HelpPage />}
      </InvestorLayout>
    );
  } else if (isAuthenticated && user?.role === "issuer") {
    // ✅ Issuer Pages
    content = (
      <IssuerLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "issuer-dashboard" && (
          <IssuerDashboard onNavigate={handleNavigate} />
        )}
        {currentPage === "create-bond" && <CreateBondPage onNavigate={handleNavigate} />}
        {currentPage === "milestones" && (
          <MilestoneManagementPage onNavigate={handleNavigate} />
        )}
        {currentPage === "project-updates" && (
          <ProjectUpdatesPage onNavigate={handleNavigate} />
        )}
        {currentPage === "profile" && <ProfilePage />}
        {currentPage === "settings" && <SettingsPage />}
        {currentPage === "help" && <HelpPage />}
      </IssuerLayout>
    );
  } else if (isAuthenticated && user?.role === "admin") {
    // ✅ Admin Pages
    content = (
      <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === "admin-dashboard" && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}

        {currentPage === "verify-issuers" && (
          <VerifyIssuersPage onNavigate={handleNavigate} />
        )}

        {currentPage === "approve-projects" && <ApproveProjectsPage onNavigate={handleNavigate} />}
        {currentPage === "fraud-monitoring" && <FraudMonitoringPage />}
        {currentPage.startsWith("admin-project-preview-") && (
          <AdminProjectPreviewPage projectId={currentPage} onNavigate={handleNavigate} />
        )}
        {currentPage === "profile" && <ProfilePage />}
        {currentPage === "settings" && <SettingsPage />}
        {currentPage === "help" && <HelpPage />}
      </AdminLayout>
    );
  } else {
    // fallback
    content = <LandingPage onNavigate={handleNavigate} />;
  }

  return (
    <>
      {showSplash && <IntroSplash onComplete={handleSplashComplete} />}
      <div
        style={{
          opacity: showSplash ? 0 : appVisible ? 1 : 0,
          transition: "opacity 520ms ease",
        }}
      >
        {content}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

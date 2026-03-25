import { Moon, Sun, Bell, Shield, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 ${
                theme === "dark" ? "bg-sky-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-200 ${
                  theme === "dark" ? "translate-x-8" : "translate-x-1"
                }`}
              />
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="text-xs text-muted-foreground">Select your preferred language</p>
              </div>
            </div>
            <div className="px-3 py-1.5 border rounded-lg text-sm text-muted-foreground bg-muted">
              English (India)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-5 h-5" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-accent/30 transition-colors">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates and alerts via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {[
            { label: "Investment Updates", desc: "When your investments receive updates", enabled: true },
            { label: "Milestone Alerts", desc: "When project milestones are completed", enabled: true },
            { label: "Escrow Releases", desc: "When escrow funds are released", enabled: true },
            { label: "Marketing & Promotions", desc: "New projects and platform features", enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 border rounded-xl hover:bg-accent/30 transition-colors">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-default ${
                  item.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    item.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5" /> Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-accent/30 transition-colors">
            <div>
              <p className="text-sm font-medium">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your account password regularly</p>
            </div>
            <button className="px-3 py-1.5 border rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors cursor-default">
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-accent/30 transition-colors">
            <div>
              <p className="text-sm font-medium">Enable 2FA</p>
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground">Coming Soon</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-xl">
            <div>
              <p className="text-sm font-medium">Session Timeout</p>
              <p className="text-xs text-muted-foreground">Automatically logout after inactivity</p>
            </div>
            <div className="px-3 py-1.5 border rounded-lg text-sm text-muted-foreground bg-muted">
              30 minutes
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-xl">
            <div>
              <p className="text-sm font-medium">Data Export</p>
              <p className="text-xs text-muted-foreground">Download all your data</p>
            </div>
            <button className="px-3 py-1.5 border rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors cursor-default">
              Request Export
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

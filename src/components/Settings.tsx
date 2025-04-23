"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { ThemeToggle } from "./theme/theme-toggle"
import { useTheme } from "next-themes"
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  X,
  Save,
  Moon,
  Sun,
  Smartphone,
  Globe,
  Lock,
  Shield,
  BellRing,
  Palette,
  Eye,
  Check,
} from "lucide-react"
import Sidebaar from "./Sidebaar"
import { useDispatch, useSelector } from "react-redux"
import { setIsMobile, setSidebarOpen } from "@/redux/appSlice"

export default function SettingsComponent() {
  const isMobile = useSelector((state: any) => state.app.isMobile);
  const sidebarOpen = useSelector((state: any) => state.app.sideBarOpen);
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState("appearance")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  // Settings state
  const [settings, setSettings] = useState({
    appearance: {
      theme: "dark",
      animationsEnabled: true,
      borderRadius: 8,
      fontScale: 1,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      investmentAlerts: true,
      soundEnabled: true,
    },
    security: {
      twoFactorAuth: false,
      biometricLogin: true,
      passwordChangeInterval: "90days",
      showActivityLog: false,
    },
    privacy: {
      shareUsageData: true,
      allowCookies: true,
      showProfileToOthers: true,
    },
    language: {
      appLanguage: "english",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
  })

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      dispatch(setIsMobile(window.innerWidth < 768))
      if (window.innerWidth >= 768) {
        dispatch(setSidebarOpen(false))
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const handleSettingChange = (
    section: keyof typeof settings,
    setting: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof settings],
        [setting]: value,
      },
    }))

    // If changing theme, update the theme
    if (section === "appearance" && setting === "theme") {
      setTheme(value)
    }
  }

  const handleSaveSettings = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    }, 1000)
  }

  const renderSettingsSection = () => {
    switch (activeSection) {
      case "appearance":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    settings.appearance.theme === "light"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => handleSettingChange("appearance", "theme", "light")}
                >
                  <div className="flex justify-center mb-2">
                    <Sun className="h-6 w-6 text-amber-500" />
                  </div>
                  <p className="text-center text-sm font-medium">Light</p>
                </div>
                <div
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    settings.appearance.theme === "dark"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => handleSettingChange("appearance", "theme", "dark")}
                >
                  <div className="flex justify-center mb-2">
                    <Moon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <p className="text-center text-sm font-medium">Dark</p>
                </div>
                <div
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    settings.appearance.theme === "system"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => handleSettingChange("appearance", "theme", "system")}
                >
                  <div className="flex justify-center mb-2">
                    <Smartphone className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="text-center text-sm font-medium">System</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="animations" className="text-base font-medium">
                  Enable animations
                </Label>
                <Switch
                  id="animations"
                  checked={settings.appearance.animationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange("appearance", "animationsEnabled", checked)}
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Toggle animations and transitions throughout the interface
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="borderRadius" className="text-base font-medium">
                Border radius: {settings.appearance.borderRadius}px
              </Label>
              <Slider
                id="borderRadius"
                min={0}
                max={16}
                step={1}
                value={[settings.appearance.borderRadius]}
                onValueChange={(value) => handleSettingChange("appearance", "borderRadius", value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Square</span>
                <span>Rounded</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="fontScale" className="text-base font-medium">
                Font size: {Math.round(settings.appearance.fontScale * 100)}%
              </Label>
              <Slider
                id="fontScale"
                min={0.8}
                max={1.4}
                step={0.05}
                value={[settings.appearance.fontScale]}
                onValueChange={(value) => handleSettingChange("appearance", "fontScale", value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Smaller</span>
                <span>Larger</span>
              </div>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="emailNotifications" className="text-base font-medium">
                    Email notifications
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive email updates about your account activity
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "emailNotifications", checked)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="pushNotifications" className="text-base font-medium">
                    Push notifications
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "pushNotifications", checked)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="marketingEmails" className="text-base font-medium">
                    Marketing emails
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive emails about new features and offers
                  </p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={settings.notifications.marketingEmails}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "marketingEmails", checked)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="investmentAlerts" className="text-base font-medium">
                    Investment alerts
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get notified about important changes to your investments
                  </p>
                </div>
                <Switch
                  id="investmentAlerts"
                  checked={settings.notifications.investmentAlerts}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "investmentAlerts", checked)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="soundEnabled" className="text-base font-medium">
                    Sound effects
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Play sounds for notifications and actions
                  </p>
                </div>
                <Switch
                  id="soundEnabled"
                  checked={settings.notifications.soundEnabled}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "soundEnabled", checked)}
                />
              </div>
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="twoFactorAuth" className="text-base font-medium">
                    Two-factor authentication
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange("security", "twoFactorAuth", checked)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="biometricLogin" className="text-base font-medium">
                    Biometric login
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Use fingerprint or face recognition to log in
                  </p>
                </div>
                <Switch
                  id="biometricLogin"
                  checked={settings.security.biometricLogin}
                  onCheckedChange={(checked) => handleSettingChange("security", "biometricLogin", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordChangeInterval" className="text-base font-medium">
                  Password change interval
                </Label>
                <select
                  id="passwordChangeInterval"
                  value={settings.security.passwordChangeInterval}
                  onChange={(e) => handleSettingChange("security", "passwordChangeInterval", e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="30days">Every 30 days</option>
                  <option value="60days">Every 60 days</option>
                  <option value="90days">Every 90 days</option>
                  <option value="never">Never</option>
                </select>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  How often you'll be prompted to change your password
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  View account activity log
                </Button>
              </div>
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="shareUsageData" className="text-base font-medium">
                    Share usage data
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Help us improve by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  id="shareUsageData"
                  checked={settings.privacy.shareUsageData}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "shareUsageData", checked)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="allowCookies" className="text-base font-medium">
                    Allow cookies
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enable cookies to enhance your browsing experience
                  </p>
                </div>
                <Switch
                  id="allowCookies"
                  checked={settings.privacy.allowCookies}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "allowCookies", checked)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="showProfileToOthers" className="text-base font-medium">
                    Profile visibility
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Allow other investors to see your profile
                  </p>
                </div>
                <Switch
                  id="showProfileToOthers"
                  checked={settings.privacy.showProfileToOthers}
                  onCheckedChange={(checked) => handleSettingChange("privacy", "showProfileToOthers", checked)}
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Manage data and privacy
                </Button>
              </div>
            </div>
          </div>
        )

      case "language":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="appLanguage" className="text-base font-medium">
                Application language
              </Label>
              <select
                id="appLanguage"
                value={settings.language.appLanguage}
                onChange={(e) => handleSettingChange("language", "appLanguage", e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="arabic">Arabic</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="dateFormat" className="text-base font-medium">
                Date format
              </Label>
              <select
                id="dateFormat"
                value={settings.language.dateFormat}
                onChange={(e) => handleSettingChange("language", "dateFormat", e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="timeFormat" className="text-base font-medium">
                Time format
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    settings.language.timeFormat === "12h"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => handleSettingChange("language", "timeFormat", "12h")}
                >
                  <p className="text-center text-sm font-medium">12-hour (AM/PM)</p>
                </div>
                <div
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    settings.language.timeFormat === "24h"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => handleSettingChange("language", "timeFormat", "24h")}
                >
                  <p className="text-center text-sm font-medium">24-hour</p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => dispatch(setSidebarOpen(false))} />
        )}

       <Sidebaar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(setSidebarOpen(true))}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden"
                >
                  <Menu size={20} />
                </Button>
              )}
              <h1 className="text-lg font-semibold hidden md:block">Settings</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-cyan-500">
                  <div className="bg-gradient-to-br from-purple-500 to-cyan-500 w-full h-full"></div>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline-block">Admin</span>
              </div>
            </div>
          </header>

          {/* Settings Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
                {/* Settings Navigation */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 h-fit md:sticky md:top-6">
                  <CardContent className="p-0">
                    <nav className="flex flex-col">
                      <SettingsNavItem
                        icon={<Palette size={18} />}
                        label="Appearance"
                        active={activeSection === "appearance"}
                        onClick={() => setActiveSection("appearance")}
                      />
                      <SettingsNavItem
                        icon={<BellRing size={18} />}
                        label="Notifications"
                        active={activeSection === "notifications"}
                        onClick={() => setActiveSection("notifications")}
                      />
                      <SettingsNavItem
                        icon={<Lock size={18} />}
                        label="Security"
                        active={activeSection === "security"}
                        onClick={() => setActiveSection("security")}
                      />
                      <SettingsNavItem
                        icon={<Eye size={18} />}
                        label="Privacy"
                        active={activeSection === "privacy"}
                        onClick={() => setActiveSection("privacy")}
                      />
                      <SettingsNavItem
                        icon={<Globe size={18} />}
                        label="Language & Region"
                        active={activeSection === "language"}
                        onClick={() => setActiveSection("language")}
                      />
                    </nav>
                  </CardContent>
                </Card>

                {/* Settings Content */}
                <div className="space-y-6">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {activeSection === "appearance" && <Palette className="h-5 w-5" />}
                        {activeSection === "notifications" && <BellRing className="h-5 w-5" />}
                        {activeSection === "security" && <Lock className="h-5 w-5" />}
                        {activeSection === "privacy" && <Eye className="h-5 w-5" />}
                        {activeSection === "language" && <Globe className="h-5 w-5" />}
                        {activeSection === "appearance" && "Appearance"}
                        {activeSection === "notifications" && "Notifications"}
                        {activeSection === "security" && "Security"}
                        {activeSection === "privacy" && "Privacy"}
                        {activeSection === "language" && "Language & Region"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{renderSettingsSection()}</CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Settings Navigation Item
function SettingsNavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        active
          ? "bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 font-medium"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      }`}
      onClick={onClick}
    >
      <span className={`${active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
        {icon}
      </span>
      <span>{label}</span>
      {active && <Check className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400" />}
    </button>
  )
}

// Navigation Item Component
function NavItem({ icon, label, active = false, collapsed = false }: any) {
  return (
    <div
      className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
        active
          ? "bg-slate-100 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-indigo-500/20 text-slate-900 dark:text-white"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-700/50"
      }`}
    >
      <div className={`${active ? "text-blue-600 dark:text-blue-400" : ""}`}>{icon}</div>
      {!collapsed && <span className="ml-3 text-sm">{label}</span>}
    </div>
  )
}

// Sidebar Navigation Component
function SidebarNav({ collapsed = false, isMobile = false, activePath = "/" }) {
  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      name: "Investors Or Company",
      href: "/investors",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      name: "Installments",
      href: "/installments",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      name: "Create Company",
      href: "/create-company",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      name: "Customer Request for App owner only",
      href: "/customer-request",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => {
        const isActive = activePath === item.href
        return (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={isMobile && item.name === "Customer Request for App owner only" ? "Customer Request" : item.name}
            active={isActive}
            collapsed={collapsed}
          />
        )
      })}
    </nav>
  )
}

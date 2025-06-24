"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2, Check, Bell, AlertTriangle, Mail, MessageSquare, Phone } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    alertThreshold: "medium", // low, medium, high
    maintenanceReminders: true,
    systemUpdates: true,
    equipmentAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true,
    criticalAlertVolume: 80, // 0-100
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("notificationSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notificationSettings", JSON.stringify(settings))
    }
  }, [settings])

  const handleSettingChange = (setting: string, value: boolean | string | number) => {
    setSettings((prev) => ({ ...prev, [setting]: value }))
  }

  const handleSaveSettings = () => {
    setIsUpdating(true)

    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false)
      setUpdateSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false)
      }, 3000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Notification Channels</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose how you want to receive notifications</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Alert Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">Configure when and how you receive alerts</p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-threshold">Alert Threshold</Label>
                    <Select
                      value={settings.alertThreshold}
                      onValueChange={(value) => handleSettingChange("alertThreshold", value)}
                    >
                      <SelectTrigger id="alert-threshold">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (All Alerts)</SelectItem>
                        <SelectItem value="medium">Medium (Warnings & Critical)</SelectItem>
                        <SelectItem value="high">High (Critical Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="critical-alert-volume">Critical Alert Volume</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="critical-alert-volume"
                        min={0}
                        max={100}
                        step={10}
                        value={[settings.criticalAlertVolume]}
                        onValueChange={(value) => handleSettingChange("criticalAlertVolume", value[0])}
                      />
                      <span className="w-12 text-sm">{settings.criticalAlertVolume}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <Label htmlFor="equipment-alerts">Equipment Alerts</Label>
                  </div>
                  <Switch
                    id="equipment-alerts"
                    checked={settings.equipmentAlerts}
                    onCheckedChange={(checked) => handleSettingChange("equipmentAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label htmlFor="maintenance-reminders">Maintenance Reminders</Label>
                  </div>
                  <Switch
                    id="maintenance-reminders"
                    checked={settings.maintenanceReminders}
                    onCheckedChange={(checked) => handleSettingChange("maintenanceReminders", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Report Frequency</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose how often you receive automated reports</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-reports">Daily Reports</Label>
                  <Switch
                    id="daily-reports"
                    checked={settings.dailyReports}
                    onCheckedChange={(checked) => handleSettingChange("dailyReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <Switch
                    id="weekly-reports"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly-reports">Monthly Reports</Label>
                  <Switch
                    id="monthly-reports"
                    checked={settings.monthlyReports}
                    onCheckedChange={(checked) => handleSettingChange("monthlyReports", checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {updateSuccess && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your notification preferences have been saved.</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSaveSettings} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

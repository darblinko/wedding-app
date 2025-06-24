"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2, Check, Sun, Moon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "next-themes"

// Create a type for our display settings
export type DisplaySettings = {
  darkMode: boolean
  compactView: boolean
  showAlerts: boolean
}

export function DisplaySettings() {
  const { theme, setTheme } = useTheme()

  const [settings, setSettings] = useState<DisplaySettings>({
    darkMode: false,
    compactView: false,
    showAlerts: true,
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("displaySettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      // Sync dark mode with theme
      setSettings((prev) => ({ ...prev, darkMode: theme === "dark" }))
    }
  }, [theme])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("displaySettings", JSON.stringify(settings))
    }
  }, [settings])

  const handleDarkModeChange = (checked: boolean) => {
    setSettings((prev) => ({ ...prev, darkMode: checked }))
    setTheme(checked ? "dark" : "light")
  }

  const handleSettingChange = (setting: keyof DisplaySettings, value: boolean) => {
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
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>Customize how information is displayed on your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Theme Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">Adjust the appearance of the dashboard interface</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                  </div>
                  <Switch id="dark-mode" checked={settings.darkMode} onCheckedChange={handleDarkModeChange} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Display more information in less space</p>
                  </div>
                  <Switch
                    id="compact-view"
                    checked={settings.compactView}
                    onCheckedChange={(checked) => handleSettingChange("compactView", checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {updateSuccess && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your display preferences have been saved.</AlertDescription>
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

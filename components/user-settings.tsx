"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountSettings } from "@/components/account-settings"
import { DisplaySettings } from "@/components/display-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("account")

  // Save active tab to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("settingsActiveTab", activeTab)
    }
  }, [activeTab])

  // Load active tab from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("settingsActiveTab")
      if (savedTab) {
        setActiveTab(savedTab)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="ml-auto flex items-center gap-4">{/* You can add header actions here if needed */}</div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="space-y-4">
            <AccountSettings />
          </TabsContent>
          <TabsContent value="display" className="space-y-4">
            <DisplaySettings />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

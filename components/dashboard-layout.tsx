"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Settings, User, Wrench, Database, Plus } from "lucide-react"
import { NotificationsDropdown } from "./notifications-dropdown"
import { ThemeToggle } from "./theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { EquipmentOnboarding } from "./equipment-onboarding"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  onAddEquipment?: () => void
}

export function DashboardLayout({ children, onAddEquipment }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleNavigation = (itemId: string) => {
    switch (itemId) {
      case "overview":
        router.push("/")
        break
      case "equipment":
        router.push("/?tab=equipment")
        break
      case "maintenance":
        router.push("/maintenance")
        break
      case "data-logs":
        router.push("/?tab=data-logs")
        break
      case "generate-report":
        router.push("/?tab=generate-report")
        break
      default:
        break
    }
  }

  const handleAddEquipment = () => {
    if (onAddEquipment) {
      onAddEquipment()
    } else {
      setShowOnboarding(true)
    }
  }

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      path: "/",
    },
    {
      id: "equipment",
      label: "Equipment",
      icon: Wrench,
      path: "/?tab=equipment",
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: Settings,
      path: "/maintenance",
    },
    {
      id: "data-logs",
      label: "Data Logs",
      icon: Database,
      path: "/?tab=data-logs",
    },
    {
      id: "generate-report",
      label: "Generate Report",
      icon: BarChart3,
      path: "/?tab=generate-report",
    },
  ]

  const getActiveItem = () => {
    if (pathname === "/maintenance") return "maintenance"
    if (pathname === "/") {
      // Check URL params for tab
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search)
        const tab = urlParams.get("tab")
        return tab || "overview"
      }
      return "overview"
    }
    return "overview"
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="font-semibold">Industrial Dashboard</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.id)}
                    isActive={getActiveItem() === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 flex-1">
              <h1 className="text-xl font-semibold">Industrial Equipment Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddEquipment} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
              <NotificationsDropdown />
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4">{children}</main>
        </SidebarInset>
      </div>

      {showOnboarding && (
        <EquipmentOnboarding
          onClose={() => setShowOnboarding(false)}
          onEquipmentAdded={() => {
            setShowOnboarding(false)
          }}
        />
      )}
    </SidebarProvider>
  )
}

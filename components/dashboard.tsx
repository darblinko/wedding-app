"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Settings, User, Wrench, Database, TrendingUp, AlertTriangle, FileText, Plus } from "lucide-react"
import { EquipmentList } from "./equipment-list"
import { NotificationsDropdown } from "./notifications-dropdown"
import { ThemeToggle } from "./theme-toggle"
import { generateReport } from "@/lib/generate-report"
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
import { EquipmentStatus } from "./equipment-status"
import { EquipmentCycleTracking } from "./equipment-cycle-tracking"
import { SensorInsights } from "./sensor-insights"
import { EquipmentHealthScore } from "./equipment-health-score"
import { EquipmentOnboarding } from "./equipment-onboarding"
import { DataLogs } from "./data-logs"
import { EnergyUsageSummary } from "./energy-usage-summary"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [liveSensorData, setLiveSensorData] = useState([])
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(undefined)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [sharedMaintenanceEvents, setSharedMaintenanceEvents] = useState([])

  const handleMaintenanceEventUpdate = useCallback((updatedEvents) => {
    setSharedMaintenanceEvents(updatedEvents)
  }, [])

  const handleEquipmentSelect = useCallback((equipmentId) => {
    setSelectedEquipmentId(equipmentId)
  }, [])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "equipment-performance":
        alert("Generating Equipment Performance Report...")
        break
      case "trend-data":
        alert("Generating Trend Data Report...")
        break
      case "maintenance-activity":
        alert("Generating Maintenance Activity Report...")
        break
      case "alerts-incidents":
        alert("Generating Alerts & Incidents Report...")
        break
      case "executive-summary":
        alert("Generating Executive Summary Report...")
        break
      case "generate-report":
        generateReport()
        break
      case "schedule-maintenance":
        // Handle schedule maintenance
        break
      case "add-equipment":
        // Handle add equipment
        break
      default:
        break
    }
  }

  const handleNavigation = (itemId: string) => {
    if (itemId === "maintenance") {
      router.push("/maintenance")
    } else {
      setActiveTab(itemId)
    }
  }

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
    },
    {
      id: "equipment",
      label: "Equipment",
      icon: Wrench,
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: Settings,
    },
    {
      id: "data-logs",
      label: "Data Logs",
      icon: Database,
    },
    {
      id: "generate-report",
      label: "Generate Report",
      icon: BarChart3,
    },
  ]

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
                    isActive={activeTab === item.id}
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
              <Button onClick={() => setShowOnboarding(true)} variant="outline" size="sm">
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

          <main className="flex-1 overflow-auto p-4">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Equipment Health Score - Full Width */}
                <div className="w-full">
                  <EquipmentHealthScore
                    sharedMaintenanceEvents={sharedMaintenanceEvents}
                    onMaintenanceEventUpdate={handleMaintenanceEventUpdate}
                    liveSensorData={liveSensorData}
                  />
                </div>

                {/* Sensor Insights - Full Width */}
                <div className="w-full">
                  <SensorInsights selectedEquipmentId={selectedEquipmentId} />
                </div>

                {/* Energy Usage Summary - Full Width */}
                <div className="w-full">
                  <EnergyUsageSummary />
                </div>

                {/* Equipment Status and Cycle Tracking - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="w-full">
                    <EquipmentStatus />
                  </div>
                  <div className="w-full">
                    <EquipmentCycleTracking />
                  </div>
                </div>
              </div>
            )}
            {activeTab === "equipment" && <EquipmentList onEquipmentSelect={handleEquipmentSelect} />}
            {activeTab === "data-logs" && <DataLogs />}
            {activeTab === "generate-report" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Reports</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Select the type of report you want to generate for your industrial equipment data.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button
                        onClick={() => handleQuickAction("equipment-performance")}
                        className="h-24 flex-col gap-2 text-left"
                        variant="outline"
                      >
                        <BarChart3 className="h-6 w-6" />
                        <div>
                          <div className="font-medium">Equipment Performance</div>
                          <div className="text-xs text-muted-foreground">Operational metrics and efficiency data</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => handleQuickAction("trend-data")}
                        className="h-24 flex-col gap-2 text-left"
                        variant="outline"
                      >
                        <TrendingUp className="h-6 w-6" />
                        <div>
                          <div className="font-medium">Trend Data</div>
                          <div className="text-xs text-muted-foreground">Historical patterns and forecasts</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => handleQuickAction("maintenance-activity")}
                        className="h-24 flex-col gap-2 text-left"
                        variant="outline"
                      >
                        <Wrench className="h-6 w-6" />
                        <div>
                          <div className="font-medium">Maintenance Activity</div>
                          <div className="text-xs text-muted-foreground">Scheduled and completed maintenance</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => handleQuickAction("alerts-incidents")}
                        className="h-24 flex-col gap-2 text-left"
                        variant="outline"
                      >
                        <AlertTriangle className="h-6 w-6" />
                        <div>
                          <div className="font-medium">Alerts & Incidents</div>
                          <div className="text-xs text-muted-foreground">Critical events and responses</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => handleQuickAction("executive-summary")}
                        className="h-24 flex-col gap-2 text-left"
                        variant="outline"
                      >
                        <FileText className="h-6 w-6" />
                        <div>
                          <div className="font-medium">Executive Summary</div>
                          <div className="text-xs text-muted-foreground">High-level overview and KPIs</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Report Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date Range</label>
                        <select className="w-full p-2 border rounded-md">
                          <option>Last 7 days</option>
                          <option>Last 30 days</option>
                          <option>Last 90 days</option>
                          <option>Custom range</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Format</label>
                        <select className="w-full p-2 border rounded-md">
                          <option>PDF</option>
                          <option>Excel</option>
                          <option>CSV</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Equipment Filter</label>
                        <select className="w-full p-2 border rounded-md">
                          <option>All Equipment</option>
                          <option>Production Line A</option>
                          <option>Production Line B</option>
                          <option>Utilities</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Equipment Performance Report</div>
                          <div className="text-sm text-muted-foreground">Generated on Dec 15, 2024</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Maintenance Activity Summary</div>
                          <div className="text-sm text-muted-foreground">Generated on Dec 12, 2024</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Executive Summary Q4</div>
                          <div className="text-sm text-muted-foreground">Generated on Dec 10, 2024</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {showOnboarding && (
              <EquipmentOnboarding
                onClose={() => setShowOnboarding(false)}
                onEquipmentAdded={(equipmentId) => {
                  setSelectedEquipmentId(equipmentId)
                  setShowOnboarding(false)
                }}
              />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

// Make the Dashboard component available as a named export
export { Dashboard }

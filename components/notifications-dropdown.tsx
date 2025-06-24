"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle, AlertCircle, ExternalLink, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type Alert = {
  id: string
  equipmentId: string
  equipmentName: string
  sensorType: string
  severity: "mild" | "critical"
  message: string
  timestamp: Date
  resolved: boolean
}

export function NotificationsDropdown() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [open, setOpen] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [actualCost, setActualCost] = useState<number | undefined>(undefined)

  useEffect(() => {
    // Simulating real-time alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          equipmentId: `equipment${Math.floor(Math.random() * 5) + 1}`,
          equipmentName: `Equipment ${Math.floor(Math.random() * 5) + 1}`,
          sensorType: ["temperature", "pressure", "current"][Math.floor(Math.random() * 3)],
          severity: Math.random() > 0.7 ? "critical" : "mild",
          message: "Sensor reading outside normal range",
          timestamp: new Date(),
          resolved: false,
        }
        setAlerts((prevAlerts) => [newAlert, ...prevAlerts].slice(0, 10))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleAlertAction = () => {
    if (selectedAlert) {
      console.log(`Actions taken for alert ${selectedAlert.id}: ${selectedActions.join(", ")}`)
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) => (alert.id === selectedAlert.id ? { ...alert, resolved: true } : alert)),
      )
      setSelectedAlert(null)
      setSelectedActions([])
      setActualCost(undefined)
      setIsAlertDialogOpen(false)
    }
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "mild":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const unreadCount = alerts.filter((alert) => !alert.resolved).length

  const mildAlertActions = [
    "Use a Manual Temperature Sensor to Cross-Check Readings",
    "Check for Airflow Obstructions (Intake & Exhaust Fans)",
    "Inspect Door Seals & Gaskets",
    "Ensure Freezer/Display Case Doors Are Fully Closed",
    "Verify Freezer/Display Thermostat Settings",
    "Inspect for Ice Build-Up or Frost Accumulation",
    "Check Power Supply & Voltage Stability",
    "Observe Compressor Runtime Behavior",
    "Reset the Freezer/Display Unit (Last Resort for Mild Alerts)",
  ]

  const criticalAlertActions = [
    "Verify Temperature Deviation with an Independent Thermometer",
    "Immediately Move Stock to Backup Freezer (if available)",
    "Check for Refrigeration System Failure (Compressor, Fans, and Coils)",
    "Inspect Refrigerant Levels & Look for Leaks",
    "Confirm That Freezer Door is Fully Sealed & No Obstructions Exist",
    "Check Power Supply & Voltage Stability",
    "Force a Manual Defrost Cycle (if Ice Buildup is Present)",
    "Check for Excessive Compressor Runtime or Overheating",
    "Call a Refrigeration Technician (If Problem Persists)",
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[90vw] sm:w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          <DropdownMenuGroup>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <DropdownMenuItem key={alert.id} className="cursor-pointer">
                  <div className={`flex items-start space-x-3 py-2 ${alert.resolved ? "opacity-70" : ""}`}>
                    <div
                      className={`rounded-full p-1 ${alert.severity === "critical" ? "bg-red-100" : "bg-yellow-100"}`}
                    >
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{alert.equipmentName}</p>
                        <Badge variant="outline" className="text-xs">
                          {alert.timestamp.toLocaleTimeString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      {!alert.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSelectedAlert(alert)
                            setIsAlertDialogOpen(true)
                          }}
                        >
                          Respond
                        </Button>
                      )}
                      {alert.resolved && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Resolved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications</div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/alerts" className="flex w-full cursor-pointer items-center justify-center">
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View all alerts</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Alert Response Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAlert?.severity === "critical" ? (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Critical Alert Response
                </div>
              ) : (
                <div className="flex items-center text-yellow-500">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Mild Alert Response
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Please follow these steps to address the {selectedAlert?.severity} alert for{" "}
              {selectedAlert?.equipmentName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Alert Details:</h3>
              <p>
                <strong>Equipment:</strong> {selectedAlert?.equipmentName}
              </p>
              <p>
                <strong>Sensor:</strong> {selectedAlert?.sensorType}
              </p>
              <p>
                <strong>Message:</strong> {selectedAlert?.message}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Recommended Actions:</h3>
              <ScrollArea className="h-[300px] pr-4">
                {(selectedAlert?.severity === "critical" ? criticalAlertActions : mildAlertActions).map(
                  (action, index) => (
                    <div key={index} className="flex items-start space-x-2 mb-4">
                      <Checkbox
                        id={`action-${index}`}
                        checked={selectedActions.includes(action)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedActions([...selectedActions, action])
                          } else {
                            setSelectedActions(selectedActions.filter((a) => a !== action))
                          }
                        }}
                      />
                      <Label htmlFor={`action-${index}`} className="text-sm">
                        {action}
                      </Label>
                    </div>
                  ),
                )}
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualCost">Actual Cost ($)</Label>
              <Input
                id="actualCost"
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                placeholder="Enter actual cost"
              />
            </div>
            <Button onClick={handleAlertAction} disabled={selectedActions.length === 0 || actualCost === undefined}>
              Confirm Actions & Complete Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}

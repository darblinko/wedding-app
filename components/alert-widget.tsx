"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, AlertCircle, Bell } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export function AlertWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

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

  const handleAlertAction = (action: string) => {
    if (selectedAlert) {
      console.log(`Action taken for alert ${selectedAlert.id}: ${action}`)
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) => (alert.id === selectedAlert.id ? { ...alert, resolved: true } : alert)),
      )
      setSelectedAlert(null)
    }
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "mild":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                {getAlertIcon(alert.severity)}
                <div>
                  <p className="text-sm font-medium">{alert.equipmentName}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={alert.severity === "critical" ? "destructive" : "default"}>{alert.severity}</Badge>
                {!alert.resolved && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAlert(alert)}>
                        Respond
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Alert Response</DialogTitle>
                        <DialogDescription>Select an action to respond to this alert.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>
                          <strong>Equipment:</strong> {selectedAlert?.equipmentName}
                        </p>
                        <p>
                          <strong>Sensor:</strong> {selectedAlert?.sensorType}
                        </p>
                        <p>
                          <strong>Message:</strong> {selectedAlert?.message}
                        </p>
                        <Select onValueChange={handleAlertAction}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inspect">Inspect equipment</SelectItem>
                            <SelectItem value="adjust">Manually adjust settings</SelectItem>
                            <SelectItem value="clean">Clean equipment</SelectItem>
                            <SelectItem value="technician">Call technician</SelectItem>
                            <SelectItem value="ignore">No action needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {alert.resolved && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Resolved
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

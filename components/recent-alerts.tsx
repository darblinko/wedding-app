"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, AlertTriangle, AlertCircle } from "lucide-react"

type Alert = {
  id: string
  equipment: string
  message: string
  timestamp: Date
  severity: "low" | "medium" | "high"
}

const initialAlerts: Alert[] = [
  {
    id: "1",
    equipment: "Pump A1",
    message: "Temperature exceeding threshold (95°F)",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    severity: "high",
  },
  {
    id: "2",
    equipment: "Compressor B2",
    message: "Vibration levels above normal (8.5Hz)",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    severity: "medium",
  },
  {
    id: "3",
    equipment: "Motor C3",
    message: "Energy consumption spike (78kW)",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    severity: "low",
  },
]

export function RecentAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          equipment: ["Pump A1", "Compressor B2", "Motor C3"][Math.floor(Math.random() * 3)],
          message: "New alert message",
          timestamp: new Date(),
          severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
        }
        setAlerts((prev) => [newAlert, ...prev].slice(0, 5))
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <Bell className="h-4 w-4" />
      case "medium":
        return <AlertTriangle className="h-4 w-4" />
      case "high":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>Latest system alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-4">
                <div className={`rounded-full p-1 flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium">{alert.equipment}</p>
                  <p className="text-sm text-muted-foreground break-words">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

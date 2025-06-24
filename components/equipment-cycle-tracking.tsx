"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { equipmentData } from "./equipment-list"
import { ScrollArea } from "@/components/ui/scroll-area"

export function EquipmentCycleTracking() {
  const [equipment, setEquipment] = useState(() =>
    equipmentData.map((item) => ({
      ...item,
      cyclesSinceMaintenance: Math.floor(Math.random() * 500) + 100,
      postMaintenanceEfficiency: 85 + Math.floor(Math.random() * 10),
      nextMaintenanceDays: Math.floor(Math.random() * 15) + 5,
    })),
  )
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h")

  useEffect(() => {
    const timer = setInterval(() => {
      setEquipment((prevEquipment) =>
        prevEquipment.map((item) => {
          if (item.status === "operational") {
            return {
              ...item,
              runTime: (item.runTime || 0) + 1,
              cycles: {
                last24h: (item.cycles?.last24h || 0) + (Math.random() > 0.8 ? 1 : 0),
                last7d: item.cycles?.last7d || 0,
                last30d: item.cycles?.last30d || 0,
              },
            }
          }
          return item
        }),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatRunTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCycleCount = (item: (typeof equipment)[0]) => {
    if (!item.cycles) return 0
    switch (timeRange) {
      case "24h":
        return item.cycles.last24h || 0
      case "7d":
        return item.cycles.last7d || 0
      case "30d":
        return item.cycles.last30d || 0
      default:
        return 0
    }
  }

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <CardTitle>Equipment Cycle Tracking & Efficiency</CardTitle>
        <Select value={timeRange} onValueChange={(value: "24h" | "7d" | "30d") => setTimeRange(value)}>
          <SelectTrigger className="w-full sm:w-[100px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="7d">7d</SelectItem>
            <SelectItem value="30d">30d</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-6 pr-4">
            {equipment.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status === "operational" ? (
                      <Play className="h-4 w-4 text-green-500" />
                    ) : (
                      <Pause className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-mono">{formatRunTime(item.runTime || 0)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      Total Cycles ({timeRange}): {getCycleCount(item)}
                    </p>
                    <p>Since Maint.: {item.cyclesSinceMaintenance} cycles</p>
                  </div>
                  <div>
                    <p>Post-Maint. Eff.: {item.postMaintenanceEfficiency}%</p>
                    <p>Next Maint.: {item.nextMaintenanceDays} days</p>
                  </div>
                </div>
                {(item.cyclesTrend || 0) > 20 && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm">Cycling {item.cyclesTrend}% more than usual</p>
                  </div>
                )}
                <Progress value={((30 - item.nextMaintenanceDays) / 30) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

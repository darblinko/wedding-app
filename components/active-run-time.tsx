"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause } from "lucide-react"

type Equipment = {
  id: string
  name: string
  status: "running" | "stopped" | "maintenance"
  runTime: number // in seconds
  stopStarts: number
}

const initialEquipment: Equipment[] = [
  { id: "1", name: "Pump A1", status: "running", runTime: 3600, stopStarts: 5 },
  { id: "2", name: "Compressor B2", status: "stopped", runTime: 7200, stopStarts: 8 },
  { id: "3", name: "Motor C3", status: "maintenance", runTime: 1800, stopStarts: 3 },
]

export function ActiveRunTime() {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment)

  useEffect(() => {
    const timer = setInterval(() => {
      setEquipment((prevEquipment) =>
        prevEquipment.map((item) => {
          if (item.status === "running") {
            return { ...item, runTime: item.runTime + 1 }
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
      case "running":
        return "bg-green-100 text-green-800"
      case "stopped":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>Active Run Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {equipment.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  {item.status === "running" ? (
                    <Play className="h-4 w-4 text-green-500" />
                  ) : (
                    <Pause className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-mono">{formatRunTime(item.runTime)}</span>
                </div>
                <div className="text-sm text-muted-foreground">Stops/Starts: {item.stopStarts}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

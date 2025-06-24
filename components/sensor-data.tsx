"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ZoomIn, ZoomOut } from "lucide-react"
import type { Equipment } from "@/lib/equipment"

export function SensorData({ equipment }: { equipment: Equipment | null }) {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 })
  const [timeView, setTimeView] = useState<"hour" | "day" | "week" | "month">("day")
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (equipment && equipment.sensors.length > 0) {
      setSelectedSensor(equipment.sensors[0].type)
    }
  }, [equipment])

  useEffect(() => {
    if (selectedSensor) {
      // Generate mock data for the selected sensor
      const newData = generateMockData(selectedSensor, getDataPointsForTimeView(timeView))
      setData(newData)
      setVisibleRange({ start: 0, end: 100 })
    }
  }, [selectedSensor, timeView])

  const getDataPointsForTimeView = (view: string): number => {
    switch (view) {
      case "hour":
        return 60 // One data point per minute
      case "day":
        return 24 * 60 // One data point per minute for 24 hours
      case "week":
        return 7 * 24 // One data point per hour for 7 days
      case "month":
        return 30 * 24 // One data point per hour for 30 days
      default:
        return 24 * 60 // Default to day view
    }
  }

  const generateMockData = (sensorType: string, dataPoints: number) => {
    const now = new Date()
    const data = []
    for (let i = dataPoints - 1; i >= 0; i--) {
      let time: Date
      switch (timeView) {
        case "hour":
          time = new Date(now.getTime() - i * 60000) // One data point per minute
          break
        case "day":
          time = new Date(now.getTime() - i * 60000) // One data point per minute
          break
        case "week":
          time = new Date(now.getTime() - i * 3600000) // One data point per hour
          break
        case "month":
          time = new Date(now.getTime() - i * 3600000) // One data point per hour
          break
        default:
          time = new Date(now.getTime() - i * 60000)
      }

      let value: number

      switch (sensorType) {
        case "temperature":
          value = 0 + Math.random() * 9 // Range: 0°F to 9°F (converted from -18°C to -13°C)
          break
        case "humidity":
          value = 40 + Math.random() * 10 // Range: 40% to 50%
          break
        case "door":
          value = Math.random() > 0.9 ? 1 : 0 // Mostly closed (0), occasionally open (1)
          break
        case "current":
          value = 5 + Math.random() * 3 // Range: 5A to 8A
          break
        case "vibration":
          value = Math.random() * 0.5 // Range: 0 mm/s to 0.5 mm/s
          break
        default:
          value = Math.random() * 100
      }

      data.push({
        time: time.toISOString(),
        value: Number(value.toFixed(2)),
      })
    }
    return data
  }

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom * 2, 8))
    updateVisibleRange(zoomLevel * 2)
  }

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom / 2, 1))
    updateVisibleRange(zoomLevel / 2)
  }

  const updateVisibleRange = (newZoomLevel: number) => {
    const visibleDataPoints = Math.floor(100 / newZoomLevel)
    setVisibleRange((prevRange) => ({
      start: prevRange.start,
      end: Math.min(prevRange.start + visibleDataPoints, 100),
    }))
  }

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      const scrollAmount = e.deltaY > 0 ? 5 : -5
      setVisibleRange((prevRange) => {
        const newStart = Math.max(0, Math.min(prevRange.start + scrollAmount, 100 - (prevRange.end - prevRange.start)))
        const newEnd = newStart + (prevRange.end - prevRange.start)
        return { start: newStart, end: newEnd }
      })
    }
  }

  const visibleData = data.slice(
    Math.floor((data.length * visibleRange.start) / 100),
    Math.floor((data.length * visibleRange.end) / 100),
  )

  if (!equipment) return null

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
        <CardTitle className="text-base font-medium">Sensor Data</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedSensor || ""} onValueChange={setSelectedSensor}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select sensor" />
            </SelectTrigger>
            <SelectContent>
              {equipment.sensors.map((sensor) => (
                <SelectItem key={sensor.id} value={sensor.type}>
                  {sensor.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeView} onValueChange={(value: "hour" | "day" | "week" | "month") => setTimeView(value)}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Time view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-1">
            <Button size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={chartRef}
          style={{ width: "100%", height: Math.min(250, 300 * zoomLevel) + "px", overflow: "hidden" }}
          className="sm:h-[300px]"
          onWheel={handleScroll}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                domain={["dataMin", "dataMax"]}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value) => [`${value} ${getSensorUnit(selectedSensor)}`, selectedSensor]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function getSensorUnit(sensorType: string | null): string {
  switch (sensorType) {
    case "temperature":
      return "°F"
    case "humidity":
      return "%"
    case "door":
      return "open/closed"
    case "current":
      return "A"
    case "vibration":
      return "mm/s"
    default:
      return ""
  }
}

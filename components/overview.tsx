"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Scatter,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Zap, Waves, Calendar, ZoomIn, ZoomOut, RefreshCw, AlertTriangle, Info } from "lucide-react"
import { equipmentData } from "./equipment-list"
import { cn } from "@/lib/utils"

// Define types for our data
type SensorReading = {
  date: string
  temperature: number
  energyCurrent: number
  energyLoad: number
  vibration: number
  compressorEfficiency: number
}

type LifespanDataPoint = {
  date: string
  actual: number | null
  predicted: number | null
  maintenance?: SensorReading
  sensorData?: SensorReading
}

// Update the MaintenanceEvent type
type MaintenanceEvent = {
  id: string
  equipmentId: string
  date: string
  type: "past" | "recommended"
  description: string
  impact: number
  cost: number
  priority: "low" | "medium" | "high"
  status: "completed" | "pending" | "overdue"
  assignedStaff: string
}

export function Overview({
  sharedMaintenanceEvents,
  onMaintenanceEventUpdate,
  liveSensorData,
}: {
  sharedMaintenanceEvents?: MaintenanceEvent[]
  onMaintenanceEventUpdate?: (events: MaintenanceEvent[]) => void
  liveSensorData?: SensorReading[]
}) {
  // State for UI controls
  const [selectedEquipment, setSelectedEquipment] = useState("all")
  const [timeRange, setTimeRange] = useState("6months")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showMaintenanceEvents, setShowMaintenanceEvents] = useState(true)
  const [showSensorData, setShowSensorData] = useState(true)
  const [showPredictions, setShowPredictions] = useState(true)
  const [confidenceInterval, setConfidenceInterval] = useState(80)
  const [viewMode, setViewMode] = useState<"individual" | "fleet">("individual")
  // State for data
  const [lifespanData, setLifespanData] = useState<LifespanDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([])
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 90)),
    to: new Date(new Date().setDate(new Date().getDate() + 180)),
  })

  // Update the generateLifespanData function to incorporate maintenance events and live sensor data
  const generateLifespanData = useCallback(() => {
    setIsLoading(true)

    // Calculate date ranges based on selected time range
    const today = new Date()
    let pastDays = 90
    let futureDays = 180

    switch (timeRange) {
      case "3months":
        pastDays = 45
        futureDays = 45
        break
      case "6months":
        pastDays = 90
        futureDays = 90
        break
      case "1year":
        pastDays = 180
        futureDays = 180
        break
      case "3years":
        pastDays = 365
        futureDays = 730
        break
    }

    // Generate past data (actual)
    const pastData: LifespanDataPoint[] = []
    for (let i = pastDays; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      // Start with 100% and decrease over time with some randomness
      const baseValue = 100 - (pastDays - i) * (25 / pastDays)
      const randomFactor = Math.random() * 3 - 1.5 // Random fluctuation

      // Add some equipment-specific variation
      let equipmentFactor = 0
      if (selectedEquipment !== "all") {
        const equipIndex = Number.parseInt(selectedEquipment.replace("equipment", "")) || 0
        equipmentFactor = (equipIndex % 5) * 2 - 5 // Different degradation rates
      }

      let actual = Math.max(0, Math.min(100, baseValue + randomFactor + equipmentFactor))

      // Check if there was a maintenance event on this date and apply its impact
      const maintenanceOnThisDay = maintenanceEvents.filter(
        (event) => event.date.split("T")[0] === dateString && (event.status === "completed" || event.type === "past"),
      )

      if (maintenanceOnThisDay.length > 0) {
        // Apply the impact of maintenance events
        maintenanceOnThisDay.forEach((event) => {
          actual = Math.min(100, actual + event.impact)
        })
      }

      // Use live sensor data if available, otherwise generate mock data
      const sensorData: SensorReading = liveSensorData?.find((d) => d.date === dateString) || {
        date: date.toISOString(),
        temperature: -18 + Math.random() * 5, // Range: -18°C to -13°C
        energyCurrent: 5 + Math.random() * 3, // Range: 5A to 8A
        energyLoad: 1 + Math.random() * 2, // Range: 1kW to 3kW
        vibration: Math.random() * 0.5, // Range: 0 mm/s to 0.5 mm/s
        compressorEfficiency: 90 - (pastDays - i) * (15 / pastDays) + (Math.random() * 10 - 5),
      }

      pastData.push({
        date: dateString,
        actual,
        predicted: null,
        sensorData,
      })
    }

    // Generate future data (predicted)
    const futureData: LifespanDataPoint[] = []
    for (let i = 1; i <= futureDays; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateString = date.toISOString().split("T")[0]

      // Continue the trend from the last actual data point
      const lastActual = pastData[pastData.length - 1].actual || 75
      const baseDecay =
        selectedEquipment === "all"
          ? 0.08
          : 0.05 + (Number.parseInt(selectedEquipment.replace("equipment", "")) % 5) * 0.02
      let predicted = Math.max(0, lastActual - i * baseDecay)

      // Check for future maintenance events and apply their predicted impact
      const futureMaintenance = maintenanceEvents.filter(
        (event) => event.date.split("T")[0] === dateString && event.status === "pending",
      )

      if (futureMaintenance.length > 0) {
        futureMaintenance.forEach((event) => {
          predicted = Math.min(100, predicted + event.impact)
        })
      }

      futureData.push({
        date: dateString,
        actual: null,
        predicted,
        maintenance: futureMaintenance.length > 0 ? futureMaintenance[0] : undefined,
      })
    }

    // Combine past and future data
    const combinedData = [...pastData, ...futureData]

    setLifespanData(combinedData)
    setLastUpdated(new Date())
    setIsLoading(false)
  }, [selectedEquipment, timeRange, maintenanceEvents, liveSensorData])

  // Update the useEffect that initializes data to use shared maintenance events and live sensor data
  useEffect(() => {
    if (maintenanceEvents.length === 0 && sharedMaintenanceEvents && sharedMaintenanceEvents.length > 0) {
      setMaintenanceEvents(sharedMaintenanceEvents)
    }
    generateLifespanData()

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance of update
        generateLifespanData()
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [generateLifespanData, sharedMaintenanceEvents])

  // Initialize data on component mount and when dependencies change
  // useEffect(() => {
  //   generateLifespanData()

  //   // Simulate real-time updates
  //   const interval = setInterval(() => {
  //     if (Math.random() > 0.7) {
  //       // 30% chance of update
  //       generateLifespanData()
  //     }
  //   }, 30000) // Update every 30 seconds

  //   return () => clearInterval(interval)
  // }, [generateLifespanData])

  // Update the initial maintenance events
  useEffect(() => {
    const initialEvents: MaintenanceEvent[] = [
      {
        id: "initial-1",
        equipmentId: "equipment1",
        date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
        type: "recommended",
        description: "Check refrigerant levels",
        impact: 10,
        cost: 500,
        priority: "medium",
        status: "pending",
        assignedStaff: "John Doe",
      },
      {
        id: "initial-2",
        equipmentId: "equipment2",
        date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        type: "recommended",
        description: "Inspect compressor",
        impact: 15,
        cost: 800,
        priority: "high",
        status: "pending",
        assignedStaff: "Jane Smith",
      },
    ]
    setMaintenanceEvents(initialEvents)
  }, [])

  const handleMaintenanceEventUpdate = (updatedEvents: MaintenanceEvent[]) => {
    setMaintenanceEvents(updatedEvents)
  }

  // Calculate risk zones
  const riskZones = useMemo(() => {
    return {
      high: { min: 0, max: 25 },
      medium: { min: 25, max: 60 },
      low: { min: 60, max: 100 },
    }
  }, [])

  // Filter data based on zoom level
  const visibleData = useMemo(() => {
    if (zoomLevel === 1) return lifespanData

    const centerIndex = Math.floor(lifespanData.length / 2)
    const visibleRange = Math.floor(lifespanData.length / zoomLevel)
    const startIndex = Math.max(0, centerIndex - Math.floor(visibleRange / 2))
    const endIndex = Math.min(lifespanData.length, startIndex + visibleRange)

    return lifespanData.slice(startIndex, endIndex)
  }, [lifespanData, zoomLevel])

  // Add a function to convert temperature
  const convertTemperature = (celsius: number) => {
    return (celsius * 9) / 5 + 32
  }

  // Update the CustomTooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      const value = dataPoint.actual !== null ? dataPoint.actual : dataPoint.predicted
      const isActual = dataPoint.actual !== null

      // Find maintenance event for this date
      const maintenanceEvent = maintenanceEvents.find((event) => event.date.split("T")[0] === dataPoint.date)

      // Determine risk level
      let riskLevel = "Low"
      let riskColor = "text-green-500"

      if (value <= riskZones.high.max) {
        riskLevel = "High"
        riskColor = "text-red-500"
      } else if (value <= riskZones.medium.max) {
        riskLevel = "Medium"
        riskColor = "text-yellow-500"
      }

      return (
        <div className="bg-background border rounded-md shadow-md p-3 max-w-xs">
          <p className="font-semibold">{new Date(label).toLocaleDateString()}</p>
          <p className="text-sm text-muted-foreground">
            {isActual ? "Actual" : "Predicted"} Remaining Lifespan:{" "}
            <span className="font-medium">{value.toFixed(1)}%</span>
          </p>
          <p className={`text-sm font-medium ${riskColor}`}>Risk Level: {riskLevel}</p>

          {maintenanceEvent && (
            <div className="mt-2 pt-2 border-t">
              <p className="font-medium">Maintenance Event</p>
              <p className="text-sm">{maintenanceEvent.description}</p>
              <p className="text-sm text-muted-foreground">Impact: +{maintenanceEvent.impact}% lifespan</p>
              <p className="text-sm text-muted-foreground">Status: {maintenanceEvent.status}</p>
            </div>
          )}

          {dataPoint.sensorData && showSensorData && (
            <div className="mt-2 pt-2 border-t">
              <p className="font-medium">Sensor Readings</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <p>Temperature: {convertTemperature(dataPoint.sensorData.temperature).toFixed(1)}°F</p>
                <p>Energy Current: {dataPoint.sensorData.energyCurrent.toFixed(1)}A</p>
                <p>Energy Load: {dataPoint.sensorData.energyLoad.toFixed(1)}kW</p>
                <p>Vibration: {dataPoint.sensorData.vibration.toFixed(2)}mm/s</p>
                <p>Compressor: {dataPoint.sensorData.compressorEfficiency.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  // Calculate the end of life date based on the data
  const endOfLifeDate = useMemo(() => {
    const futureData = lifespanData.filter((d) => d.predicted !== null && d.predicted <= 5)
    if (futureData.length > 0) {
      return new Date(futureData[0].date).toLocaleDateString()
    }
    return "Unknown"
  }, [lifespanData])

  // Update the daysUntilMaintenance calculation
  const daysUntilMaintenance = useMemo(() => {
    const today = new Date()
    const nextMaintenance = maintenanceEvents
      .filter((event) => event.status === "pending" && event.type === "recommended")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

    if (nextMaintenance) {
      const diffTime = Math.abs(new Date(nextMaintenance.date).getTime() - today.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return null
  }, [maintenanceEvents])

  // Calculate confidence interval bounds
  const confidenceBounds = useMemo(() => {
    if (!showPredictions) return null

    const factor = confidenceInterval / 100
    const bounds = lifespanData.map((point) => {
      if (point.predicted === null) return { date: point.date, upper: null, lower: null }

      const variance = (100 - confidenceInterval) / 10 // More uncertainty as confidence decreases
      const range = (point.predicted * variance) / 100

      return {
        date: point.date,
        upper: Math.min(100, point.predicted + range),
        lower: Math.max(0, point.predicted - range),
      }
    })

    return bounds
  }, [lifespanData, confidenceInterval, showPredictions])

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.5, 4))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.5, 1))
  }

  // Handle refresh data
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      generateLifespanData()
    }, 500)
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Equipment Health Score</CardTitle>
            <CardDescription>Live Equipment Condition Ratings & Predictive Maintenance</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-wrap gap-2">
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment (Fleet)</SelectItem>
                  {equipmentData.map((equipment) => (
                    <SelectItem key={equipment.id} value={`equipment${equipment.id}`}>
                      {equipment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="3years">3 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 justify-between sm:justify-start">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "individual" | "fleet")}>
                <TabsList>
                  <TabsTrigger value="individual">Individual</TabsTrigger>
                  <TabsTrigger value="fleet">Fleet View</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-1">
                <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 1}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 4}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Estimated End of Life</span>
                  </div>
                  <span className="font-bold">{endOfLifeDate}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Next Maintenance</span>
                  </div>
                  <span className="font-bold">
                    {daysUntilMaintenance ? `In ${daysUntilMaintenance} days` : "None scheduled"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 sm:col-span-2 md:col-span-1">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Confidence Level</span>
                  </div>
                  <div className="w-full sm:w-24">
                    <Slider
                      value={[confidenceInterval]}
                      min={50}
                      max={95}
                      step={5}
                      onValueChange={(value) => setConfidenceInterval(value[0])}
                    />
                    <div className="text-center text-xs mt-1">{confidenceInterval}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={showSensorData ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSensorData(!showSensorData)}
              >
                <Thermometer className="mr-1 h-4 w-4" />
                Sensor Data
              </Button>

              <Button
                variant={showPredictions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPredictions(!showPredictions)}
              >
                <Zap className="mr-1 h-4 w-4" />
                Predictions
              </Button>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Healthy</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Warning</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Critical</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] sm:h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  label={{ value: "Remaining Lifespan (%)", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, "dataMax + 5"]}
                  label={{ value: "Energy (kW, A)", angle: 90, position: "insideRight" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Risk zones */}
                <ReferenceArea
                  yAxisId="left"
                  y1={riskZones.high.min}
                  y2={riskZones.high.max}
                  fill="rgba(239, 68, 68, 0.1)"
                />
                <ReferenceArea
                  yAxisId="left"
                  y1={riskZones.medium.min}
                  y2={riskZones.medium.max}
                  fill="rgba(245, 158, 11, 0.1)"
                />
                <ReferenceArea
                  yAxisId="left"
                  y1={riskZones.low.min}
                  y2={riskZones.low.max}
                  fill="rgba(34, 197, 94, 0.1)"
                />

                {/* Critical threshold line */}
                <ReferenceLine
                  yAxisId="left"
                  y={25}
                  stroke="rgba(239, 68, 68, 0.7)"
                  strokeDasharray="3 3"
                  label="Critical Zone"
                />
                <ReferenceLine
                  yAxisId="left"
                  y={60}
                  stroke="rgba(245, 158, 11, 0.7)"
                  strokeDasharray="3 3"
                  label="Warning Zone"
                />

                {/* Actual data line */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 8 }}
                  name="Actual Lifespan"
                />

                {/* Predicted data line */}
                {showPredictions && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Predicted Lifespan"
                  />
                )}

                {/* Energy Current line */}
                {showSensorData && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sensorData.energyCurrent"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={false}
                    name="Energy Current (A)"
                  />
                )}

                {/* Energy Load line */}
                {showSensorData && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sensorData.energyLoad"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                    name="Energy Load (kW)"
                  />
                )}

                {/* Maintenance events */}
                {showMaintenanceEvents && (
                  <Scatter
                    yAxisId="left"
                    data={maintenanceEvents
                      .filter((event) => {
                        const eventDate = new Date(event.date)
                        return eventDate >= dateRange.from && eventDate <= dateRange.to
                      })
                      .map((event) => {
                        const dataPoint = lifespanData.find((d) => d.date === event.date.split("T")[0])
                        return {
                          date: event.date.split("T")[0],
                          value: dataPoint?.actual || dataPoint?.predicted || 50,
                          ...event,
                        }
                      })}
                    dataKey="date"
                    fill="hsl(var(--primary))"
                    shape={(props) => {
                      const { cx, cy, payload } = props
                      if (!payload) return null

                      const isPast = payload.status === "completed"
                      const color = isPast ? "hsl(var(--primary))" : "hsl(var(--secondary))"

                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={2} />
                          {!isPast && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={10}
                              fill="none"
                              stroke={color}
                              strokeWidth={1}
                              strokeDasharray="2 2"
                            />
                          )}
                        </g>
                      )
                    }}
                    name="Maintenance Events"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Maintenance events table */}
          {showMaintenanceEvents && false && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Maintenance Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Description</th>
                      <th className="text-left py-2">Impact</th>
                      <th className="text-left py-2">Cost</th>
                      <th className="text-left py-2">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {maintenanceEvents.map((event) => (
                      <tr key={event.id} className="border-b">
                        <td className="py-2">{new Date(event.date).toLocaleDateString()}</td>
                        <td className="py-2">
                          <Badge variant={event.type === "past" ? "default" : "outline"}>
                            {event.type === "past" ? "Completed" : "Recommended"}
                          </Badge>
                        </td>
                        <td className="py-2">{event.description}</td>
                        <td className="py-2">+{event.impact}% lifespan</td>
                        <td className="py-2">${event.cost}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              event.priority === "high"
                                ? "destructive"
                                : event.priority === "medium"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {event.priority}
                          </Badge>
                        </td>
                      </tr>
                    ))} */}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sensor data insights */}
          {showSensorData && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Sensor Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">Temperature</h4>
                        <p className="text-sm text-muted-foreground">
                          Average: {convertTemperature(-18 + Math.random() * 3).toFixed(1)}°F
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Fluctuation: {(Math.random() * 2 * 1.8).toFixed(1)}°F
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <div>
                        <h4 className="font-medium">Energy Consumption</h4>
                        <p className="text-sm text-muted-foreground">Average: {(6 + Math.random() * 2).toFixed(1)}kW</p>
                        <p className="text-sm text-muted-foreground">
                          Efficiency: {(85 + Math.random() * 10).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Waves className="h-5 w-5 text-red-500" />
                      <div>
                        <h4 className="font-medium">Vibration</h4>
                        <p className="text-sm text-muted-foreground">Average: {(Math.random() * 0.3).toFixed(2)}mm/s</p>
                        <p className="text-sm text-muted-foreground">
                          Peak: {(0.3 + Math.random() * 0.2).toFixed(2)}mm/s
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

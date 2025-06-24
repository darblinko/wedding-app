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
import { Badge } from "@/components/ui/badge"
import {
  Thermometer,
  Zap,
  Waves,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  AlertTriangle,
  PenToolIcon as Tool,
  Eye,
  EyeOff,
  Filter,
  ChevronDown,
  Clock,
} from "lucide-react"
import { equipmentData } from "./equipment-list"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  equipmentId: string
  actual: number | null
  predicted: number | null
  maintenance?: MaintenanceEvent
  sensorData?: SensorReading
  sensorAnomaly?: SensorAnomaly
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

type SensorAnomaly = {
  id: string
  equipmentId: string
  date: string
  sensorType: string
  value: number
  threshold: number
  impact: number
  description: string
  severity: "warning" | "critical"
}

type EquipmentFilter = {
  id: string
  name: string
  visible: boolean
  color: string
}

export function EquipmentHealthScore({
  sharedMaintenanceEvents,
  onMaintenanceEventUpdate,
  liveSensorData,
}: {
  sharedMaintenanceEvents?: MaintenanceEvent[]
  onMaintenanceEventUpdate?: (events: MaintenanceEvent[]) => void
  liveSensorData?: SensorReading[]
}) {
  // State for UI controls
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all")
  const [timeRange, setTimeRange] = useState("6months")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showMaintenanceEvents, setShowMaintenanceEvents] = useState(true)
  const [showSensorData, setShowSensorData] = useState(true)
  const [showSensorAnomalies, setShowSensorAnomalies] = useState(true)
  const [showPredictions, setShowPredictions] = useState(true)
  const [viewMode, setViewMode] = useState<"individual" | "fleet">("individual")

  // State for data
  const [lifespanData, setLifespanData] = useState<LifespanDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([])
  const [sensorAnomalies, setSensorAnomalies] = useState<SensorAnomaly[]>([])
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 90)),
    to: new Date(new Date().setDate(new Date().getDate() + 180)),
  })
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceEvent | SensorAnomaly | null>(null)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false)
  const [equipmentFilters, setEquipmentFilters] = useState<EquipmentFilter[]>([])
  const [criticalWarningOnly, setCriticalWarningOnly] = useState(false)

  // Initialize equipment filters
  useEffect(() => {
    const colors = [
      "#3b82f6", // blue
      "#ef4444", // red
      "#22c55e", // green
      "#f59e0b", // amber
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#14b8a6", // teal
      "#f97316", // orange
      "#6366f1", // indigo
      "#a855f7", // purple
    ]

    const filters = equipmentData.map((equipment, index) => ({
      id: equipment.id,
      name: equipment.name,
      visible: true,
      color: colors[index % colors.length],
    }))

    setEquipmentFilters(filters)
  }, [])

  // Generate sensor anomalies
  useEffect(() => {
    const anomalies: SensorAnomaly[] = []

    // Generate some random anomalies for each equipment
    equipmentData.forEach((equipment) => {
      const anomalyCount = Math.floor(Math.random() * 3) + 1 // 1-3 anomalies per equipment

      for (let i = 0; i < anomalyCount; i++) {
        const today = new Date()
        const randomDayOffset = Math.floor(Math.random() * 60) - 30 // -30 to +30 days from today
        const date = new Date(today)
        date.setDate(date.getDate() + randomDayOffset)

        const sensorTypes = ["temperature", "vibration", "current", "pressure"]
        const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)]

        const severity = Math.random() > 0.7 ? "critical" : "warning"

        anomalies.push({
          id: `anomaly-${equipment.id}-${i}`,
          equipmentId: equipment.id,
          date: date.toISOString(),
          sensorType,
          value: Math.random() * 100,
          threshold: Math.random() * 80,
          impact: -(Math.floor(Math.random() * 10) + 5), // Negative impact on lifespan
          description: `${sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} ${severity === "critical" ? "critical breach" : "warning threshold exceeded"}`,
          severity,
        })
      }
    })

    setSensorAnomalies(anomalies)
  }, [])

  // Update the generateLifespanData function to incorporate maintenance events, sensor anomalies, and live sensor data
  const generateLifespanData = useCallback(() => {
    setIsLoading(true)

    // Calculate date ranges based on selected time range
    const today = new Date()
    let totalDays = 180 // Default total timespan

    switch (timeRange) {
      case "3months":
        totalDays = 90
        break
      case "6months":
        totalDays = 180
        break
      case "1year":
        totalDays = 365
        break
      case "3years":
        totalDays = 1095
        break
    }

    // 80% past data, 20% future predictions
    const pastDays = Math.floor(totalDays * 0.8)
    const futureDays = Math.floor(totalDays * 0.2)

    // Generate data for each equipment
    let allEquipmentData: LifespanDataPoint[] = []

    // Filter equipment based on criticalWarningOnly
    const filteredEquipmentData = criticalWarningOnly
      ? equipmentData.filter((eq) => eq.status === "warning" || eq.status === "critical")
      : equipmentData

    // If a specific equipment is selected, only generate data for that one
    const equipmentToProcess =
      selectedEquipment === "all"
        ? filteredEquipmentData
        : filteredEquipmentData.filter((eq) => eq.id === selectedEquipment)

    equipmentToProcess.forEach((equipment) => {
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
        const equipIndex = Number.parseInt(equipment.id) || 0
        equipmentFactor = (equipIndex % 5) * 2 - 5 // Different degradation rates

        let actual = Math.max(0, Math.min(100, baseValue + randomFactor + equipmentFactor))

        // Check if there was a maintenance event on this date and apply its impact
        const maintenanceOnThisDay = maintenanceEvents.filter(
          (event) =>
            event.date.split("T")[0] === dateString &&
            event.equipmentId === equipment.id &&
            (event.status === "completed" || event.type === "past"),
        )

        if (maintenanceOnThisDay.length > 0) {
          // Apply the impact of maintenance events
          maintenanceOnThisDay.forEach((event) => {
            actual = Math.min(100, actual + event.impact)
          })
        }

        // Check if there was a sensor anomaly on this date and apply its impact
        const anomalyOnThisDay = sensorAnomalies.filter(
          (anomaly) => anomaly.date.split("T")[0] === dateString && anomaly.equipmentId === equipment.id,
        )

        if (anomalyOnThisDay.length > 0) {
          // Apply the impact of sensor anomalies
          anomalyOnThisDay.forEach((anomaly) => {
            actual = Math.max(0, actual + anomaly.impact) // Anomalies typically have negative impact
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

        // Find maintenance event for this date
        const maintenanceEvent = maintenanceEvents.find(
          (event) => event.date.split("T")[0] === dateString && event.equipmentId === equipment.id,
        )

        // Find sensor anomaly for this date
        const sensorAnomaly = sensorAnomalies.find(
          (anomaly) => anomaly.date.split("T")[0] === dateString && anomaly.equipmentId === equipment.id,
        )

        pastData.push({
          date: dateString,
          equipmentId: equipment.id,
          actual,
          predicted: null,
          sensorData,
          maintenance: maintenanceEvent,
          sensorAnomaly,
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
        const baseDecay = 0.05 + (Number.parseInt(equipment.id) % 5) * 0.02
        let predicted = Math.max(0, lastActual - i * baseDecay)

        // Check for future maintenance events and apply their predicted impact
        const futureMaintenance = maintenanceEvents.filter(
          (event) =>
            event.date.split("T")[0] === dateString && event.equipmentId === equipment.id && event.status === "pending",
        )

        if (futureMaintenance.length > 0) {
          futureMaintenance.forEach((event) => {
            predicted = Math.min(100, predicted + event.impact)
          })
        }

        futureData.push({
          date: dateString,
          equipmentId: equipment.id,
          actual: null,
          predicted,
          maintenance: futureMaintenance.length > 0 ? futureMaintenance[0] : undefined,
        })
      }

      // Combine past and future data
      allEquipmentData = [...allEquipmentData, ...pastData, ...futureData]
    })

    setLifespanData(allEquipmentData)
    setLastUpdated(new Date())
    setIsLoading(false)
  }, [selectedEquipment, timeRange, maintenanceEvents, liveSensorData, sensorAnomalies, criticalWarningOnly])

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

  // Update the initial maintenance events
  useEffect(() => {
    const initialEvents: MaintenanceEvent[] = [
      {
        id: "initial-1",
        equipmentId: "1",
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
        equipmentId: "2",
        date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        type: "recommended",
        description: "Inspect compressor",
        impact: 15,
        cost: 800,
        priority: "high",
        status: "pending",
        assignedStaff: "Jane Smith",
      },
      {
        id: "initial-3",
        equipmentId: "3",
        date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        type: "past",
        description: "Replace door seals",
        impact: 8,
        cost: 350,
        priority: "medium",
        status: "completed",
        assignedStaff: "Mike Johnson",
      },
      {
        id: "initial-4",
        equipmentId: "4",
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        type: "past",
        description: "Clean condenser coils",
        impact: 5,
        cost: 200,
        priority: "low",
        status: "completed",
        assignedStaff: "Sarah Williams",
      },
      {
        id: "initial-5",
        equipmentId: "5",
        date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
        type: "recommended",
        description: "Lubricate moving parts",
        impact: 7,
        cost: 150,
        priority: "medium",
        status: "pending",
        assignedStaff: "David Brown",
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

  // Filter data based on zoom level and visible equipment
  const visibleData = useMemo(() => {
    // First filter by zoom level
    let zoomedData = lifespanData
    if (zoomLevel !== 1) {
      const centerIndex = Math.floor(lifespanData.length / 2)
      const visibleRange = Math.floor(lifespanData.length / zoomLevel)
      const startIndex = Math.max(0, centerIndex - Math.floor(visibleRange / 2))
      const endIndex = Math.min(lifespanData.length, startIndex + visibleRange)
      zoomedData = lifespanData.slice(startIndex, endIndex)
    }

    // Then filter by visible equipment
    const visibleEquipmentIds = equipmentFilters.filter((filter) => filter.visible).map((filter) => filter.id)

    return zoomedData.filter((dataPoint) => visibleEquipmentIds.includes(dataPoint.equipmentId))
  }, [lifespanData, zoomLevel, equipmentFilters])

  // Group data by date for proper display
  const groupedData = useMemo(() => {
    const dateMap = new Map()

    visibleData.forEach((dataPoint) => {
      if (!dateMap.has(dataPoint.date)) {
        dateMap.set(dataPoint.date, {
          date: dataPoint.date,
          maintenance: [],
          sensorAnomaly: [],
        })
      }

      const dateEntry = dateMap.get(dataPoint.date)

      // Add equipment-specific data
      dateEntry[`actual_${dataPoint.equipmentId}`] = dataPoint.actual
      dateEntry[`predicted_${dataPoint.equipmentId}`] = dataPoint.predicted

      // Add maintenance events
      if (dataPoint.maintenance && !dateEntry.maintenance.some((m) => m.id === dataPoint.maintenance?.id)) {
        dateEntry.maintenance.push(dataPoint.maintenance)
      }

      // Add sensor anomalies
      if (dataPoint.sensorAnomaly && !dateEntry.sensorAnomaly.some((a) => a.id === dataPoint.sensorAnomaly?.id)) {
        dateEntry.sensorAnomaly.push(dataPoint.sensorAnomaly)
      }
    })

    return Array.from(dateMap.values())
  }, [visibleData])

  // Add a function to convert temperature
  const convertTemperature = (celsius: number) => {
    return (celsius * 9) / 5 + 32
  }

  // Update the CustomTooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      const date = new Date(label)

      // Find all equipment data for this date
      const equipmentData = []
      for (const filter of equipmentFilters) {
        const actualKey = `actual_${filter.id}`
        const predictedKey = `predicted_${filter.id}`

        if (dataPoint[actualKey] !== undefined || dataPoint[predictedKey] !== undefined) {
          const value = dataPoint[actualKey] !== null ? dataPoint[actualKey] : dataPoint[predictedKey]
          const isActual = dataPoint[actualKey] !== null && dataPoint[actualKey] !== undefined

          if (value !== undefined) {
            equipmentData.push({
              id: filter.id,
              name: filter.name,
              value,
              isActual,
              color: filter.color,
            })
          }
        }
      }

      // Find maintenance events for this date
      const maintenanceEvents = dataPoint.maintenance || []

      // Find sensor anomalies for this date
      const sensorAnomalies = dataPoint.sensorAnomaly || []

      return (
        <div className="bg-background border rounded-md shadow-md p-3 max-w-xs">
          <p className="font-semibold">{format(date, "MMM d, yyyy")}</p>

          {equipmentData.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Equipment Health Scores:</p>
              <div className="space-y-1 mt-1">
                {equipmentData.map((eq) => {
                  // Determine risk level
                  let riskLevel = "Low"
                  let riskColor = "text-green-500"

                  if (eq.value <= riskZones.high.max) {
                    riskLevel = "High"
                    riskColor = "text-red-500"
                  } else if (eq.value <= riskZones.medium.max) {
                    riskLevel = "Medium"
                    riskColor = "text-yellow-500"
                  }

                  return (
                    <div key={eq.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: eq.color }}></div>
                        <span className="text-sm">{eq.name}:</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{eq.value.toFixed(1)}%</span>
                        <span className={`text-xs ml-2 ${riskColor}`}>({riskLevel})</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add sensor data readings section */}
          {(() => {
            // Find sensor data for this date from the first equipment that has data
            const sensorData = visibleData.find(d => d.date === label)?.sensorData

            if (sensorData) {
              return (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm font-medium">Sensor Readings:</p>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                    <div className="flex items-center">
                      <Thermometer className="h-3 w-3 mr-1 text-blue-500" />
                      <span>{convertTemperature(sensorData.temperature).toFixed(1)}°F</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                      <span>{sensorData.energyCurrent.toFixed(1)}A</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-1 text-green-500" />
                      <span>{sensorData.energyLoad.toFixed(1)}kW</span>
                    </div>
                    <div className="flex items-center">
                      <Waves className="h-3 w-3 mr-1 text-red-500" />
                      <span>{sensorData.vibration.toFixed(2)}mm/s</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="w-3 h-3 rounded-full mr-1 bg-purple-500"></div>
                      <span>Efficiency: {sensorData.compressorEfficiency.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })()}

          {maintenanceEvents.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm font-medium">Maintenance Events:</p>
              <div className="space-y-1 mt-1">
                {maintenanceEvents.map((event) => (
                  <div key={event.id} className="text-sm">
                    <div className="flex items-center">
                      <Tool className="h-3 w-3 mr-1" />
                      <span>{equipmentData.find((eq) => eq.id === event.equipmentId)?.name || "Equipment"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground">Impact: +{event.impact}% lifespan</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sensorAnomalies.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm font-medium">Sensor Anomalies:</p>
              <div className="space-y-1 mt-1">
                {sensorAnomalies.map((anomaly) => (
                  <div key={anomaly.id} className="text-sm">
                    <div className="flex items-center">
                      <AlertTriangle
                        className={`h-3 w-3 mr-1 ${anomaly.severity === "critical" ? "text-red-500" : "text-yellow-500"}`}
                      />
                      <span>{equipmentData.find((eq) => eq.id === anomaly.equipmentId)?.name || "Equipment"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                    <p className="text-xs text-muted-foreground">Impact: {anomaly.impact}% lifespan</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">Click for more details</div>
        </div>
      )
    }

    return null
  }

  // Handle event click
  const handleEventClick = (data: any, index: number) => {
    // Check if there are maintenance events or sensor anomalies on this date
    const events = [...(data.maintenance || []), ...(data.sensorAnomaly || [])]

    if (events.length > 0) {
      // If there's only one event, select it directly
      if (events.length === 1) {
        setSelectedEvent(events[0])
        setIsEventDetailsOpen(true)
      }
      // If there are multiple events, show a selection dialog
      else {
        // For now, just select the first one
        setSelectedEvent(events[0])
        setIsEventDetailsOpen(true)
      }
    }
  }

  // Toggle equipment visibility
  const toggleEquipmentVisibility = (id: string) => {
    setEquipmentFilters((prev) =>
      prev.map((filter) => (filter.id === id ? { ...filter, visible: !filter.visible } : filter)),
    )
  }

  // Show/hide all equipment
  const toggleAllEquipment = (visible: boolean) => {
    setEquipmentFilters((prev) => prev.map((filter) => ({ ...filter, visible })))
  }

  // Calculate the end of life date based on the data

  // Update the daysUntilMaintenance calculation

  // Calculate confidence interval bounds

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

  // Get equipment location
  const getEquipmentLocation = (id: string) => {
    const equipment = equipmentData.find((eq) => eq.id === id)
    return equipment ? equipment.location : ""
  }

  // Get equipment status
  const getEquipmentStatus = (id: string) => {
    const equipment = equipmentData.find((eq) => eq.id === id)
    return equipment ? equipment.status : "unknown"
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Equipment Health Score</CardTitle>
            <CardDescription>Real-time Equipment Condition Ratings & Predictive Maintenance</CardDescription>
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
                  <SelectItem value="all">All Equipment</SelectItem>
                  {equipmentData.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Equipment Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <div className="p-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="critical-warning-only"
                          checked={criticalWarningOnly}
                          onCheckedChange={(checked) => setCriticalWarningOnly(!!checked)}
                        />
                        <Label htmlFor="critical-warning-only">Critical & Warning Only</Label>
                      </div>
                      <div className="flex justify-between mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllEquipment(true)}
                          className="text-xs h-7"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Show All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllEquipment(false)}
                          className="text-xs h-7"
                        >
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hide All
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="p-2 space-y-2">
                        {equipmentFilters.map((filter) => (
                          <div key={filter.id} className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: filter.color }}></div>
                            <Checkbox
                              id={`filter-${filter.id}`}
                              checked={filter.visible}
                              onCheckedChange={() => toggleEquipmentVisibility(filter.id)}
                            />
                            <Label htmlFor={`filter-${filter.id}`} className="text-sm">
                              {filter.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2 justify-between sm:justify-start">
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

          {/* Equipment Header */}
          {selectedEquipment !== "all" && (
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {equipmentData.find((eq) => eq.id === selectedEquipment)?.name || "Unknown Equipment"}
                  </h3>
                  <p className="text-sm text-muted-foreground">Location: {getEquipmentLocation(selectedEquipment)}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <Badge
                    className={cn(
                      "text-sm",
                      getEquipmentStatus(selectedEquipment) === "operational" && "bg-green-100 text-green-800",
                      getEquipmentStatus(selectedEquipment) === "warning" && "bg-yellow-100 text-yellow-800",
                      getEquipmentStatus(selectedEquipment) === "critical" && "bg-red-100 text-red-800",
                      getEquipmentStatus(selectedEquipment) === "maintenance" && "bg-blue-100 text-blue-800",
                    )}
                  >
                    {getEquipmentStatus(selectedEquipment).charAt(0).toUpperCase() +
                      getEquipmentStatus(selectedEquipment).slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4"></div>

          <div className="h-[300px] sm:h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={groupedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onClick={handleEventClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                />
                <YAxis domain={[0, 100]} label={{ value: "Health Score (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  content={(props) => {
                    const { payload } = props
                    if (!payload) return null

                    // Create a map to store unique equipment entries by ID
                    const equipmentMap = new Map()

                    // Process payload items
                    payload.forEach((entry) => {
                      const { dataKey, color } = entry

                      // Handle equipment data lines (both actual and predicted)
                      if (dataKey.startsWith("actual_") || dataKey.startsWith("predicted_")) {
                        const equipmentId = dataKey.split("_")[1]
                        const equipment = equipmentData.find((eq) => eq.id === equipmentId)

                        if (equipment && !equipmentMap.has(equipmentId)) {
                          equipmentMap.set(equipmentId, {
                            id: equipmentId,
                            name: equipment.name,
                            color: color,
                          })
                        }
                      }
                    })

                    // Find maintenance and anomaly entries
                    const maintenanceEntry = payload.find(
                      (entry) => entry.dataKey === "maintenance" || entry.name === "Maintenance Events",
                    )
                    const anomalyEntry = payload.find(
                      (entry) => entry.dataKey === "sensorAnomaly" || entry.name === "Sensor Anomalies",
                    )

                    return (
                      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        {/* Equipment entries */}
                        {Array.from(equipmentMap.values()).map((item) => (
                          <div key={item.id} className="flex items-center mr-4">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm">{item.name}</span>
                          </div>
                        ))}

                        {/* Maintenance events entry */}
                        {showMaintenanceEvents && maintenanceEntry && (
                          <div className="flex items-center mr-4">
                            <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                            <span className="text-sm">Maintenance Events</span>
                          </div>
                        )}

                        {/* Sensor anomalies entry */}
                        {showSensorAnomalies && anomalyEntry && (
                          <div className="flex items-center mr-4">
                            <div className="w-3 h-3 rounded-full mr-2 bg-yellow-500"></div>
                            <span className="text-sm">Sensor Anomalies</span>
                          </div>
                        )}
                      </div>
                    )
                  }}
                />

                {/* Risk zones */}
                <ReferenceArea y1={riskZones.high.min} y2={riskZones.high.max} fill="rgba(239, 68, 68, 0.1)" />
                <ReferenceArea y1={riskZones.medium.min} y2={riskZones.medium.max} fill="rgba(245, 158, 11, 0.1)" />
                <ReferenceArea y1={riskZones.low.min} y2={riskZones.low.max} fill="rgba(34, 197, 94, 0.1)" />

                {/* Critical threshold line */}
                <ReferenceLine y={25} stroke="rgba(239, 68, 68, 0.7)" strokeDasharray="3 3" label="Critical Zone" />
                <ReferenceLine y={60} stroke="rgba(245, 158, 11, 0.7)" strokeDasharray="3 3" label="Warning Zone" />

                {/* Actual data lines for each equipment */}
                {equipmentFilters
                  .filter((filter) => filter.visible)
                  .map((filter) => (
                    <Line
                      key={`actual_${filter.id}`}
                      type="monotone"
                      dataKey={`actual_${filter.id}`}
                      stroke={filter.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 8 }}
                      name={`actual_${filter.id}`}
                      connectNulls
                    />
                  ))}

                {/* Predicted data lines for each equipment */}
                {showPredictions &&
                  equipmentFilters
                    .filter((filter) => filter.visible)
                    .map((filter) => (
                      <Line
                        key={`predicted_${filter.id}`}
                        type="monotone"
                        dataKey={`predicted_${filter.id}`}
                        stroke={filter.color}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name={`predicted_${filter.id}`}
                        connectNulls
                        legend={false}
                      />
                    ))}

                {/* Maintenance events */}
                {showMaintenanceEvents && (
                  <Scatter
                    data={groupedData.filter((d) => d.maintenance && d.maintenance.length > 0)}
                    fill="hsl(var(--primary))"
                    shape={(props) => {
                      const { cx, cy } = props
                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="white" strokeWidth={2} />
                          <Tool x={cx! - 4} y={cy! - 4} className="h-8 w-8 text-white" />
                        </g>
                      )
                    }}
                    name="Maintenance Events"
                  />
                )}

                {/* Sensor anomalies */}
                {showSensorAnomalies && (
                  <Scatter
                    data={groupedData.filter((d) => d.sensorAnomaly && d.sensorAnomaly.length > 0)}
                    fill="hsl(var(--primary))"
                    shape={(props) => {
                      const { cx, cy, payload } = props
                      const anomaly = payload?.sensorAnomaly?.[0]
                      const color = anomaly?.severity === "critical" ? "#ef4444" : "#f59e0b"

                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={2} />
                          <AlertTriangle x={cx! - 4} y={cy! - 4} className="h-8 w-8 text-white" />
                        </g>
                      )
                    }}
                    name="Sensor Anomalies"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Event Details Dialog */}
          <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedEvent && "maintenance" in selectedEvent ? (
                    <div className="flex items-center">
                      <Tool className="mr-2 h-5 w-5 text-blue-500" />
                      Maintenance Event Details
                    </div>
                  ) : selectedEvent && "severity" in selectedEvent ? (
                    <div className="flex items-center">
                      <AlertTriangle
                        className={`mr-2 h-5 w-5 ${selectedEvent.severity === "critical" ? "text-red-500" : "text-yellow-500"}`}
                      />
                      Sensor Anomaly Details
                    </div>
                  ) : (
                    "Event Details"
                  )}
                </DialogTitle>
              </DialogHeader>

              {selectedEvent && "maintenance" in selectedEvent ? (
                // Maintenance event details
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Equipment</h3>
                    <p>{equipmentData.find((e) => e.id === selectedEvent.equipmentId)?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p>{selectedEvent.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Date</h3>
                      <p>{format(new Date(selectedEvent.date), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <p>{selectedEvent.status}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Priority</h3>
                      <p>{selectedEvent.priority}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Assigned To</h3>
                      <p>{selectedEvent.assignedStaff}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Impact</h3>
                    <p>+{selectedEvent.impact}% equipment health</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Estimated Cost</h3>
                    <p>${selectedEvent.cost.toFixed(2)}</p>
                  </div>
                  {selectedEvent.status !== "completed" && (
                    <Button
                      onClick={() => {
                        const updatedEvents = maintenanceEvents.map((event) =>
                          event.id === selectedEvent.id ? { ...event, status: "completed" } : event,
                        )
                        setMaintenanceEvents(updatedEvents)
                        setIsEventDetailsOpen(false)
                      }}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              ) : selectedEvent && "severity" in selectedEvent ? (
                // Sensor anomaly details
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Equipment</h3>
                    <p>{equipmentData.find((e) => e.id === selectedEvent.equipmentId)?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p>{selectedEvent.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Date</h3>
                      <p>{format(new Date(selectedEvent.date), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Severity</h3>
                      <p>{selectedEvent.severity}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Sensor Type</h3>
                      <p>{selectedEvent.sensorType}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Value</h3>
                      <p>{selectedEvent.value.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Threshold</h3>
                    <p>{selectedEvent.threshold.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Impact</h3>
                    <p>{selectedEvent.impact}% equipment health</p>
                  </div>
                  <Button
                    onClick={() => {
                      // In a real application, you might want to mark this as acknowledged
                      setIsEventDetailsOpen(false)
                    }}
                  >
                    Acknowledge
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">No event details available</div>
              )}
            </DialogContent>
          </Dialog>

          {/* Sensor data insights */}
          {showSensorData && selectedEquipment !== "all" && (
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

          {/* Timeline of recent events */}
          {selectedEquipment !== "all" && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Recent Events Timeline</h3>
              <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 pl-8 space-y-6 py-2">
                {/* Generate some mock timeline events */}
                {[...Array(4)].map((_, index) => {
                  const isMaintenanceEvent = Math.random() > 0.5
                  const daysAgo = index * 7 + Math.floor(Math.random() * 5)
                  const date = new Date()
                  date.setDate(date.getDate() - daysAgo)

                  return (
                    <div key={index} className="relative">
                      <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full border border-white bg-gray-100 dark:border-gray-900 dark:bg-gray-700 flex items-center justify-center">
                        {isMaintenanceEvent ? (
                          <Tool className="h-3 w-3 text-blue-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {format(date, "MMMM d, yyyy")}
                      </time>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isMaintenanceEvent ? "Maintenance Performed" : "Sensor Anomaly Detected"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isMaintenanceEvent
                          ? "Routine maintenance completed. Replaced filters and checked refrigerant levels."
                          : "Temperature fluctuation detected. System automatically adjusted settings."}
                      </p>
                    </div>
                  )
                })}

                <div className="absolute -left-3 bottom-0 h-6 w-6 rounded-full border-4 border-white bg-primary dark:border-gray-900 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

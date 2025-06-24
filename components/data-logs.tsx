"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type SensorReading = {
  id: string
  timestamp: Date
  deviceId: string
  equipmentName: string
  sensorType: string
  reading: string
  unit: string
  status: "normal" | "warning" | "critical"
  location: string
  batteryLevel?: number
  signalStrength?: number
}

const EQUIPMENT_LIST = [
  "Display Freezer 1",
  "Walk-In Cooler",
  "Ice Cream Display",
  "Freezer 1",
  "Compressor Unit A",
  "Evaporator B",
]
const SENSOR_TYPES = ["Temperature", "Humidity", "Door Status", "Energy Current", "Vibration", "Pressure"]
const LOCATIONS = ["Store Front", "Back Room", "Kitchen", "Storage Area"]

const generateReading = (): SensorReading => {
  const equipment = EQUIPMENT_LIST[Math.floor(Math.random() * EQUIPMENT_LIST.length)]
  const sensorType = SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)]
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
  const status = Math.random() > 0.85 ? "warning" : Math.random() > 0.97 ? "critical" : "normal"

  let reading: string
  let unit: string

  switch (sensorType) {
    case "Temperature":
      const temp = (Math.random() * 10 - 25) * 1.8 + 32
      reading = temp.toFixed(1)
      unit = "°F"
      break
    case "Humidity":
      reading = (40 + Math.random() * 20).toFixed(1)
      unit = "%"
      break
    case "Door Status":
      reading = Math.random() > 0.9 ? "Open" : "Closed"
      unit = ""
      break
    case "Energy Current":
      reading = (Math.random() * 5 + 5).toFixed(2)
      unit = "A"
      break
    case "Vibration":
      reading = (Math.random() * 0.5).toFixed(3)
      unit = "mm/s"
      break
    case "Pressure":
      reading = (Math.random() * 50 + 100).toFixed(1)
      unit = "PSI"
      break
    default:
      reading = "N/A"
      unit = ""
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    deviceId: `IOT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    equipmentName: equipment,
    sensorType,
    reading,
    unit,
    status,
    location,
    batteryLevel: Math.floor(Math.random() * 100),
    signalStrength: Math.floor(Math.random() * 100),
  }
}

export function DataLogs({
  onSensorDataUpdate,
}: {
  onSensorDataUpdate?: (data: SensorReading[]) => void
}) {
  const [filter, setFilter] = useState({ equipment: "all", sensorType: "all", search: "", status: "all" })
  const readingsRef = useRef<SensorReading[]>([])
  const [, forceUpdate] = useState({})
  const onSensorDataUpdateRef = useRef<(data: SensorReading[]) => void>(() => {})

  useEffect(() => {
    onSensorDataUpdateRef.current = onSensorDataUpdate ?? (() => {})
  }, [onSensorDataUpdate])

  const addReading = useCallback(() => {
    const newReading = generateReading()
    readingsRef.current = [newReading, ...readingsRef.current.slice(0, 99)]
    onSensorDataUpdateRef.current(readingsRef.current)
    forceUpdate({})
  }, [])

  useEffect(() => {
    // Initial data generation
    readingsRef.current = Array.from({ length: 100 }, generateReading)
    onSensorDataUpdateRef.current(readingsRef.current)
    forceUpdate({})

    // Set up interval for new readings
    const interval = setInterval(addReading, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredReadings = readingsRef.current.filter(
    (reading) =>
      (filter.equipment === "all" || reading.equipmentName === filter.equipment) &&
      (filter.sensorType === "all" || reading.sensorType === filter.sensorType) &&
      (filter.status === "all" || reading.status === filter.status) &&
      (filter.search === "" ||
        reading.equipmentName.toLowerCase().includes(filter.search.toLowerCase()) ||
        reading.sensorType.toLowerCase().includes(filter.search.toLowerCase()) ||
        reading.deviceId.toLowerCase().includes(filter.search.toLowerCase()) ||
        reading.location.toLowerCase().includes(filter.search.toLowerCase())),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>IoT Data Logs</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Real-time sensor data from connected devices</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
            <Select
              value={filter.equipment}
              onValueChange={(value) => setFilter((prev) => ({ ...prev, equipment: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                {EQUIPMENT_LIST.map((eq) => (
                  <SelectItem key={eq} value={eq}>
                    {eq}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.sensorType}
              onValueChange={(value) => setFilter((prev) => ({ ...prev, sensorType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sensors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sensor Types</SelectItem>
                {SENSOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.status || "all"}
              onValueChange={(value) => setFilter((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow">
            <Input
              placeholder="Search devices, equipment, or sensor types..."
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
        <div className="overflow-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Sensor</TableHead>
                <TableHead>Reading</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReadings.slice(0, 50).map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="font-mono text-xs">{reading.timestamp.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{reading.deviceId}</TableCell>
                  <TableCell>{reading.equipmentName}</TableCell>
                  <TableCell>{reading.sensorType}</TableCell>
                  <TableCell className="font-mono">
                    {reading.reading} {reading.unit}
                  </TableCell>
                  <TableCell>{reading.location}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        reading.status === "critical"
                          ? "bg-red-100 text-red-800"
                          : reading.status === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {reading.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs">{reading.signalStrength}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {Math.min(filteredReadings.length, 50)} of {filteredReadings.length} records
        </div>
      </CardContent>
    </Card>
  )
}

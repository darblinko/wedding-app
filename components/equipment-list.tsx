"use client"

import { useState } from "react"
import { Search, AlertCircle, MoreHorizontal, Thermometer, Activity, Waves, Droplets, Zap } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SensorData } from "@/components/sensor-data"
import { MaintenanceSchedule } from "@/components/maintenance-schedule"
import { EditEquipmentForm } from "@/components/edit-equipment-form"
import { EquipmentHistory } from "@/components/equipment-history"
import { generateEquipmentReport } from "@/lib/generate-report"
import type { Equipment } from "@/lib/equipment"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const getEquipmentCategory = (name: string) => {
  if (name.toLowerCase().includes("freezer")) return "Freezer"
  if (name.toLowerCase().includes("ice cream")) return "Ice Cream Equipment"
  if (name.toLowerCase().includes("soft serve")) return "Soft Serve Equipment"
  if (name.toLowerCase().includes("blender") || name.toLowerCase().includes("milkshake")) return "Blending Equipment"
  return "Other"
}

const getUniqueLocations = () => {
  return [...new Set(equipmentData.map((equipment) => equipment.location))]
}

const getUniqueCategories = () => {
  return [...new Set(equipmentData.map((equipment) => getEquipmentCategory(equipment.name)))]
}

export const equipmentData: Equipment[] = [
  {
    id: "1",
    name: "Display Freezer 1",
    model: "IF-2000",
    serialNumber: "DF1-001-2022",
    location: "Front Store",
    manufacturer: "IceCool Tech",
    installDate: new Date("2022-03-15"),
    status: "operational",
    lastMaintenance: new Date("2023-01-10"),
    nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    warranty: {
      provider: "IceCool Warranty",
      startDate: new Date("2022-03-15"),
      endDate: new Date("2025-03-15"),
      status: "active",
    },
    sensors: [
      { id: "s1", type: "temperature", status: "active", currentReading: -0.7, unit: "°F" }, // Converted from -18.5°C
      { id: "s2", type: "humidity", status: "active", currentReading: 45.2, unit: "%" },
      { id: "s3", type: "current", status: "active", currentReading: 5.2, unit: "A" },
    ],
    uptime: 98.5,
    energyConsumption: 250,
    assignedStaff: "Alice Johnson",
    serviceProviderContact: "support@icecooltech.com",
    runTime: 3600,
    cycles: {
      last24h: 12,
      last7d: 72,
      last30d: 280,
    },
    averageCyclesPerHour: 0.5,
    cyclesTrend: 5,
    energyImpact: 2,
    maintenanceTrigger: 500,
  },
  {
    id: "2",
    name: "Ice Cream Maker 1",
    model: "ICM-5000",
    serialNumber: "ICM1-002-2022",
    location: "Kitchen",
    manufacturer: "FrozenDelight Systems",
    installDate: new Date("2022-04-20"),
    status: "warning",
    lastMaintenance: new Date("2023-02-18"),
    nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    warranty: {
      provider: "FrozenDelight Warranty",
      startDate: new Date("2022-04-20"),
      endDate: new Date("2025-04-20"),
      status: "active",
    },
    sensors: [
      { id: "s4", type: "temperature", status: "warning", currentReading: 22.6, unit: "°F" }, // Converted from -5.2°C
      { id: "s5", type: "current", status: "active", currentReading: 8.7, unit: "A" },
      { id: "s6", type: "vibration", status: "active", currentReading: 0.15, unit: "mm/s" },
    ],
    uptime: 92.3,
    energyConsumption: 400,
    assignedStaff: "Bob Smith",
    serviceProviderContact: "support@frozendelight.com",
    runTime: 2800,
    cycles: {
      last24h: 8,
      last7d: 50,
      last30d: 190,
    },
    averageCyclesPerHour: 0.3,
    cyclesTrend: -3,
    energyImpact: 8,
    maintenanceTrigger: 400,
  },
  {
    id: "3",
    name: "Soft Serve Machine",
    model: "SSM-3000",
    serialNumber: "SSM3-003-2022",
    location: "Counter",
    manufacturer: "SoftServe Solutions",
    installDate: new Date("2022-05-10"),
    status: "operational",
    lastMaintenance: new Date("2023-03-05"),
    nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    warranty: {
      provider: "SoftServe Solutions Warranty",
      startDate: new Date("2022-05-10"),
      endDate: new Date("2024-05-10"),
      status: "active",
    },
    sensors: [
      { id: "s7", type: "temperature", status: "active", currentReading: 24.8, unit: "°F" }, // Converted from -4.0°C
      { id: "s8", type: "current", status: "active", currentReading: 6.5, unit: "A" },
      { id: "s9", type: "vibration", status: "active", currentReading: 0.08, unit: "mm/s" },
    ],
    uptime: 97.8,
    energyConsumption: 350,
    assignedStaff: "Charlie Davis",
    serviceProviderContact: "support@softservesolutions.com",
    runTime: 4200,
    cycles: {
      last24h: 15,
      last7d: 85,
      last30d: 320,
    },
    averageCyclesPerHour: 0.6,
    cyclesTrend: 7,
    energyImpact: 3,
    maintenanceTrigger: 600,
  },
  {
    id: "4",
    name: "Walk-in Freezer",
    model: "WF-5000",
    serialNumber: "WF5-004-2022",
    location: "Back Store",
    manufacturer: "ColdStorage Inc.",
    installDate: new Date("2022-02-01"),
    status: "operational",
    lastMaintenance: new Date("2023-01-15"),
    nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    warranty: {
      provider: "ColdStorage Warranty",
      startDate: new Date("2022-02-01"),
      endDate: new Date("2027-02-01"),
      status: "active",
    },
    sensors: [
      { id: "s10", type: "temperature", status: "active", currentReading: -10.3, unit: "°F" }, // Converted from -23.5°C
      { id: "s11", type: "humidity", status: "active", currentReading: 35, unit: "%" },
      { id: "s12", type: "current", status: "active", currentReading: 12.3, unit: "A" },
    ],
    uptime: 99.5,
    energyConsumption: 800,
    assignedStaff: "Diana Evans",
    serviceProviderContact: "support@coldstorage.com",
    runTime: 7200,
    cycles: {
      last24h: 2,
      last7d: 12,
      last30d: 45,
    },
    averageCyclesPerHour: 0.1,
    cyclesTrend: 2,
    energyImpact: 10,
    maintenanceTrigger: 900,
  },
  {
    id: "5",
    name: "Milkshake Blender",
    model: "MSB-1000",
    serialNumber: "MSB1-005-2022",
    location: "Counter",
    manufacturer: "ShakeItUp Technologies",
    installDate: new Date("2022-06-15"),
    status: "maintenance",
    lastMaintenance: new Date("2023-04-01"),
    nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    warranty: {
      provider: "ShakeItUp Warranty",
      startDate: new Date("2022-06-15"),
      endDate: new Date("2024-06-15"),
      status: "active",
    },
    sensors: [
      { id: "s13", type: "current", status: "warning", currentReading: 3.8, unit: "A" },
      { id: "s14", type: "temperature", status: "active", currentReading: 35.6, unit: "°F" }, // Converted from 2°C
      { id: "s15", type: "vibration", status: "active", currentReading: 0.5, unit: "mm/s" },
    ],
    uptime: 88.7,
    energyConsumption: 150,
    assignedStaff: "Ethan Foster",
    serviceProviderContact: "support@shakeitup.com",
    runTime: 1800,
    cycles: {
      last24h: 20,
      last7d: 130,
      last30d: 500,
    },
    averageCyclesPerHour: 0.8,
    cyclesTrend: -5,
    energyImpact: 1,
    maintenanceTrigger: 300,
  },
]

export function EquipmentList({ onEquipmentSelect }: { onEquipmentSelect?: (equipmentId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)

  const filteredEquipment = equipmentData.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || equipment.status === statusFilter
    const matchesLocation = locationFilter === "all" || equipment.location === locationFilter
    const matchesCategory = categoryFilter === "all" || getEquipmentCategory(equipment.name) === categoryFilter
    return matchesSearch && matchesStatus && matchesLocation && matchesCategory
  })

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

  const getWarrantyStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expiring soon":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleViewDetails = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsDetailsDialogOpen(true)
    if (onEquipmentSelect) {
      onEquipmentSelect(equipment.id)
    }
  }

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsEditDialogOpen(true)
  }

  const handleScheduleMaintenance = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsMaintenanceDialogOpen(true)
  }

  const handleViewHistory = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsHistoryDialogOpen(true)
  }

  const handleGenerateReport = (equipment: Equipment) => {
    generateEquipmentReport(equipment)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 gap-2">
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
                  className="w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full md:w-[140px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {getUniqueLocations().map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  <TableHead>Warranty Status</TableHead>
                  <TableHead>Sensors</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">{equipment.name}</TableCell>
                    <TableCell>{equipment.model}</TableCell>
                    <TableCell>{equipment.location}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(equipment.status)}>
                        {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(equipment.lastMaintenance)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {equipment.nextMaintenance < new Date() && <AlertCircle className="h-4 w-4 text-red-500" />}
                        <span>{formatDate(equipment.nextMaintenance)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {equipment.warranty && (
                        <Badge className={getWarrantyStatusColor(equipment.warranty.status)}>
                          {equipment.warranty.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {equipment.sensors.map((sensor) => {
                          const getSensorIcon = (type: string) => {
                            switch (type) {
                              case "temperature":
                                return <Thermometer className="h-4 w-4" />
                              case "humidity":
                                return <Droplets className="h-4 w-4" />
                              case "current":
                                return <Activity className="h-4 w-4" />
                              case "vibration":
                                return <Waves className="h-4 w-4" />
                              default:
                                return <Zap className="h-4 w-4" />
                            }
                          }

                          const getSensorStatusColor = (status: string) => {
                            switch (status) {
                              case "active":
                                return "text-green-600"
                              case "warning":
                                return "text-yellow-600"
                              case "disconnected":
                                return "text-red-600"
                              default:
                                return "text-gray-600"
                            }
                          }

                          return (
                            <TooltipProvider key={sensor.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={`flex items-center ${getSensorStatusColor(sensor.status)}`}>
                                    {getSensorIcon(sensor.type)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}</p>
                                  <p className="text-xs">Status: {sensor.status}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(equipment)}>
                            Equipment Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditEquipment(equipment)}>
                            Edit Equipment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleScheduleMaintenance(equipment)}>
                            Schedule Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewHistory(equipment)}>View History</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateReport(equipment)}>
                            Generate Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Equipment Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{selectedEquipment?.name}</DialogTitle>
              <DialogDescription>
                {selectedEquipment?.model} • {selectedEquipment?.manufacturer}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="overview" className="h-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="overflow-auto max-h-[70vh]">
                <EquipmentOverview equipment={selectedEquipment} />
              </TabsContent>
              <TabsContent value="sensors" className="overflow-auto max-h-[70vh]">
                <SensorData equipment={selectedEquipment} />
              </TabsContent>
              <TabsContent value="maintenance" className="overflow-auto max-h-[70vh]">
                <MaintenanceSchedule equipment={selectedEquipment} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
            </DialogHeader>
            <EditEquipmentForm equipment={selectedEquipment} onSave={() => setIsEditDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
            </DialogHeader>
            <MaintenanceSchedule equipment={selectedEquipment} onSave={() => setIsMaintenanceDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Equipment History</DialogTitle>
            </DialogHeader>
            <EquipmentHistory equipment={selectedEquipment} />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

function EquipmentOverview({ equipment }: { equipment: Equipment | null }) {
  if (!equipment) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Equipment Details</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {equipment.name}
              </p>
              <p>
                <span className="font-medium">Make & Model:</span> {equipment.manufacturer} {equipment.model}
              </p>
              <p>
                <span className="font-medium">Serial Number:</span> {equipment.serialNumber}
              </p>
              <p>
                <span className="font-medium">Installation Date:</span> {formatDate(equipment.installDate)}
              </p>
              <p>
                <span className="font-medium">Warranty Expiry:</span>{" "}
                {equipment.warranty ? formatDate(equipment.warranty.endDate) : "N/A"}
              </p>
              <p>
                <span className="font-medium">Location:</span> {equipment.location}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Live Status & Performance</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Current Status:</span> <StatusBadge status={equipment.status} />
              </p>
              <p>
                <span className="font-medium">Uptime (last 30 days):</span> {equipment.uptime}%
              </p>
              <p>
                <span className="font-medium">Last Data Update:</span> {new Date().toLocaleString()}
              </p>
              <div>
                <p className="font-medium mb-1">Current Sensor Readings:</p>
                <ul className="space-y-1 ml-4">
                  {equipment.sensors.map((sensor) => (
                    <li key={sensor.id} className="text-sm">
                      {sensor.type === "temperature"
                        ? `${sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}: ${sensor.currentReading?.toFixed(1)}°F`
                        : `${sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}: ${sensor.currentReading} ${sensor.unit}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Maintenance & Service</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Last Maintenance:</span> {formatDate(equipment.lastMaintenance)}
              </p>
              <p>
                <span className="font-medium">Next Scheduled Maintenance:</span> {formatDate(equipment.nextMaintenance)}
              </p>
              <p>
                <span className="font-medium">Assigned Staff:</span> {equipment.assignedStaff}
              </p>
              <p>
                <span className="font-medium">Service Provider:</span> {equipment.serviceProviderContact}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Sensor & Energy Data</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Total Energy Consumption (last 30 days):</span>{" "}
                {equipment.energyConsumption} kWh
              </p>
              <p>
                <span className="font-medium">Active Sensors:</span>{" "}
                {equipment.sensors.filter((s) => s.status === "active").length} of {equipment.sensors.length}
              </p>
              <p>
                <span className="font-medium">Sensor Status:</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {equipment.sensors.map((sensor) => (
                  <Badge
                    key={sensor.id}
                    variant="outline"
                    className={
                      sensor.status === "active"
                        ? "border-green-500 text-green-700"
                        : sensor.status === "warning"
                          ? "border-yellow-500 text-yellow-700"
                          : "border-red-500 text-red-700"
                    }
                  >
                    {sensor.type} - {sensor.status}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
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

  return <Badge className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

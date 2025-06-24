export interface Equipment {
  id: string
  name: string
  model: string
  serialNumber: string
  location: string
  manufacturer: string
  installDate: Date
  status: "operational" | "warning" | "critical" | "maintenance"
  lastMaintenance: Date
  nextMaintenance: Date
  warranty?: {
    provider: string
    startDate: Date
    endDate: Date
    status: "active" | "expired" | "expiring soon"
  }
  sensors: {
    id: string
    type: string
    status: "active" | "warning" | "disconnected"
    currentReading?: number
    unit?: string
  }[]
  uptime: number
  energyConsumption: number
  assignedStaff: string
  serviceProviderContact: string
}

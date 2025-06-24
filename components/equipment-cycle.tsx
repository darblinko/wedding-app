import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EquipmentCycle {
  id: string
  name: string
  status: string
  cyclePercentage: number
  timeRemaining: string
  lastUpdated: string
}

interface EquipmentCycleProps {
  equipmentCycles: EquipmentCycle[]
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active":
      return "#4CAF50" // Green
    case "Warning":
      return "#FF9800" // Orange
    case "Critical":
      return "#F44336" // Red
    default:
      return "#9E9E9E" // Grey
  }
}

const EquipmentCycleComponent: React.FC<EquipmentCycleProps> = ({ equipmentCycles }) => {
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle>Equipment Cycles</CardTitle>
        <CardDescription>Current equipment cycle status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {equipmentCycles.map((equipment) => (
            <div key={equipment.id} className="flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(equipment.status) }}></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium truncate">{equipment.name}</p>
                  <span className="text-xs text-muted-foreground">{equipment.lastUpdated}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${equipment.cyclePercentage}%`,
                      backgroundColor: getStatusColor(equipment.status),
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{equipment.cyclePercentage}% Complete</span>
                  <span>{equipment.timeRemaining}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { EquipmentCycleComponent }

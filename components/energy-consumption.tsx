"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EnergyConsumptionProps {
  energyData: Array<{
    time: string
    consumption: number
  }>
  timeRange: string
  setTimeRange: (range: string) => void
  className?: string
}

const EnergyConsumption: React.FC<EnergyConsumptionProps> = ({
  energyData,
  timeRange,
  setTimeRange,
  className = "",
}) => {
  return (
    <Card className={`col-span-1 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Energy Consumption</CardTitle>
            <CardDescription>Energy usage over time</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={energyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`${value} kWh`, "Consumption"]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Bar dataKey="consumption" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-xs text-blue-500 mb-1">Total Consumption</div>
            <div className="text-xl font-bold">{energyData.reduce((sum, item) => sum + item.consumption, 0)} kWh</div>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-xs text-green-500 mb-1">Average</div>
            <div className="text-xl font-bold">
              {Math.round(energyData.reduce((sum, item) => sum + item.consumption, 0) / energyData.length)} kWh
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { EnergyConsumption }

"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Zap, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { equipmentData } from "./equipment-list"

interface EnergyDataPoint {
  date: string
  day: number
  actual?: number
  projected?: number
  cost?: number
}

interface AssetCost {
  id: string
  name: string
  usage: number
  cost: number
  rate: number
}

export function EnergyUsageSummary() {
  const [selectedAsset, setSelectedAsset] = useState("all")
  const [energyData, setEnergyData] = useState<EnergyDataPoint[]>([])
  const [assetCosts, setAssetCosts] = useState<AssetCost[]>([])

  // Energy rates per kWh for different equipment types
  const energyRates = {
    "Refrigeration Unit": 0.12,
    "HVAC System": 0.1,
    Compressor: 0.15,
    "Conveyor Belt": 0.08,
    "Packaging Machine": 0.11,
  }

  // Generate energy usage data
  useEffect(() => {
    const today = new Date()
    const currentDay = today.getDate()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

    const data: EnergyDataPoint[] = []

    // Generate actual data for days 1 to current day with cumulative totals
    let cumulativeUsage = 0
    let cumulativeCost = 0

    for (let day = 1; day <= currentDay; day++) {
      const baseUsage =
        selectedAsset === "all"
          ? equipmentData.reduce((sum, eq) => sum + (50 + Math.random() * 30), 0)
          : 50 + Math.random() * 30

      const dailyUsage = baseUsage + Math.sin(day / 7) * 10 + (Math.random() * 20 - 10)
      const rate =
        selectedAsset === "all"
          ? 0.11
          : energyRates[
              equipmentData.find((eq) => `equipment${eq.id}` === selectedAsset)?.type as keyof typeof energyRates
            ] || 0.11

      const dailyUsageValue = Math.max(0, dailyUsage)
      const dailyCost = dailyUsageValue * rate

      cumulativeUsage += dailyUsageValue
      cumulativeCost += dailyCost

      data.push({
        date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        day,
        actual: cumulativeUsage,
        cost: cumulativeCost,
      })
    }

    // Generate projected data for remaining days with continued accumulation
    const avgDailyUsage = cumulativeUsage / currentDay
    const trend = (data[data.length - 1]?.actual || avgDailyUsage) - (data[0]?.actual || 0)
    const trendPerDay = trend / data.length

    for (let day = currentDay + 1; day <= daysInMonth; day++) {
      const projectedDailyUsage = avgDailyUsage + Math.sin(day / 7) * 5
      const rate =
        selectedAsset === "all"
          ? 0.11
          : energyRates[
              equipmentData.find((eq) => `equipment${eq.id}` === selectedAsset)?.type as keyof typeof energyRates
            ] || 0.11

      const dailyUsageValue = Math.max(0, projectedDailyUsage)
      const dailyCost = dailyUsageValue * rate

      cumulativeUsage += dailyUsageValue
      cumulativeCost += dailyCost

      data.push({
        date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        day,
        projected: cumulativeUsage,
        cost: cumulativeCost,
      })
    }

    setEnergyData(data)
  }, [selectedAsset])

  // Calculate asset costs
  useEffect(() => {
    const costs: AssetCost[] = equipmentData.map((equipment) => {
      const monthlyUsage = 800 + Math.random() * 400 // kWh per month
      const rate = energyRates[equipment.type as keyof typeof energyRates] || 0.11
      const monthlyCost = monthlyUsage * rate

      return {
        id: `equipment${equipment.id}`,
        name: equipment.name,
        usage: monthlyUsage,
        cost: monthlyCost,
        rate,
      }
    })

    setAssetCosts(costs)
  }, [])

  // Calculate totals
  const totals = useMemo(() => {
    const actualUsage = energyData.filter((d) => d.actual).reduce((sum, d) => sum + (d.actual || 0), 0)
    const projectedUsage = energyData.filter((d) => d.projected).reduce((sum, d) => sum + (d.projected || 0), 0)
    const totalUsage = actualUsage + projectedUsage

    const actualCost = energyData.filter((d) => d.actual).reduce((sum, d) => sum + (d.cost || 0), 0)
    const projectedCost = energyData.filter((d) => d.projected).reduce((sum, d) => sum + (d.cost || 0), 0)
    const totalCost = actualCost + projectedCost

    return {
      actualUsage,
      projectedUsage,
      totalUsage,
      actualCost,
      projectedCost,
      totalCost,
    }
  }, [energyData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isActual = data.actual !== undefined
      const usage = isActual ? data.actual : data.projected
      const cost = data.cost

      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-semibold">Day {data.day}</p>
          <p className="text-sm text-muted-foreground">
            {isActual ? "Cumulative Actual" : "Cumulative Projected"}:{" "}
            <span className="font-medium">{usage?.toFixed(1)} kWh</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Total Cost: <span className="font-medium">${cost?.toFixed(2)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Energy Usage & Cost Analysis
            </CardTitle>
            <CardDescription>Monthly energy consumption with cost projections</CardDescription>
          </div>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select Asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {equipmentData.map((equipment) => (
                <SelectItem key={equipment.id} value={`equipment${equipment.id}`}>
                  {equipment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Actual Usage</p>
                    <p className="text-lg font-bold">{totals.actualUsage.toFixed(0)} kWh</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-orange-600 font-medium">Projected Usage</p>
                    <p className="text-lg font-bold">{totals.projectedUsage.toFixed(0)} kWh</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Actual Cost</p>
                    <p className="text-lg font-bold">${totals.actualCost.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Total Est. Cost</p>
                    <p className="text-lg font-bold">${totals.totalCost.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Energy Usage Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={energyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: "Day of Month", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "Energy Usage (kWh)", angle: -90, position: "insideLeft" }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  x={new Date().getDate()}
                  stroke="rgba(239, 68, 68, 0.7)"
                  strokeDasharray="2 2"
                  label="Today"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Actual Usage"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Projected Usage"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Asset Cost Breakdown */}
          {selectedAsset === "all" && (
            <div>
              <h3 className="text-lg font-medium mb-3">Asset Cost Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assetCosts.map((asset) => (
                  <Card key={asset.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{asset.name}</h4>
                          <Badge variant="outline">${asset.rate}/kWh</Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Usage:</span>
                            <span className="font-medium">{asset.usage.toFixed(0)} kWh</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Monthly Cost:</span>
                            <span className="font-medium">${asset.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Total Monthly Cost (All Assets)</span>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      ${assetCosts.reduce((sum, asset) => sum + asset.cost, 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

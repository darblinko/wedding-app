"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { equipmentData } from "./equipment-list"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

export function EquipmentStatus() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const statusCounts = equipmentData.reduce(
    (acc, equipment) => {
      acc[equipment.status] = (acc[equipment.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: getStatusColor(name),
  }))

  const totalEquipment = equipmentData.length

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status)
  }

  const affectedEquipment = equipmentData.filter((equipment) => equipment.status === selectedStatus)

  return (
    <>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Equipment Status</CardTitle>
          <CardDescription>Current operational status of all {totalEquipment} equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(entry) => handleStatusClick(entry.name)}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} style={{ cursor: "pointer" }} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} (${(((value as number) / totalEquipment) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                />
                <Legend
                  onClick={(entry) => handleStatusClick(entry.value)}
                  formatter={(value) => <span style={{ cursor: "pointer" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {data.map((status, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                onClick={() => handleStatusClick(status.name)}
              >
                <Badge style={{ backgroundColor: status.color }}>{status.name}</Badge>
                <span className="text-sm font-medium">
                  {status.value} ({((status.value / totalEquipment) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedStatus !== null} onOpenChange={() => setSelectedStatus(null)}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedStatus} Equipment</DialogTitle>
            <DialogDescription>Detailed information about equipment with {selectedStatus} status</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affectedEquipment.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell>{equipment.name}</TableCell>
                    <TableCell>{equipment.model}</TableCell>
                    <TableCell>{equipment.location}</TableCell>
                    <TableCell>{new Date(equipment.lastMaintenance).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(equipment.nextMaintenance).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case "operational":
      return "#22c55e"
    case "warning":
      return "#f59e0b"
    case "critical":
      return "#ef4444"
    case "maintenance":
      return "#3b82f6"
    default:
      return "#94a3b8"
  }
}

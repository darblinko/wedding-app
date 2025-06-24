"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { Bell, AlertTriangle, AlertCircle, Search, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

type Alert = {
  id: string
  equipmentId: string
  equipmentName: string
  sensorType: string
  severity: "mild" | "critical"
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  action?: string
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [actualCost, setActualCost] = useState<string>("") // Changed to string type

  useEffect(() => {
    // Simulating fetching alerts from an API
    const fetchedAlerts: Alert[] = [
      {
        id: "1",
        equipmentId: "equipment1",
        equipmentName: "Display Freezer 1",
        sensorType: "temperature",
        severity: "critical",
        message: "Temperature exceeding critical threshold (5°C)",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        resolved: false,
      },
      {
        id: "2",
        equipmentId: "equipment2",
        equipmentName: "Ice Cream Maker 1",
        sensorType: "pressure",
        severity: "mild",
        message: "Pressure slightly above normal range",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        resolved: false,
      },
      {
        id: "3",
        equipmentId: "equipment3",
        equipmentName: "Walk-in Freezer",
        sensorType: "current",
        severity: "mild",
        message: "Current draw increased by 10%",
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        resolved: true,
        resolvedAt: new Date(Date.now() - 1000 * 60 * 90),
        resolvedBy: "John Doe",
        action: "Cleaned condenser coils",
      },
    ]
    setAlerts(fetchedAlerts)
  }, [])

  useEffect(() => {
    const filtered = alerts.filter((alert) => {
      const matchesSearch =
        alert.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? !alert.resolved : alert.resolved)
      const alertDate = new Date(alert.timestamp)
      const matchesDateRange = alertDate >= dateRange.from && alertDate <= dateRange.to
      return matchesSearch && matchesSeverity && matchesStatus && matchesDateRange
    })
    setFilteredAlerts(filtered)
  }, [alerts, searchTerm, severityFilter, statusFilter, dateRange])

  const handleAlertAction = () => {
    if (selectedAlert) {
      const updatedAlert: Alert = {
        ...selectedAlert,
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: "Current User", // Replace with actual user name
        action: selectedActions.join(", "),
      }
      setAlerts((prevAlerts) => prevAlerts.map((alert) => (alert.id === selectedAlert.id ? updatedAlert : alert)))
      setSelectedAlert(null)
      setSelectedActions([])
      setActualCost("") // Reset to empty string
      setIsAlertDialogOpen(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "mild":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const mildAlertActions = [
    "Use a Manual Temperature Sensor to Cross-Check Readings",
    "Check for Airflow Obstructions (Intake & Exhaust Fans)",
    "Inspect Door Seals & Gaskets",
    "Ensure Freezer/Display Case Doors Are Fully Closed",
    "Verify Freezer/Display Thermostat Settings",
    "Inspect for Ice Build-Up or Frost Accumulation",
    "Check Power Supply & Voltage Stability",
    "Observe Compressor Runtime Behavior",
    "Reset the Freezer/Display Unit (Last Resort for Mild Alerts)",
  ]

  const criticalAlertActions = [
    "Verify Temperature Deviation with an Independent Thermometer",
    "Immediately Move Stock to Backup Freezer (if available)",
    "Check for Refrigeration System Failure (Compressor, Fans, and Coils)",
    "Inspect Refrigerant Levels & Look for Leaks",
    "Confirm That Freezer Door is Fully Sealed & No Obstructions Exist",
    "Check Power Supply & Voltage Stability",
    "Force a Manual Defrost Cycle (if Ice Buildup is Present)",
    "Check for Excessive Compressor Runtime or Overheating",
    "Call a Refrigeration Technician (If Problem Persists)",
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Alert Management</CardTitle>
          <CardDescription>View and manage system alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          </div>

          <div className="mt-6">
            <div className="overflow-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resolution</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(alert.severity)}
                          <span className="capitalize">{alert.severity}</span>
                        </div>
                      </TableCell>
                      <TableCell>{alert.equipmentName}</TableCell>
                      <TableCell>{alert.message}</TableCell>
                      <TableCell>{alert.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        {alert.resolved ? (
                          <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {alert.resolved ? (
                          <div className="text-sm">
                            <div>{alert.resolvedAt?.toLocaleString()}</div>
                            <div className="text-muted-foreground">By: {alert.resolvedBy}</div>
                            <div className="text-muted-foreground">Action: {alert.action}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setIsAlertDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Respond
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Response Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAlert?.severity === "critical" ? (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Critical Alert Response
                </div>
              ) : (
                <div className="flex items-center text-yellow-500">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Mild Alert Response
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Please follow these steps to address the {selectedAlert?.severity} alert for{" "}
              {selectedAlert?.equipmentName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Alert Details:</h3>
              <p>
                <strong>Equipment:</strong> {selectedAlert?.equipmentName}
              </p>
              <p>
                <strong>Sensor:</strong> {selectedAlert?.sensorType}
              </p>
              <p>
                <strong>Message:</strong> {selectedAlert?.message}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Recommended Actions:</h3>
              <ScrollArea className="h-[300px] pr-4">
                {(selectedAlert?.severity === "critical" ? criticalAlertActions : mildAlertActions).map(
                  (action, index) => (
                    <div key={index} className="flex items-start space-x-2 mb-4">
                      <Checkbox
                        id={`action-${index}`}
                        checked={selectedActions.includes(action)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedActions([...selectedActions, action])
                          } else {
                            setSelectedActions(selectedActions.filter((a) => a !== action))
                          }
                        }}
                      />
                      <Label htmlFor={`action-${index}`} className="text-sm">
                        {action}
                      </Label>
                    </div>
                  ),
                )}
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualCost">Actual Cost ($)</Label>
              <Input
                id="actualCost"
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="Enter actual cost"
              />
            </div>
            <Button onClick={handleAlertAction} disabled={selectedActions.length === 0 || actualCost === ""}>
              Confirm Actions & Complete Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

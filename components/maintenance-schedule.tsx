"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { equipmentData } from "./equipment-list"

export interface MaintenanceEvent {
  id: string
  equipmentId: string
  date: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "completed" | "overdue"
  assignedStaff: string
  impact: number
  cost: number
}

type MaintenanceScheduleProps = {
  sharedMaintenanceEvents?: MaintenanceEvent[]
  onMaintenanceEventUpdate?: (events: MaintenanceEvent[]) => void
  fullView?: boolean
  equipmentId?: string
}

export function MaintenanceSchedule({
  sharedMaintenanceEvents = [],
  onMaintenanceEventUpdate,
  fullView = true,
  equipmentId,
}: MaintenanceScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedEquipment, setSelectedEquipment] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignedStaff, setAssignedStaff] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Filter events for specific equipment if equipmentId is provided
  const displayEvents = equipmentId
    ? sharedMaintenanceEvents.filter((event) => event.equipmentId === equipmentId)
    : sharedMaintenanceEvents

  const handleScheduleEvent = () => {
    if (!selectedDate || !selectedEquipment || !description || !assignedStaff) {
      alert("Please fill in all required fields")
      return
    }

    const newEvent: MaintenanceEvent = {
      id: Date.now().toString(),
      equipmentId: selectedEquipment,
      date: selectedDate.toISOString(),
      description,
      priority,
      status: "pending",
      assignedStaff,
      impact: Math.floor(Math.random() * 20) + 5, // Random impact between 5-25%
      cost: Number.parseFloat(estimatedCost) || 0,
    }

    const updatedEvents = [...sharedMaintenanceEvents, newEvent]
    onMaintenanceEventUpdate?.(updatedEvents)

    // Reset form
    setSelectedDate(undefined)
    setSelectedEquipment("")
    setDescription("")
    setPriority("medium")
    setAssignedStaff("")
    setEstimatedCost("")
  }

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = sharedMaintenanceEvents.filter((event) => event.id !== eventId)
    onMaintenanceEventUpdate?.(updatedEvents)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Schedule New Maintenance Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Schedule New Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment *</Label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentData.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scheduled Date *</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setIsDatePickerOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff">Assigned Staff *</Label>
              <Input
                id="staff"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                placeholder="Enter staff name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Estimated Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the maintenance task..."
              rows={3}
            />
          </div>

          <Button onClick={handleScheduleEvent} className="w-full">
            Schedule Maintenance
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Events List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {equipmentId ? "Equipment Maintenance Events" : "All Scheduled Maintenance"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">({displayEvents.length} events)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No maintenance events scheduled.</p>
              <p className="text-sm">Use the form above to schedule your first maintenance event.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          {equipmentData.find((e) => e.id === event.equipmentId)?.name || "Unknown Equipment"}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Date:</span> {format(new Date(event.date), "MMM d, yyyy")}
                        </div>
                        <div>
                          <span className="font-medium">Staff:</span> {event.assignedStaff}
                        </div>
                        <div>
                          <span className="font-medium">Impact:</span> +{event.impact}%
                        </div>
                        <div>
                          <span className="font-medium">Cost:</span> ${event.cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MaintenanceSchedule

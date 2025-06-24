"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, CalendarIcon, Plus, Search, Trash2 } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from "date-fns"
import { equipmentData } from "@/components/equipment-list"
import { DashboardLayout } from "@/components/dashboard-layout"

interface MaintenanceEvent {
  id: string
  title: string
  description: string
  date: Date
  priority: "low" | "medium" | "high"
  status: "scheduled" | "in-progress" | "completed" | "overdue"
  equipmentId: string
  equipmentName: string
  assignedTo: string
  estimatedCost: number
  frequency?: "none" | "daily" | "weekly" | "bi-weekly" | "monthly" | "quarterly" | "annually"
  isRecurring?: boolean
  parentEventId?: string
}

const internalStaff = [
  "John Smith (Internal)",
  "Sarah Johnson (Internal)",
  "Mike Wilson (Internal)",
  "Lisa Brown (Internal)",
  "David Lee (Internal)",
  "Emma Davis (Internal)",
]

const externalTechnicians = [
  "ABC Maintenance Services - John Doe",
  "TechFix Solutions - Sarah Miller",
  "Industrial Repair Co - Mike Johnson",
  "ProMaint Services - Lisa Davis",
  "Expert Tech Solutions - David Wilson",
  "Reliable Maintenance - Emma Brown",
  "Premier Service Group - Tom Anderson",
  "MechTech Solutions - Robert Taylor",
]

const frequencyOptions = [
  { value: "none", label: "One-time only" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-weekly (Every 2 weeks)" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly (Every 3 months)" },
  { value: "annually", label: "Annually" },
]

export default function MaintenancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([
    {
      id: "1",
      title: "Belt Replacement",
      description: "Replace worn conveyor belt",
      date: new Date(2024, 11, 15),
      priority: "high",
      status: "scheduled",
      equipmentId: "1",
      equipmentName: "Conveyor Belt System A1",
      assignedTo: "ABC Maintenance Services - John Doe",
      estimatedCost: 500,
      frequency: "monthly",
      isRecurring: true,
    },
    {
      id: "2",
      title: "Hydraulic Fluid Change",
      description: "Change hydraulic fluid and filters",
      date: new Date(2024, 11, 20),
      priority: "medium",
      status: "scheduled",
      equipmentId: "2",
      equipmentName: "Hydraulic Press B2",
      assignedTo: "Sarah Johnson (Internal)",
      estimatedCost: 200,
      frequency: "quarterly",
      isRecurring: true,
    },
  ])

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterEquipment, setFilterEquipment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterAssignedTo, setFilterAssignedTo] = useState("all")
  const [filterDateRange, setFilterDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Add event form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    priority: "medium" as "low" | "medium" | "high",
    status: "scheduled" as "scheduled" | "in-progress" | "completed" | "overdue",
    equipmentId: "",
    assignedTo: "",
    estimatedCost: 0,
    frequency: "none" as "none" | "daily" | "weekly" | "bi-weekly" | "monthly" | "quarterly" | "annually",
  })

  // Calendar functions
  const handlePreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1))

  const getCalendarDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  // Generate recurring events
  const generateRecurringEvents = (baseEvent: MaintenanceEvent, frequency: string, count = 12) => {
    const events: MaintenanceEvent[] = []
    let currentDate = new Date(baseEvent.date)

    for (let i = 0; i < count; i++) {
      if (i > 0) {
        switch (frequency) {
          case "daily":
            currentDate = addDays(currentDate, 1)
            break
          case "weekly":
            currentDate = addDays(currentDate, 7)
            break
          case "bi-weekly":
            currentDate = addDays(currentDate, 14)
            break
          case "monthly":
            currentDate = addMonths(currentDate, 1)
            break
          case "quarterly":
            currentDate = addMonths(currentDate, 3)
            break
          case "annually":
            currentDate = addMonths(currentDate, 12)
            break
          default:
            return events
        }

        events.push({
          ...baseEvent,
          id: `${baseEvent.id}-recurring-${i}`,
          date: new Date(currentDate),
          parentEventId: baseEvent.id,
        })
      }
    }

    return events
  }

  // Get all events including recurring ones
  const getAllEvents = () => {
    const allEvents = [...maintenanceEvents]

    maintenanceEvents.forEach((event) => {
      if (event.frequency && event.frequency !== "none" && event.isRecurring) {
        const recurringEvents = generateRecurringEvents(event, event.frequency)
        allEvents.push(...recurringEvents)
      }
    })

    return allEvents
  }

  const getEventsForDay = (date: Date) => {
    return getAllEvents().filter((event) => isSameDay(event.date, date))
  }

  // Add new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.equipmentId || !newEvent.assignedTo) {
      alert("Please fill in all required fields")
      return
    }

    const selectedEquipment = equipmentData.find((eq) => eq.id === newEvent.equipmentId)
    if (!selectedEquipment) {
      alert("Please select a valid equipment")
      return
    }

    const event: MaintenanceEvent = {
      id: Date.now().toString(),
      ...newEvent,
      equipmentName: selectedEquipment.name,
      isRecurring: newEvent.frequency !== "none",
    }

    setMaintenanceEvents((prev) => [...prev, event])
    setNewEvent({
      title: "",
      description: "",
      date: new Date(),
      priority: "medium",
      status: "scheduled",
      equipmentId: "",
      assignedTo: "",
      estimatedCost: 0,
      frequency: "none",
    })
    setIsAddDialogOpen(false)
  }

  // Delete event
  const handleDeleteEvent = (id: string) => {
    setMaintenanceEvents((prev) => prev.filter((event) => event.id !== id))
  }

  // Filter events (only show base events, not recurring instances)
  const filteredEvents = maintenanceEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === "all" || event.priority === filterPriority
    const matchesEquipment = filterEquipment === "all" || event.equipmentId === filterEquipment
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    const matchesAssignedTo = filterAssignedTo === "all" || event.assignedTo === filterAssignedTo

    let matchesDateRange = true
    if (filterDateRange.from && filterDateRange.to) {
      matchesDateRange = event.date >= filterDateRange.from && event.date <= filterDateRange.to
    }

    return (
      matchesSearch && matchesPriority && matchesEquipment && matchesStatus && matchesAssignedTo && matchesDateRange
    )
  })

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
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper function to get display name for assignee
  const getAssigneeDisplayName = (assignee: string) => {
    if (assignee.includes("(Internal)")) {
      return assignee.replace(" (Internal)", "")
    }
    return assignee.split(" - ")[0] || assignee
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Maintenance Management</h1>
          <p className="text-muted-foreground">Schedule, track, and manage maintenance events for your equipment</p>
        </div>

        {/* Maintenance Calendar */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Maintenance Calendar</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[150px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium p-2 text-sm">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {getCalendarDays().map((date, index) => {
                const dayEvents = getEventsForDay(date)
                const isToday = isSameDay(date, new Date())

                return (
                  <div
                    key={index}
                    className={`min-h-[80px] border rounded-md p-2 ${
                      isToday ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">{format(date, "d")}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate ${getPriorityColor(event.priority)} ${
                            event.isRecurring ? "border-l-2 border-blue-500" : ""
                          }`}
                          title={`${event.title} - ${event.equipmentName}${event.isRecurring ? " (Recurring)" : ""}`}
                        >
                          {event.title}
                          {event.isRecurring && <span className="ml-1">🔄</span>}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Schedule */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Maintenance Schedule</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Maintenance Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Add Maintenance Event</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter event title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter description"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Equipment *</Label>
                        <Select
                          value={newEvent.equipmentId}
                          onValueChange={(value) => setNewEvent((prev) => ({ ...prev, equipmentId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipmentData.map((equipment) => (
                              <SelectItem key={equipment.id} value={equipment.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{equipment.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {equipment.location} • {equipment.status}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(newEvent.date, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newEvent.date}
                              onSelect={(date) => date && setNewEvent((prev) => ({ ...prev, date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label>Frequency</Label>
                        <Select
                          value={newEvent.frequency}
                          onValueChange={(
                            value: "none" | "daily" | "weekly" | "bi-weekly" | "monthly" | "quarterly" | "annually",
                          ) => setNewEvent((prev) => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {newEvent.frequency !== "none" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            This will create recurring events automatically
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Priority</Label>
                          <Select
                            value={newEvent.priority}
                            onValueChange={(value: "low" | "medium" | "high") =>
                              setNewEvent((prev) => ({ ...prev, priority: value }))
                            }
                          >
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

                        <div>
                          <Label>Status</Label>
                          <Select
                            value={newEvent.status}
                            onValueChange={(value: "scheduled" | "in-progress" | "completed" | "overdue") =>
                              setNewEvent((prev) => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Assigned To *</Label>
                        <Select
                          value={newEvent.assignedTo}
                          onValueChange={(value) => setNewEvent((prev) => ({ ...prev, assignedTo: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">Internal Staff</div>
                            {internalStaff.map((staff) => (
                              <SelectItem key={staff} value={staff}>
                                {staff.replace(" (Internal)", "")}
                              </SelectItem>
                            ))}
                            <Separator className="my-1" />
                            <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">External Technicians</div>
                            {externalTechnicians.map((technician) => (
                              <SelectItem key={technician} value={technician}>
                                {technician}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Estimated Cost ($)</Label>
                        <Input
                          type="number"
                          value={newEvent.estimatedCost}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, estimatedCost: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>

                      <Button onClick={handleAddEvent} className="w-full">
                        Add Event
                      </Button>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterEquipment} onValueChange={setFilterEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Equipment" />
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

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAssignedTo} onValueChange={setFilterAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">Internal Staff</div>
                  {internalStaff.map((staff) => (
                    <SelectItem key={staff} value={staff}>
                      {staff.replace(" (Internal)", "")}
                    </SelectItem>
                  ))}
                  <Separator className="my-1" />
                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">External Technicians</div>
                  {externalTechnicians.map((technician) => (
                    <SelectItem key={technician} value={technician}>
                      {technician.split(" - ")[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date-range filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={filterDateRange}
                    onSelect={setFilterDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No maintenance events found.</p>
                  <p className="text-sm">Try adjusting your filters or add a new event.</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                            {event.isRecurring && (
                              <Badge variant="outline" className="text-blue-600">
                                🔄 {event.frequency}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Date:</span> {format(event.date, "MMM d, yyyy")}
                            </div>
                            <div>
                              <span className="font-medium">Equipment:</span> {event.equipmentName}
                            </div>
                            <div>
                              <span className="font-medium">Assigned:</span> {getAssigneeDisplayName(event.assignedTo)}
                            </div>
                            <div>
                              <span className="font-medium">Cost:</span> ${event.estimatedCost}
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
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

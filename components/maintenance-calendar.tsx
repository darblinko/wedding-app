"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import type { MaintenanceEvent } from "@/components/maintenance-schedule"

const equipmentData = [
  { id: "1", name: "Conveyor Belt A" },
  { id: "2", name: "Hydraulic Press B" },
  { id: "3", name: "Assembly Robot C" },
  { id: "4", name: "Quality Scanner D" },
  { id: "5", name: "Packaging Unit E" },
]

type CalendarDay = {
  date: Date
  events: MaintenanceEvent[]
}

export function MaintenanceCalendar({
  maintenanceEvents,
  onEventUpdate,
}: {
  maintenanceEvents: MaintenanceEvent[]
  onEventUpdate?: (events: MaintenanceEvent[]) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceEvent | null>(null)
  const [filterEquipment, setFilterEquipment] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Generate calendar days for the current month
  useEffect(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    const calendarDays = days.map((date) => {
      const dayEvents = maintenanceEvents.filter((event) => {
        const eventDate = new Date(event.date)
        return isSameDay(eventDate, date)
      })
      return { date, events: dayEvents }
    })

    setCalendarDays(calendarDays)
  }, [currentMonth, maintenanceEvents])

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day)
  }

  const handleEventClick = (event: MaintenanceEvent) => {
    setSelectedEvent(event)
  }

  const handleCompleteEvent = (eventId: string) => {
    if (onEventUpdate) {
      const updatedEvents = maintenanceEvents.map((event) =>
        event.id === eventId ? { ...event, status: "completed" } : event,
      )
      onEventUpdate(updatedEvents)
    }
    setSelectedEvent(null)
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

  const getEventCountForDay = (day: CalendarDay) => {
    return day.events.filter((event) => {
      const matchesEquipment = filterEquipment === "all" || event.equipmentId === filterEquipment
      const matchesPriority = filterPriority === "all" || event.priority === filterPriority
      return matchesEquipment && matchesPriority
    }).length
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-bold">Maintenance Calendar</h2>
        <div className="flex items-center space-x-2">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <CalendarIcon className="h-4 w-4" />
                <span className="sr-only">Open date picker</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentMonth}
                onSelect={(date) => {
                  if (date) {
                    setCurrentMonth(date)
                    setIsDatePickerOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy")}</div>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Select value={filterEquipment} onValueChange={setFilterEquipment}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by equipment" />
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
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium p-2 text-sm">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const eventCount = getEventCountForDay(day)
            const isToday = isSameDay(day.date, new Date())
            const hasEvents = eventCount > 0

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] border rounded-md p-2 cursor-pointer transition-colors
                  ${isToday ? "bg-primary/10 border-primary" : "hover:bg-muted"}
                `}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                    {format(day.date, "d")}
                  </span>
                  {hasEvents && (
                    <Badge variant="outline" className="bg-primary/20 text-xs">
                      {eventCount}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 space-y-1 overflow-hidden max-h-[60px]">
                  {day.events
                    .filter((event) => {
                      const matchesEquipment = filterEquipment === "all" || event.equipmentId === filterEquipment
                      const matchesPriority = filterPriority === "all" || event.priority === filterPriority
                      return matchesEquipment && matchesPriority
                    })
                    .slice(0, 2)
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs truncate rounded px-1 py-0.5 ${getPriorityColor(event.priority)}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                      >
                        {equipmentData.find((e) => e.id === event.equipmentId)?.name || "Unknown"}
                      </div>
                    ))}
                  {eventCount > 2 && <div className="text-xs text-muted-foreground">+{eventCount - 2} more</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Events Dialog */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDay && format(selectedDay.date, "EEEE, MMMM d, yyyy")}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              {selectedDay && getEventCountForDay(selectedDay) > 0 ? (
                selectedDay.events
                  .filter((event) => {
                    const matchesEquipment = filterEquipment === "all" || event.equipmentId === filterEquipment
                    const matchesPriority = filterPriority === "all" || event.priority === filterPriority
                    return matchesEquipment && matchesPriority
                  })
                  .map((event) => (
                    <Card
                      key={event.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEventClick(event)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {equipmentData.find((e) => e.id === event.equipmentId)?.name || "Unknown"}
                            </h3>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No maintenance events for this day</div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={selectedEvent !== null} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Maintenance Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Equipment</h3>
                <p>{equipmentData.find((e) => e.id === selectedEvent.equipmentId)?.name || "Unknown"}</p>
              </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p>{selectedEvent.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p>{format(new Date(selectedEvent.date), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <Badge className={getStatusColor(selectedEvent.status)}>{selectedEvent.status}</Badge>
                </div>
                <div>
                  <h3 className="font-medium">Priority</h3>
                  <Badge className={getPriorityColor(selectedEvent.priority)}>{selectedEvent.priority}</Badge>
                </div>
                <div>
                  <h3 className="font-medium">Assigned To</h3>
                  <p>{selectedEvent.assignedStaff}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Impact</h3>
                <p>+{selectedEvent.impact}% equipment lifespan</p>
              </div>
              <div>
                <h3 className="font-medium">Estimated Cost</h3>
                <p>${selectedEvent.cost.toFixed(2)}</p>
              </div>
              {selectedEvent.status !== "completed" && (
                <Button onClick={() => handleCompleteEvent(selectedEvent.id)}>Mark as Completed</Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

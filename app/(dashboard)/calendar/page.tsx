"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { format, addDays, startOfMonth, endOfMonth, addMonths, subMonths, startOfDay, endOfDay } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Grid, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { type CalendarEvent, loadCalendarEvents } from "@/lib/calendar-utils"
import { CalendarMonthView } from "@/components/calendar/calendar-month-view"
import { CreateEventDialog } from "@/components/calendar/create-event-dialog"
import { ViewEventDialog } from "@/components/calendar/view-event-dialog"
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar"
import { ScheduleEmployeeMeeting } from "@/components/calendar/schedule-employee-meeting"
import {
  type Availability,
  type DateAvailability,
  saveUserAvailability,
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/calendar-utils"
import { simulateSendMeetingInvitation } from "@/lib/email-service"
import { EmailNotification } from "@/components/email-notification"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { eachDayOfInterval, isValid } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IntegratedAvailabilityCalendar } from "@/components/calendar/integrated-availability-calendar"
// import { AvailabilityStatusLegend } from "@/components/calendar/availability-status-legend"

// Mock users data
const users = [
  { id: "1", name: "John Doe", email: "john.doe@example.com", role: "member" },
  { id: "2", name: "Jane Smith", email: "jane.smith@example.com", role: "member" },
  { id: "3", name: "Alice Johnson", email: "alice.johnson@example.com", role: "member" },
  { id: "4", name: "Bob Williams", email: "bob.williams@example.com", role: "member" },
  { id: "5", name: "Charlie Brown", email: "charlie.brown@example.com", role: "member" },
]

export default function CalendarPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [view, setView] = useState<"month" | "availability">("month")
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showViewEvent, setShowViewEvent] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [selectedTab, setSelectedTab] = useState("calendar")
  const [showEmployeeMeetingDialog, setShowEmployeeMeetingDialog] = useState(false)

  // Reference to the sidebar container
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Function to scroll to upcoming events section
  const scrollToUpcomingEvents = () => {
    // Find the upcoming events section within the sidebar
    const upcomingEventsSection = document.getElementById("upcoming-events")
    if (upcomingEventsSection) {
      upcomingEventsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  // Email notification state
  const [notification, setNotification] = useState({
    show: false,
    success: false,
    message: "",
  })

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventStart, setEventStart] = useState<Date>(new Date())
  const [eventEnd, setEventEnd] = useState<Date>(new Date())
  const [eventLocation, setEventLocation] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [sendEmailNotifications, setSendEmailNotifications] = useState(true)

  // Availability form state
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date())
  const [isAvailable, setIsAvailable] = useState(true)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [defaultStartTime, setDefaultStartTime] = useState("09:00")
  const [defaultEndTime, setDefaultEndTime] = useState("17:00")
  const [availabilityDates, setAvailabilityDates] = useState<DateAvailability[]>([])

  // Bulk availability state
  const [showBulkAvailabilityForm, setShowBulkAvailabilityForm] = useState(false)
  const [bulkStartDate, setBulkStartDate] = useState<Date | undefined>(new Date())
  const [bulkEndDate, setBulkEndDate] = useState<Date | undefined>(addDays(new Date(), 14))
  const [bulkAvailable, setBulkAvailable] = useState(true)
  const [bulkStartTime, setBulkStartTime] = useState("09:00")
  const [bulkEndTime, setBulkEndTime] = useState("17:00")
  const [bulkWeekdays, setBulkWeekdays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  })

  // Calculate days for the current month view
  const calendarDays = useMemo(() => {
    if (!isValid(currentDate)) {
      return eachDayOfInterval({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) })
    }
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Load events
  useEffect(() => {
    const loadEvents = () => {
      try {
        const allEvents = loadCalendarEvents()
        setEvents(allEvents)
      } catch (error) {
        console.error("Error loading calendar events:", error)
        toast({
          title: "Error",
          description: "Failed to load calendar events",
          variant: "destructive",
        })
      }
    }

    loadEvents()

    // Listen for storage events to refresh events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("calendar")) {
        loadEvents()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [toast, refreshKey])

  // Handle date navigation
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const goToPrevious = () => {
    if (view === "month" || view === "availability") {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      // For agenda view, also navigate by month
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const goToNext = () => {
    if (view === "month" || view === "availability") {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      // For agenda view, also navigate by month
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  // Format the current view's date range for display
  const dateRangeText = useMemo(() => {
    if (view === "month" || view === "availability") {
      return format(currentDate, "MMMM yyyy")
    } else {
      return format(currentDate, "MMMM yyyy")
    }
  }, [currentDate, view])

  // Handle event selection
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowViewEvent(true)
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  // Handle event creation
  const handleCreateEvent = () => {
    setShowCreateEvent(true)
  }

  // Handle event creation at specific time
  const handleCreateEventAtTime = (date: Date) => {
    setSelectedDate(date)
    setShowCreateEvent(true)
  }

  // Refresh events
  const refreshEvents = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Handle availability change
  const handleAvailabilityChange = () => {
    refreshEvents()
  }

  // Safe format function that handles invalid dates
  const safeFormat = (date: Date | undefined | null, formatString: string, fallback = ""): string => {
    if (!date || !isValid(date)) return fallback
    try {
      return format(date, formatString)
    } catch (error) {
      console.error("Error formatting date:", error)
      return fallback
    }
  }

  // Save availability for a specific date
  const saveAvailability = () => {
    if (!user || !availabilityDate || !isValid(availabilityDate)) return

    try {
      const dateStr = safeFormat(availabilityDate, "yyyy-MM-dd", format(new Date(), "yyyy-MM-dd"))

      // Check if this date already exists in the availability
      const existingIndex = availabilityDates.findIndex((d) => d.date === dateStr)

      // Create the new date availability
      const newDateAvailability: DateAvailability = {
        date: dateStr,
        available: isAvailable,
        startTime,
        endTime,
      }

      // Update or add the date availability
      const updatedDates = [...availabilityDates]
      if (existingIndex !== -1) {
        updatedDates[existingIndex] = newDateAvailability
      } else {
        updatedDates.push(newDateAvailability)
      }

      // Sort dates chronologically
      updatedDates.sort((a, b) => a.date.localeCompare(b.date))

      // Update state
      setAvailabilityDates(updatedDates)

      // Save to storage
      const updatedAvailability: Availability = {
        userId: user.id,
        dates: updatedDates,
        defaultStartTime,
        defaultEndTime,
        unavailableSlots: availability?.unavailableSlots || [],
      }

      saveUserAvailability(updatedAvailability)
      setAvailability(updatedAvailability)
      setShowAvailabilityForm(false)
    } catch (error) {
      console.error("Error saving availability:", error)
    }
  }

  // Save bulk availability
  const saveBulkAvailability = () => {
    if (!user || !bulkStartDate || !bulkEndDate || !isValid(bulkStartDate) || !isValid(bulkEndDate)) return

    try {
      // Get all dates in the range
      const datesInRange = eachDayOfInterval({
        start: startOfDay(bulkStartDate),
        end: endOfDay(bulkEndDate),
      })

      // Create a copy of the current availability dates
      const updatedDates = [...availabilityDates]

      // Update each date in the range
      datesInRange.forEach((date) => {
        const dayOfWeek = date.getDay()
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        const dayName = dayNames[dayOfWeek] as keyof typeof bulkWeekdays

        // Only update if this day of week is selected
        if (bulkWeekdays[dayName]) {
          const dateStr = safeFormat(date, "yyyy-MM-dd", "")
          if (!dateStr) return // Skip if date formatting failed

          // Check if this date already exists
          const existingIndex = updatedDates.findIndex((d) => d.date === dateStr)

          // Create the new date availability
          const newDateAvailability: DateAvailability = {
            date: dateStr,
            available: bulkAvailable,
            startTime: bulkStartTime,
            endTime: bulkEndTime,
          }

          // Update or add the date availability
          if (existingIndex !== -1) {
            updatedDates[existingIndex] = newDateAvailability
          } else {
            updatedDates.push(newDateAvailability)
          }
        }
      })

      // Sort dates chronologically
      updatedDates.sort((a, b) => a.date.localeCompare(b.date))

      // Update state
      setAvailabilityDates(updatedDates)

      // Save to storage
      const updatedAvailability: Availability = {
        userId: user.id,
        dates: updatedDates,
        defaultStartTime,
        defaultEndTime,
        unavailableSlots: availability?.unavailableSlots || [],
      }

      saveUserAvailability(updatedAvailability)
      setAvailability(updatedAvailability)
      setShowBulkAvailabilityForm(false)
    } catch (error) {
      console.error("Error saving bulk availability:", error)
    }
  }

  // Create event
  const createEvent = () => {
    if (!user) return

    try {
      // Validate form
      if (
        !eventTitle ||
        !eventStart ||
        !eventEnd ||
        !isValid(eventStart) ||
        !isValid(eventEnd) ||
        selectedUsers.length === 0
      ) {
        alert("Please fill in all required fields")
        return
      }

      // Create event
      const newEvent: Omit<CalendarEvent, "id"> = {
        title: eventTitle,
        start: eventStart.toISOString(),
        end: eventEnd.toISOString(),
        type: "meeting",
        status: "confirmed",
        createdBy: user.id,
        assignedTo: selectedUsers,
        description: eventDescription,
        location: eventLocation,
        color: "#3b82f6", // Blue
      }

      const createdEvent = createCalendarEvent(newEvent)
      setEvents([...events, createdEvent])

      // Send email notifications if enabled
      if (sendEmailNotifications) {
        // Get participant details
        const participants = selectedUsers.map((userId) => {
          const userDetails = users.find((u) => u.id === userId)
          return {
            id: userId,
            name: userDetails?.name || "Unknown User",
            email: userDetails?.email || "unknown@example.com",
          }
        })

        // Get organizer details
        const organizer = {
          name: user.name,
          email: user.email,
        }

        // Send meeting invitations
        const success = simulateSendMeetingInvitation(
          {
            title: eventTitle,
            start: eventStart.toISOString(),
            end: eventEnd.toISOString(),
            description: eventDescription,
            location: eventLocation,
          },
          participants,
          organizer,
        )

        // Show notification
        setNotification({
          show: true,
          success: success,
          message: success ? "Meeting invitations sent successfully" : "Failed to send meeting invitations",
        })
      }

      // Reset form
      setEventTitle("")
      setEventDescription("")
      setEventLocation("")
      setSelectedUsers([])
      setShowEventForm(false)
    } catch (error) {
      console.error("Error creating event:", error)
      setNotification({
        show: true,
        success: false,
        message: "Error creating meeting: " + (error instanceof Error ? error.message : "Unknown error"),
      })
    }
  }

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    try {
      const success = deleteCalendarEvent(eventId)
      if (success) {
        setEvents(events.filter((e) => e.id !== eventId))
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(null)
          setShowEventDetails(false)
        }
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    if (!isValid(date) || !user) return []

    const dateString = safeFormat(date, "yyyy-MM-dd", "")
    if (!dateString) return []

    return events.filter((event) => {
      try {
        const eventDate = new Date(event.start)
        if (!isValid(eventDate)) return false

        const eventDateString = safeFormat(eventDate, "yyyy-MM-dd", "")
        // Include events where the user is the creator OR an attendee/assignee
        const isUserEvent =
          event.createdBy === user.id || event.attendees?.includes(user.id) || event.assignedTo?.includes(user.id)

        return eventDateString === dateString && isUserEvent
      } catch (error) {
        console.error("Error filtering events:", error)
        return false
      }
    })
  }

  // Get availability for a specific date
  const getAvailabilityForDate = (date: Date): DateAvailability | null => {
    if (!availability || !isValid(date)) return null

    const dateStr = safeFormat(date, "yyyy-MM-dd", "")
    if (!dateStr) return null

    return availability.dates.find((d) => d.date === dateStr) || null
  }

  // Format time from ISO string
  const formatTimeFromISO = (isoString: string) => {
    try {
      const date = new Date(isoString)
      if (!isValid(date)) return "Invalid time"

      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    } catch (error) {
      console.error("Error formatting ISO time:", error)
      return "Invalid time"
    }
  }

  // Handle opening the event form
  const handleOpenEventForm = () => {
    setEventStart(new Date())
    setEventEnd(new Date())
    setShowEventForm(true)
  }

  // Handle opening the availability form
  const handleOpenAvailabilityForm = (date?: Date) => {
    if (date && isValid(date)) {
      setAvailabilityDate(date)

      // Check if we already have availability for this date
      const dateStr = safeFormat(date, "yyyy-MM-dd", "")
      if (dateStr) {
        const existingAvailability = availabilityDates.find((d) => d.date === dateStr)

        if (existingAvailability) {
          setIsAvailable(existingAvailability.available)
          setStartTime(existingAvailability.startTime)
          setEndTime(existingAvailability.endTime)
        } else {
          setIsAvailable(true)
          setStartTime(defaultStartTime)
          setEndTime(defaultEndTime)
        }
      }
    } else {
      setAvailabilityDate(new Date())
      setIsAvailable(true)
      setStartTime(defaultStartTime)
      setEndTime(defaultEndTime)
    }

    setShowAvailabilityForm(true)
  }

  // Handle opening the bulk availability form
  const handleOpenBulkAvailabilityForm = () => {
    setBulkStartDate(new Date())
    setBulkEndDate(addDays(new Date(), 14))
    setBulkAvailable(true)
    setBulkStartTime(defaultStartTime)
    setBulkEndTime(defaultEndTime)
    setShowBulkAvailabilityForm(true)
  }

  // Handle viewing event details
  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    try {
      if (!isValid(currentDate)) {
        setCurrentDate(addMonths(new Date(), -1))
      } else {
        setCurrentDate(addMonths(currentDate, -1))
      }
    } catch (error) {
      console.error("Error navigating to previous month:", error)
      setCurrentDate(new Date()) // Reset to current month on error
    }
  }

  // Navigate to next month
  const goToNextMonth = () => {
    try {
      if (!isValid(currentDate)) {
        setCurrentDate(addMonths(new Date(), 1))
      } else {
        setCurrentDate(addMonths(currentDate, 1))
      }
    } catch (error) {
      console.error("Error navigating to next month:", error)
      setCurrentDate(new Date()) // Reset to current month on error
    }
  }

  // Close notification
  const closeNotification = () => {
    setNotification({ ...notification, show: false })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Email Notification */}
      <EmailNotification
        show={notification.show}
        success={notification.success}
        message={notification.message}
        onClose={closeNotification}
      />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={goToToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium mx-2 min-w-[180px] text-center">{dateRangeText}</span>
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="hidden md:block">
            <TabsList>
              <TabsTrigger value="month">
                <Grid className="h-4 w-4 mr-2" />
                Month
              </TabsTrigger>
              <TabsTrigger value="availability">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Availability
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Event
          </Button>
          {user?.role === "owner" && (
            <Button onClick={() => setShowEmployeeMeetingDialog(true)} variant="secondary">
              <Users className="h-4 w-4 mr-2" />
              Employee Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Mobile view selector */}
      <div className="md:hidden mb-4">
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Calendar sidebar with ref */}
        <div ref={sidebarRef} className="hidden lg:block w-64 overflow-auto">
          <CalendarSidebar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onCreateEvent={handleCreateEvent}
            refreshEvents={refreshEvents}
            events={events}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Calendar main content */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-0 h-full">
              {view === "month" && (
                <CalendarMonthView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                  onCreateEventAtTime={handleCreateEventAtTime}
                />
              )}
              {view === "availability" && (
                <IntegratedAvailabilityCalendar
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                  onCreateEventAtTime={handleCreateEventAtTime}
                  onAvailabilityChange={handleAvailabilityChange}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        selectedDate={selectedDate}
        onEventCreated={refreshEvents}
      />

      {/* View Event Dialog */}
      {selectedEvent && (
        <ViewEventDialog
          open={showViewEvent}
          onOpenChange={setShowViewEvent}
          event={selectedEvent}
          onEventUpdated={refreshEvents}
          onEventDeleted={refreshEvents}
        />
      )}

      {/* Schedule Meeting Dialog */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule a Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Meeting title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date & Time</Label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {isValid(eventStart) ? safeFormat(eventStart, "PPP", "Select date") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={eventStart} onSelect={(date) => date && setEventStart(date)} />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={isValid(eventStart) ? safeFormat(eventStart, "HH:mm", "09:00") : "09:00"}
                    onChange={(e) => {
                      try {
                        const [hours, minutes] = e.target.value.split(":").map(Number)
                        const newDate = new Date(eventStart)
                        if (isValid(newDate)) {
                          newDate.setHours(hours, minutes)
                          setEventStart(newDate)
                        }
                      } catch (error) {
                        console.error("Error setting event start time:", error)
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>End Date & Time</Label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {isValid(eventEnd) ? safeFormat(eventEnd, "PPP", "Select date") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={eventEnd} onSelect={(date) => date && setEventEnd(date)} />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={isValid(eventEnd) ? safeFormat(eventEnd, "HH:mm", "17:00") : "17:00"}
                    onChange={(e) => {
                      try {
                        const [hours, minutes] = e.target.value.split(":").map(Number)
                        const newDate = new Date(eventEnd)
                        if (isValid(newDate)) {
                          newDate.setHours(hours, minutes)
                          setEventEnd(newDate)
                        }
                      } catch (error) {
                        console.error("Error setting event end time:", error)
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Participants</Label>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${u.id}`}
                      checked={selectedUsers.includes(u.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers([...selectedUsers, u.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter((id) => id !== u.id))
                        }
                      }}
                    />
                    <Label htmlFor={`user-${u.id}`}>{u.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Meeting location (optional)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Meeting description (optional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmails"
                checked={sendEmailNotifications}
                onCheckedChange={(checked) => setSendEmailNotifications(!!checked)}
              />
              <Label htmlFor="sendEmails">Send email notifications to participants</Label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={createEvent}>Create Meeting</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Employee Meeting Dialog */}
      <ScheduleEmployeeMeeting
        open={showEmployeeMeetingDialog}
        onOpenChange={setShowEmployeeMeetingDialog}
        selectedDate={selectedDate}
        onMeetingScheduled={refreshEvents}
      />
    </div>
  )
}

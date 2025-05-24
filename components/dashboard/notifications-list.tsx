"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Bell, Clock, Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample notification data
const notifications = [
  {
    id: "1",
    title: "New Feature Announcement",
    message: "We've launched a new invoice management system. Check it out!",
    sentAt: new Date(2023, 4, 15, 9, 30),
    sentBy: "Dylan",
    priority: "medium",
    targetType: "all",
    status: "delivered",
    readCount: 12,
    totalRecipients: 15,
  },
  {
    id: "2",
    title: "Maintenance Scheduled",
    message: "The system will be down for maintenance on Saturday from 2-4 AM EST.",
    sentAt: new Date(2023, 4, 10, 14, 15),
    sentBy: "Dylan",
    priority: "high",
    targetType: "all",
    status: "delivered",
    readCount: 15,
    totalRecipients: 15,
  },
  {
    id: "3",
    title: "Team Meeting Reminder",
    message: "Don't forget our weekly team meeting tomorrow at 10 AM.",
    sentAt: new Date(2023, 4, 5, 11, 0),
    sentBy: "Dylan",
    priority: "medium",
    targetType: "role",
    targetName: "Designers",
    status: "delivered",
    readCount: 3,
    totalRecipients: 4,
  },
  {
    id: "4",
    title: "Client Feedback Required",
    message: "Please review the latest client feedback and respond by EOD.",
    sentAt: new Date(2023, 4, 1, 16, 45),
    sentBy: "Dylan",
    priority: "urgent",
    targetType: "individual",
    targetName: "Sarah Miller",
    status: "delivered",
    readCount: 1,
    totalRecipients: 1,
  },
  {
    id: "5",
    title: "Holiday Schedule",
    message: "The office will be closed on May 29th for Memorial Day.",
    sentAt: new Date(2023, 3, 25, 10, 30),
    sentBy: "Dylan",
    priority: "low",
    targetType: "all",
    status: "scheduled",
    scheduledFor: new Date(2023, 4, 22, 9, 0),
    readCount: 0,
    totalRecipients: 15,
  },
]

export function NotificationsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter

    return matchesSearch && matchesPriority && matchesStatus
  })

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Low</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "high":
        return <Badge variant="default">High</Badge>
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge variant="success" className="bg-green-500">
            Delivered
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Scheduled
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTargetDisplay = (notification: any) => {
    switch (notification.targetType) {
      case "all":
        return "All Users"
      case "role":
        return `Role: ${notification.targetName}`
      case "team":
        return `Team: ${notification.targetName}`
      case "individual":
        return `User: ${notification.targetName}`
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notification</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Read</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2" />
                    <p>No notifications found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{notification.message}</div>
                  </TableCell>
                  <TableCell>
                    {notification.status === "scheduled" ? (
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          {format(notification.scheduledFor, "MMM d, yyyy")}
                          <br />
                          {format(notification.scheduledFor, "h:mm a")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm">
                        {format(notification.sentAt, "MMM d, yyyy")}
                        <br />
                        {format(notification.sentAt, "h:mm a")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getTargetDisplay(notification)}</span>
                  </TableCell>
                  <TableCell>{getPriorityBadge(notification.priority)}</TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {notification.status === "delivered" ? (
                        <>
                          <span className="text-sm font-medium">
                            {notification.readCount}/{notification.totalRecipients}
                          </span>
                          <div className="ml-2 h-2 w-16 rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{
                                width: `${(notification.readCount / notification.totalRecipients) * 100}%`,
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

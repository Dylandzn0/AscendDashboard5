"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useNotifications } from "@/lib/notification-context"
import type { NotificationType } from "@/lib/notification-types"

export function SendNotificationForm() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState<NotificationType>("owner_announcement")
  const [priority, setPriority] = useState("medium")
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create a new notification
      const newNotification = {
        id: Math.random().toString(36).substring(2, 9),
        type,
        title,
        message,
        timestamp: new Date(), // Ensure this is a Date object
        read: false,
        sourceName: "Owner",
        priority: priority as "low" | "medium" | "high",
        metadata: {
          senderId: "owner",
          senderName: "Owner",
          targetType: "all",
        },
      }

      // Add the notification to the context
      addNotification(newNotification)

      // Show success toast
      toast({
        title: "Notification Sent",
        description: "Your notification has been sent successfully.",
      })

      // Reset form
      setTitle("")
      setMessage("")
      setType("owner_announcement")
      setPriority("medium")
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "There was an error sending your notification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
        <CardDescription>Send notifications to all users or specific teams.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your notification message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as NotificationType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner_announcement">Announcement</SelectItem>
                  <SelectItem value="owner_direct_message">Direct Message</SelectItem>
                  <SelectItem value="owner_alert">Alert</SelectItem>
                  <SelectItem value="system_update">System Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

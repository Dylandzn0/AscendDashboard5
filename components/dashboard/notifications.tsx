"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Check,
  Trash2,
  MoreHorizontal,
  X,
  Calendar,
  CheckSquare,
  Shield,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Layout,
  Settings,
  Megaphone,
  MessageSquare,
  AlertOctagon,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/lib/notification-context"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Import notification types
import type { Notification, NotificationType } from "@/lib/notification-types"

// Enhanced sample notifications with all types
const sampleNotifications: Notification[] = [
  // Invoice notifications
  {
    id: "1",
    type: "invoice_approved",
    title: "Invoice Approved",
    message: "Invoice #INV-2023-004 for $2,450.00 has been approved and is ready for payment.",
    timestamp: new Date(Date.now() - 10 * 60000), // 10 minutes ago
    read: false,
    sourceId: "INV-2023-004",
    sourceName: "Client XYZ",
    link: "/invoices/INV-2023-004",
    priority: "medium",
    metadata: {
      invoiceId: "INV-2023-004",
      invoiceAmount: "$2,450.00",
      invoiceDate: "2023-05-15",
      clientId: "CLIENT-XYZ",
      dueDate: "2023-06-15",
      status: "approved",
    },
  },
  {
    id: "2",
    type: "invoice_paid",
    title: "Payment Received",
    message: "Payment of $3,200.00 has been received for invoice #INV-2023-002.",
    timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    read: false,
    sourceId: "INV-2023-002",
    sourceName: "Client ABC",
    link: "/invoices/INV-2023-002",
    priority: "medium",
    metadata: {
      invoiceId: "INV-2023-002",
      invoiceAmount: "$3,200.00",
      invoiceDate: "2023-04-28",
      clientId: "CLIENT-ABC",
      status: "paid",
    },
  },

  // Website update notifications
  {
    id: "3",
    type: "website_content_update",
    title: "Website Content Updated",
    message: "The homepage content has been updated with new product information.",
    timestamp: new Date(Date.now() - 5 * 3600000), // 5 hours ago
    read: true,
    sourceName: "Marketing Team",
    link: "/",
    priority: "low",
    metadata: {
      updateType: "content",
      updateDescription: "Updated product descriptions and hero section",
      updateLocation: "/",
      updateAuthor: "Jane Smith",
    },
  },
  {
    id: "4",
    type: "website_maintenance",
    title: "Scheduled Maintenance",
    message: "The website will be undergoing maintenance on Saturday from 2-4 AM.",
    timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
    read: true,
    sourceName: "IT Department",
    priority: "medium",
    metadata: {
      updateType: "maintenance",
      updateDescription: "Server updates and performance improvements",
      updateAuthor: "System Administrator",
    },
  },

  // Owner notifications
  {
    id: "5",
    type: "owner_announcement",
    title: "Company Update",
    message: "We're excited to announce that we've reached 1,000 clients! Thank you for your hard work.",
    timestamp: new Date(Date.now() - 2 * 24 * 3600000), // 2 days ago
    read: true,
    sourceName: "John CEO",
    priority: "medium",
    metadata: {
      senderId: "user1",
      senderName: "John CEO",
      targetType: "all",
    },
  },
  {
    id: "6",
    type: "owner_alert",
    title: "Important: New Security Policy",
    message: "Please review and acknowledge our updated security policy by the end of the week.",
    timestamp: new Date(Date.now() - 3 * 24 * 3600000), // 3 days ago
    read: false,
    sourceName: "Security Team",
    link: "/security-policy",
    priority: "high",
    metadata: {
      senderId: "user2",
      senderName: "Security Team",
      targetType: "all",
      requiresAcknowledgment: true,
    },
    actions: [
      { label: "Acknowledge", action: "acknowledge" },
      { label: "View Policy", action: "view" },
    ],
  },
]

// Helper function to format relative time - Fixed to handle string dates
function formatRelativeTime(timestamp: Date | string): string {
  // Ensure we have a Date object
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", timestamp)
    return "Invalid date"
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  // For older notifications, show the actual date
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  })
}

// Enhanced helper function to get icon based on notification type
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    // Invoice notifications
    case "invoice_approved":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "invoice_rejected":
      return <XCircle className="h-5 w-5 text-red-500" />
    case "invoice_paid":
      return <CreditCard className="h-5 w-5 text-blue-500" />
    case "invoice_overdue":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case "invoice_created":
    case "invoice_updated":
      return <FileText className="h-5 w-5 text-primary" />

    // Website update notifications
    case "website_content_update":
      return <FileText className="h-5 w-5 text-purple-500" />
    case "website_design_update":
      return <Layout className="h-5 w-5 text-indigo-500" />
    case "website_maintenance":
      return <Settings className="h-5 w-5 text-gray-500" />
    case "website_feature_added":
      return <CheckSquare className="h-5 w-5 text-green-500" />

    // Owner notifications
    case "owner_announcement":
      return <Megaphone className="h-5 w-5 text-blue-500" />
    case "owner_direct_message":
      return <MessageSquare className="h-5 w-5 text-purple-500" />
    case "owner_alert":
      return <AlertOctagon className="h-5 w-5 text-red-500" />

    // Other notification types
    case "meeting_scheduled":
    case "meeting_canceled":
    case "meeting_reminder":
      return <Calendar className="h-5 w-5 text-primary" />
    case "task_assigned":
    case "task_completed":
    case "task_deadline_approaching":
      return <CheckSquare className="h-5 w-5 text-primary" />
    case "user_role_updated":
      return <Shield className="h-5 w-5 text-primary" />
    case "system_update":
    case "system_maintenance":
    case "system_error":
      return <Settings className="h-5 w-5 text-primary" />
    default:
      return <Bell className="h-5 w-5 text-primary" />
  }
}

// Helper function to get background color based on notification type
function getNotificationBackground(type: NotificationType) {
  // Invoice notifications
  if (type.startsWith("invoice_")) {
    switch (type) {
      case "invoice_approved":
        return "bg-green-100 dark:bg-green-900/20"
      case "invoice_rejected":
        return "bg-red-100 dark:bg-red-900/20"
      case "invoice_paid":
        return "bg-blue-100 dark:bg-blue-900/20"
      case "invoice_overdue":
        return "bg-amber-100 dark:bg-amber-900/20"
      default:
        return "bg-gray-100 dark:bg-gray-900/20"
    }
  }

  // Website update notifications
  if (type.startsWith("website_")) {
    switch (type) {
      case "website_content_update":
        return "bg-purple-100 dark:bg-purple-900/20"
      case "website_design_update":
        return "bg-indigo-100 dark:bg-indigo-900/20"
      case "website_maintenance":
        return "bg-gray-100 dark:bg-gray-900/20"
      case "website_feature_added":
        return "bg-green-100 dark:bg-green-900/20"
      default:
        return "bg-gray-100 dark:bg-gray-900/20"
    }
  }

  // Owner notifications
  if (type.startsWith("owner_")) {
    switch (type) {
      case "owner_announcement":
        return "bg-blue-100 dark:bg-blue-900/20"
      case "owner_direct_message":
        return "bg-purple-100 dark:bg-purple-900/20"
      case "owner_alert":
        return "bg-red-100 dark:bg-red-900/20"
      default:
        return "bg-gray-100 dark:bg-gray-900/20"
    }
  }

  // Default for other types
  return "bg-primary/10"
}

// Helper function to get notification category
function getNotificationCategory(type: NotificationType): string {
  if (type.startsWith("invoice_")) return "invoice"
  if (type.startsWith("website_")) return "website"
  if (type.startsWith("owner_")) return "owner"
  if (type.startsWith("meeting_")) return "meeting"
  if (type.startsWith("task_")) return "task"
  if (type.startsWith("user_")) return "user"
  if (type.startsWith("system_")) return "system"
  return "other"
}

// Helper function to highlight search terms in text
function highlightSearchTerm(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function NotificationsMenu() {
  // Use the notification context with isClearing state
  const {
    notifications: contextNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearRead,
    isClearing: contextIsClearing,
  } = useNotifications()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [localIsClearing, setLocalIsClearing] = useState(false)
  const isClearing = contextIsClearing || localIsClearing

  // State for confirmation dialog - Only keeping this for "Clear Read" functionality
  const [showClearReadConfirm, setShowClearReadConfirm] = useState(false)

  // State for animation
  const [clearingAnimation, setClearingAnimation] = useState(false)

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Ref to track component mount state
  const isMounted = useRef(true)

  // Ref to track if we should manually close the dropdown
  const shouldCloseDropdown = useRef(false)

  // Ref to track if we've initialized sample notifications
  const hasSampleNotifications = useRef(false)

  // Set up mount/unmount tracking
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Initialize with sample notifications if context is empty
  useEffect(() => {
    if (contextNotifications && contextNotifications.length > 0) {
      // Ensure all timestamps are Date objects
      setNotifications(
        contextNotifications.map((notification) => ({
          ...notification,
          timestamp: notification.timestamp instanceof Date ? notification.timestamp : new Date(notification.timestamp),
        })),
      )
      // Mark that we have real notifications
      hasSampleNotifications.current = false
    } else if (!isClearing && !hasSampleNotifications.current) {
      // Only use sample notifications if we're not in the process of clearing
      // and we haven't already added sample notifications
      setNotifications(sampleNotifications)
      hasSampleNotifications.current = true

      // Add sample notifications to context - but only once
      sampleNotifications.forEach((notification) => {
        addNotification(notification)
      })
    }
  }, [contextNotifications, addNotification, isClearing])

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // Don't close if we're in a dialog or if we're clearing notifications
      if (showClearReadConfirm || isClearing) {
        return
      }

      // Only close if clicking outside the notifications container
      if (!target.closest(".notifications-container") && !target.closest("[role='dialog']")) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, showClearReadConfirm, isClearing])

  // Focus search input when search mode is activated
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearching])

  // Listen for notification clear events
  useEffect(() => {
    const handleNotificationsCleared = (event: Event) => {
      if (isMounted.current) {
        console.log("Notifications cleared event received", (event as CustomEvent).detail)
        setNotifications([])
        hasSampleNotifications.current = false
      }
    }

    window.addEventListener("notificationsCleared", handleNotificationsCleared)
    return () => {
      window.removeEventListener("notificationsCleared", handleNotificationsCleared)
    }
  }, [])

  // Effect to handle delayed dropdown closing after clearing
  useEffect(() => {
    if (shouldCloseDropdown.current && !isClearing) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setOpen(false)
          shouldCloseDropdown.current = false
        }
      }, 1000) // Delay closing to allow user to see the empty state

      return () => clearTimeout(timer)
    }
  }, [isClearing])

  // Handle notification click with enhanced functionality
  const handleNotificationClick = async (notification: Notification) => {
    markAsRead(notification.id)

    // Handle invoice-specific notifications
    if (notification.type.startsWith("invoice_") && notification.metadata?.invoiceId) {
      try {
        setLoading(notification.id)

        // Simulate checking if invoice exists/is accessible
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, you would check if the invoice exists and the user has permission
        const invoiceExists = true
        const hasPermission = true

        if (!invoiceExists) {
          toast({
            title: "Invoice Not Found",
            description: `The invoice ${notification.metadata.invoiceId} could not be found.`,
            variant: "destructive",
          })
          setLoading(null)
          return
        }

        if (!hasPermission) {
          toast({
            title: "Access Denied",
            description: `You don't have permission to view invoice ${notification.metadata.invoiceId}.`,
            variant: "destructive",
          })
          setLoading(null)
          return
        }

        // Navigate to the invoice details page
        if (notification.link) {
          router.push(notification.link)
          setOpen(false)
        }
      } catch (error) {
        console.error("Error navigating to invoice:", error)
        toast({
          title: "Error",
          description: "There was an error loading the invoice. Please try again.",
          variant: "destructive",
        })
      } finally {
        if (isMounted.current) {
          setLoading(null)
        }
      }
    }
    // Handle website update notifications
    else if (notification.type.startsWith("website_")) {
      if (notification.link) {
        router.push(notification.link)
        setOpen(false)
      } else {
        toast({
          title: "Website Update",
          description: notification.message,
        })
      }
    }
    // Handle owner notifications
    else if (notification.type.startsWith("owner_")) {
      if (notification.metadata?.requiresAcknowledgment) {
        // In a real app, you would call an API to acknowledge the notification
        toast({
          title: "Notification Acknowledged",
          description: "Thank you for acknowledging this notification.",
        })
      }

      if (notification.link) {
        router.push(notification.link)
        setOpen(false)
      }
    }
    // Handle other notification types with links
    else if (notification.link) {
      router.push(notification.link)
      setOpen(false)
    }
  }

  // Handle action button click
  const handleActionClick = (e: React.MouseEvent, notification: Notification, action: string) => {
    e.stopPropagation()

    // Handle different actions
    switch (action) {
      case "acknowledge":
        toast({
          title: "Notification Acknowledged",
          description: "Thank you for acknowledging this notification.",
        })
        break

      case "view":
        if (notification.link) {
          router.push(notification.link)
          setOpen(false)
        }
        break

      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  const handleBellClick = () => {
    setOpen(!open)
  }

  // Direct clearAll function without confirmation dialog
  const handleClearAll = useCallback(
    async (e?: React.MouseEvent) => {
      // Stop event propagation to prevent dropdown from closing
      if (e) {
        e.stopPropagation()
      }

      // If there are no notifications, show a message instead of proceeding
      if (notifications.length === 0) {
        toast({
          title: "No notifications to clear",
          description: "Your notification list is already empty.",
          variant: "default",
        })
        return
      }

      // If already clearing, don't start another clear operation
      if (isClearing) {
        return
      }

      try {
        // Set local clearing state
        setLocalIsClearing(true)
        setClearingAnimation(true)

        // First, clear from localStorage to prevent race conditions
        localStorage.removeItem("notifications")

        // Call the context's clearAll function
        await clearAll()

        // Update local state explicitly to ensure UI is updated
        if (isMounted.current) {
          setNotifications([])
          hasSampleNotifications.current = false
        }

        // Show success toast with animation
        toast({
          title: "All notifications cleared",
          description: "Your notification list has been emptied successfully.",
          variant: "default",
          action: (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ),
        })

        // Set flag to close dropdown after a delay
        shouldCloseDropdown.current = true
      } catch (error) {
        console.error("Error clearing all notifications:", error)
        toast({
          title: "Error",
          description: "There was a problem clearing your notifications. Please try again.",
          variant: "destructive",
        })
      } finally {
        // Reset states
        if (isMounted.current) {
          setLocalIsClearing(false)
          setClearingAnimation(false)
        }
      }
    },
    [clearAll, notifications.length, isClearing],
  )

  // Enhanced clearRead function with confirmation and feedback
  const handleClearRead = useCallback(
    (e?: React.MouseEvent) => {
      // Stop event propagation to prevent dropdown from closing
      if (e) {
        e.stopPropagation()
      }

      // Check if there are any read notifications
      const readCount = notifications.filter((n) => n.read).length
      if (readCount === 0) {
        toast({
          title: "No read notifications",
          description: "There are no read notifications to clear.",
          variant: "default",
        })
        return
      }

      // If already clearing, don't show confirmation again
      if (isClearing) {
        return
      }

      setShowClearReadConfirm(true)
    },
    [notifications, isClearing],
  )

  const confirmClearRead = useCallback(
    async (e?: React.MouseEvent) => {
      try {
        // Stop event propagation to prevent dropdown from closing
        if (e) {
          e.stopPropagation()
          e.preventDefault()
        }

        setLocalIsClearing(true)
        setClearingAnimation(true)

        // Add a slight delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Clear read notifications
        await clearRead()

        // Update local state explicitly
        if (isMounted.current) {
          setNotifications((prev) => prev.filter((n) => !n.read))
        }

        // Close the confirmation dialog
        if (isMounted.current) {
          setShowClearReadConfirm(false)
        }

        // Show success toast
        toast({
          title: "Read Notifications Cleared",
          description: "All read notifications have been permanently deleted.",
          variant: "default",
        })
      } catch (error) {
        console.error("Error clearing read notifications:", error)
        toast({
          title: "Error",
          description: "There was a problem clearing your read notifications. Please try again.",
          variant: "destructive",
        })
      } finally {
        if (isMounted.current) {
          setLocalIsClearing(false)
          setClearingAnimation(false)
        }
      }
    },
    [clearRead],
  )

  // Toggle search mode
  const toggleSearch = () => {
    setIsSearching(!isSearching)
    if (isSearching) {
      setSearchQuery("")
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Filter notifications based on active tab and search query
  const filteredNotifications = notifications.filter((notification) => {
    // First filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notification.read) ||
      getNotificationCategory(notification.type) === activeTab

    // Then filter by search query if it exists
    if (!matchesTab) return false

    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()

    // Search in title and message
    if (notification.title.toLowerCase().includes(query) || notification.message.toLowerCase().includes(query)) {
      return true
    }

    // Search in source name and ID
    if (
      (notification.sourceName && notification.sourceName.toLowerCase().includes(query)) ||
      (notification.sourceId && notification.sourceId.toLowerCase().includes(query))
    ) {
      return true
    }

    // Search in metadata based on notification type
    if (notification.metadata) {
      // Invoice notifications
      if (notification.type.startsWith("invoice_")) {
        return (
          (notification.metadata.invoiceId && notification.metadata.invoiceId.toLowerCase().includes(query)) ||
          (notification.metadata.invoiceAmount && notification.metadata.invoiceAmount.toLowerCase().includes(query)) ||
          (notification.metadata.clientId && notification.metadata.clientId.toLowerCase().includes(query)) ||
          (notification.metadata.status && notification.metadata.status.toLowerCase().includes(query))
        )
      }

      // Website notifications
      if (notification.type.startsWith("website_")) {
        return (
          (notification.metadata.updateType && notification.metadata.updateType.toLowerCase().includes(query)) ||
          (notification.metadata.updateDescription &&
            notification.metadata.updateDescription.toLowerCase().includes(query)) ||
          (notification.metadata.updateLocation &&
            notification.metadata.updateLocation.toLowerCase().includes(query)) ||
          (notification.metadata.updateAuthor && notification.metadata.updateAuthor.toLowerCase().includes(query))
        )
      }

      // Owner notifications
      if (notification.type.startsWith("owner_")) {
        return notification.metadata.senderName && notification.metadata.senderName.toLowerCase().includes(query)
      }
    }

    return false
  })

  // Reset to "all" tab if current tab was removed
  useEffect(() => {
    if (activeTab === "invoice" || activeTab === "owner") {
      setActiveTab("all")
    }
  }, [activeTab])

  // Debug logging for notification state changes
  useEffect(() => {
    console.log(`Notifications count: ${notifications.length}, Context count: ${contextNotifications.length}`)
  }, [notifications.length, contextNotifications.length])

  // Add this after the existing useEffect hooks
  useEffect(() => {
    // Function to handle clear all button click
    const handleClearAllButtonClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-testid="clear-all-button"]')) {
        console.log("Clear All button clicked via event listener")
        handleClearAll()
      }
    }

    // Add event listener
    document.addEventListener("click", handleClearAllButtonClick, true)

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClearAllButtonClick, true)
    }
  }, [handleClearAll])

  return (
    <>
      <div className="relative z-50 notifications-container">
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer"
          onClick={handleBellClick}
          aria-label="Notifications"
          data-testid="notification-bell"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground"
              data-testid="notification-badge"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-[380px] rounded-md border bg-background shadow-lg notifications-container"
            data-testid="notification-panel"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the dropdown
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              {isSearching ? (
                <div className="flex w-full items-center gap-2">
                  <div className="relative w-full">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search notifications..."
                      className="w-full pl-8 pr-8 h-8 text-sm"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      data-testid="notification-search"
                      onClick={(e) => e.stopPropagation()} // Prevent clicks in search from closing dropdown
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation() // Prevent propagation
                          clearSearch()
                        }}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Clear search</span>
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent propagation
                      toggleSearch()
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close search</span>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="h-5">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent propagation
                        toggleSearch()
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span className="sr-only">Search notifications</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()} // Prevent propagation
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        {unreadCount > 0 && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation() // Prevent propagation
                              markAllAsRead()
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => handleClearRead(e)}
                          disabled={!notifications.some((n) => n.read) || isClearing}
                          data-testid="dropdown-clear-read"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear read notifications
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleClearAll(e)}
                          disabled={notifications.length === 0 || isClearing}
                          data-testid="dropdown-clear-all"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear all notifications
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>

            {/* Search results count */}
            {searchQuery.trim() && (
              <div className="border-b px-4 py-2 text-sm text-muted-foreground">
                {filteredNotifications.length === 0
                  ? "No results found"
                  : `Found ${filteredNotifications.length} ${
                      filteredNotifications.length === 1 ? "result" : "results"
                    } for "${searchQuery}"`}
              </div>
            )}

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              {!isSearching && (
                <div className="border-b px-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all" onClick={(e) => e.stopPropagation()}>
                      All
                    </TabsTrigger>
                    <TabsTrigger value="unread" onClick={(e) => e.stopPropagation()}>
                      Unread {unreadCount > 0 && `(${unreadCount})`}
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}

              <TabsContent value={activeTab} className="m-0">
                {filteredNotifications.length > 0 ? (
                  <div className={cn("relative", clearingAnimation && "opacity-50 pointer-events-none")}>
                    {clearingAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/30 z-10">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2"></div>
                          <span className="text-sm font-medium">Clearing notifications...</span>
                        </div>
                      </div>
                    )}
                    <ScrollArea className="h-[400px]">
                      <div className="flex flex-col">
                        {filteredNotifications.map((notification) => (
                          <button
                            key={notification.id}
                            className={cn(
                              "flex gap-3 border-b p-4 text-left hover:bg-muted/50 transition-colors w-full relative",
                              !notification.read && "bg-muted/30",
                              loading === notification.id && "opacity-70 pointer-events-none",
                            )}
                            onClick={(e) => {
                              e.stopPropagation() // Prevent propagation
                              handleNotificationClick(notification)
                            }}
                            disabled={loading === notification.id}
                            data-testid={`notification-item-${notification.id}`}
                          >
                            {loading === notification.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                              </div>
                            )}
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                                getNotificationBackground(notification.type),
                              )}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={cn("font-medium line-clamp-1", !notification.read && "font-semibold")}>
                                  {searchQuery && notification.title.toLowerCase().includes(searchQuery.toLowerCase())
                                    ? highlightSearchTerm(notification.title, searchQuery)
                                    : notification.title}
                                </h4>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatRelativeTime(notification.timestamp)}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {searchQuery && notification.message.toLowerCase().includes(searchQuery.toLowerCase())
                                  ? highlightSearchTerm(notification.message, searchQuery)
                                  : notification.message}
                              </p>

                              {/* Display metadata based on notification type */}
                              {notification.type.startsWith("invoice_") && notification.metadata && (
                                <div className="mt-2 text-xs grid grid-cols-2 gap-x-4 gap-y-1 border-t border-muted pt-2">
                                  {notification.metadata.invoiceId && (
                                    <>
                                      <span className="text-muted-foreground">Invoice ID:</span>
                                      <span className="font-medium">
                                        {searchQuery &&
                                        notification.metadata.invoiceId
                                          .toLowerCase()
                                          .includes(searchQuery.toLowerCase())
                                          ? highlightSearchTerm(notification.metadata.invoiceId, searchQuery)
                                          : notification.metadata.invoiceId}
                                      </span>
                                    </>
                                  )}
                                  {notification.metadata.invoiceAmount && (
                                    <>
                                      <span className="text-muted-foreground">Amount:</span>
                                      <span className="font-medium">
                                        {searchQuery &&
                                        notification.metadata.invoiceAmount
                                          .toLowerCase()
                                          .includes(searchQuery.toLowerCase())
                                          ? highlightSearchTerm(notification.metadata.invoiceAmount, searchQuery)
                                          : notification.metadata.invoiceAmount}
                                      </span>
                                    </>
                                  )}
                                  {notification.metadata.status && (
                                    <>
                                      <span className="text-muted-foreground">Status:</span>
                                      <span
                                        className={cn(
                                          "font-medium",
                                          notification.metadata.status === "approved" && "text-green-600",
                                          notification.metadata.status === "rejected" && "text-red-600",
                                          notification.metadata.status === "paid" && "text-blue-600",
                                          notification.metadata.status === "overdue" && "text-amber-600",
                                        )}
                                      >
                                        {searchQuery &&
                                        notification.metadata.status.toLowerCase().includes(searchQuery.toLowerCase())
                                          ? highlightSearchTerm(
                                              notification.metadata.status.charAt(0).toUpperCase() +
                                                notification.metadata.status.slice(1),
                                              searchQuery,
                                            )
                                          : notification.metadata.status.charAt(0).toUpperCase() +
                                            notification.metadata.status.slice(1)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Website update metadata */}
                              {notification.type.startsWith("website_") && notification.metadata && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {notification.metadata.updateLocation && (
                                    <div className="mt-1">
                                      <span className="font-medium">Location: </span>
                                      {searchQuery &&
                                      notification.metadata.updateLocation
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase())
                                        ? highlightSearchTerm(notification.metadata.updateLocation, searchQuery)
                                        : notification.metadata.updateLocation}
                                    </div>
                                  )}
                                  {notification.metadata.updateAuthor && (
                                    <div className="mt-1">
                                      <span className="font-medium">Updated by: </span>
                                      {searchQuery &&
                                      notification.metadata.updateAuthor
                                        .toLowerCase()
                                        .includes(searchQuery.toLowerCase())
                                        ? highlightSearchTerm(notification.metadata.updateAuthor, searchQuery)
                                        : notification.metadata.updateAuthor}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Owner notification metadata */}
                              {notification.type.startsWith("owner_") && notification.metadata && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {notification.metadata.senderName && (
                                    <div className="mt-1">
                                      <span className="font-medium">From: </span>
                                      {searchQuery &&
                                      notification.metadata.senderName.toLowerCase().includes(searchQuery.toLowerCase())
                                        ? highlightSearchTerm(notification.metadata.senderName, searchQuery)
                                        : notification.metadata.senderName}
                                    </div>
                                  )}
                                  {notification.metadata.requiresAcknowledgment && (
                                    <div className="mt-1 text-amber-600 font-medium">Requires acknowledgment</div>
                                  )}
                                </div>
                              )}

                              {/* For other notification types */}
                              {!notification.type.startsWith("invoice_") &&
                                !notification.type.startsWith("website_") &&
                                !notification.type.startsWith("owner_") &&
                                (notification.sourceId || notification.sourceName) && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {notification.sourceId && (
                                      <span className="font-medium">
                                        {searchQuery &&
                                        notification.sourceId.toLowerCase().includes(searchQuery.toLowerCase())
                                          ? highlightSearchTerm(notification.sourceId, searchQuery)
                                          : notification.sourceId}
                                      </span>
                                    )}
                                    {notification.sourceId && notification.sourceName && " • "}
                                    {notification.sourceName && (
                                      <span>
                                        {searchQuery &&
                                        notification.sourceName.toLowerCase().includes(searchQuery.toLowerCase())
                                          ? highlightSearchTerm(notification.sourceName, searchQuery)
                                          : notification.sourceName}
                                      </span>
                                    )}
                                  </div>
                                )}

                              {/* Action buttons */}
                              {notification.actions && notification.actions.length > 0 && (
                                <div className="mt-2 flex gap-2">
                                  {notification.actions.map((action, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation() // Prevent propagation
                                        handleActionClick(e, notification, action.action)
                                      }}
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {!notification.read && <div className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <div className="text-center">
                      {searchQuery ? (
                        <>
                          <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
                          <p className="mt-2 text-sm text-muted-foreground">No matching notifications found</p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation() // Prevent propagation
                              clearSearch()
                            }}
                            className="mt-2"
                          >
                            Clear search
                          </Button>
                        </>
                      ) : (
                        <>
                          <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
                          <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Add a prominent Clear All button at the bottom */}
            <div className="border-t p-3">
              <div className="flex justify-between items-center">
                {notifications.length > 0 ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleClearRead(e)}
                      className="text-muted-foreground"
                      disabled={!notifications.some((n) => n.read) || isClearing}
                      data-testid="clear-read-button"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear read
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent event bubbling
                        e.preventDefault() // Prevent default behavior
                        console.log("Clear All button clicked directly")
                        handleClearAll(e)
                      }}
                      className="ml-auto"
                      disabled={isClearing}
                      data-testid="clear-all-button"
                    >
                      {isClearing ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear All
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center w-full">No notifications to clear</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Read Confirmation Dialog - Keeping this for read notifications only */}
      <AlertDialog
        open={showClearReadConfirm}
        onOpenChange={(open) => {
          if (!isClearing) setShowClearReadConfirm(open)
        }}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Read Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all read notifications? This action cannot be undone and will permanently
              delete all read notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isClearing}
              onClick={(e) => e.stopPropagation()} // Prevent propagation
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                confirmClearRead(e)
              }}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-clear-read"
            >
              {isClearing ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Clearing...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Clear Read
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

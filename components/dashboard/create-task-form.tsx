"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { loadData, saveData } from "@/lib/data-persistence"
import { generateId } from "@/lib/uuid"
import { format } from "date-fns"
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export type Task = {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed" | "blocked"
  priority: "low" | "medium" | "high"
  assignedTo: string
  createdBy: string
  projectId?: string
  dueDate: string
  createdAt: string
  completedAt?: string
}

type CreateTaskFormProps = {
  onSuccess: () => void
  initialData?: Partial<Task>
  isEditing?: boolean
  projectId?: string
}

export function CreateTaskForm({ onSuccess, initialData, isEditing = false, projectId }: CreateTaskFormProps) {
  const { user, users } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
  )
  const [dateError, setDateError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "todo",
    priority: initialData?.priority || "medium",
    assignedTo: initialData?.assignedTo || user?.id || "",
    projectId: initialData?.projectId || projectId || "",
  })

  // Get projects for dropdown
  const projects = loadData("projects", [])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Validate dates whenever they change
  useEffect(() => {
    validateDates()
  }, [dueDate])

  // Function to validate dates
  const validateDates = () => {
    setDateError(null)

    // Optional: Add any specific date validation logic here
    // For example, you might want to ensure due dates aren't in the past

    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate form
    if (!formData.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a task title",
        variant: "destructive",
      })
      return
    }

    if (!formData.assignedTo) {
      toast({
        title: "Missing assignee",
        description: "Please select a team member to assign this task",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create task object
      const taskData: Task = {
        id: initialData?.id || generateId(),
        title: formData.title,
        description: formData.description,
        status: formData.status as Task["status"],
        priority: formData.priority as Task["priority"],
        assignedTo: formData.assignedTo,
        createdBy: initialData?.createdBy || user.id,
        projectId: formData.projectId || undefined,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
        createdAt: initialData?.createdAt || new Date().toISOString(),
        completedAt: initialData?.completedAt,
      }

      // Save task to localStorage
      const existingTasks: Task[] = loadData("tasks", [])

      let updatedTasks: Task[]

      if (isEditing) {
        // Update existing task
        updatedTasks = existingTasks.map((t) => (t.id === taskData.id ? taskData : t))
      } else {
        // Add new task
        updatedTasks = [...existingTasks, taskData]
      }

      saveData("tasks", updatedTasks)

      // Create notification for assigned user if it's not the current user
      if (formData.assignedTo !== user.id) {
        const assignedUser = users.find((u) => u.id === formData.assignedTo)
        if (assignedUser) {
          const notifications = loadData("notifications", [])
          const newNotification = {
            id: generateId(),
            userId: formData.assignedTo,
            title: isEditing ? "Task Updated" : "New Task Assigned",
            message: `${isEditing ? "Task updated" : "You have been assigned a new task"}: ${formData.title}`,
            type: "task",
            read: false,
            createdAt: new Date().toISOString(),
            link: "/tasks-projects",
          }
          saveData("notifications", [...notifications, newNotification])
        }
      }

      // Show success message
      toast({
        title: isEditing ? "Task updated" : "Task created",
        description: isEditing
          ? "The task has been updated successfully."
          : "The task has been created and assigned successfully.",
      })

      // Call success callback
      onSuccess()
    } catch (error) {
      console.error("Error saving task:", error)
      toast({
        title: "Error",
        description: "There was a problem saving the task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select value={formData.assignedTo} onValueChange={(value) => handleSelectChange("assignedTo", value)}>
            <SelectTrigger id="assignedTo">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="projectId">Project (Optional)</Label>
          <Select value={formData.projectId} onValueChange={(value) => handleSelectChange("projectId", value)}>
            <SelectTrigger id="projectId">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {projects.map((project: any) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <EnhancedDatePicker
          label="Due Date"
          date={dueDate}
          onDateChange={setDueDate}
          placeholder="Select due date"
          error={dateError}
        />
      </div>

      {dateError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{dateError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}

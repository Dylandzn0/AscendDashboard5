"use client"

import { useState } from "react"
import { MoreHorizontal, ClipboardList, FolderKanban } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateTaskForm } from "@/components/dashboard/create-task-form"
import { CreateProjectForm } from "@/components/dashboard/create-project-form"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/auth-context"

interface TeamActionDropdownProps {
  teamMember: User
}

export function TeamActionDropdown({ teamMember }: TeamActionDropdownProps) {
  const { toast } = useToast()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)

  const handleAssignTask = () => {
    setIsTaskDialogOpen(true)
  }

  const handleAssignProject = () => {
    setIsProjectDialogOpen(true)
  }

  const handleTaskCreated = () => {
    setIsTaskDialogOpen(false)
    toast({
      title: "Task assigned",
      description: `A new task has been assigned to ${teamMember.name}.`,
    })
  }

  const handleProjectCreated = () => {
    setIsProjectDialogOpen(false)
    toast({
      title: "Project assigned",
      description: `A new project has been assigned to ${teamMember.name}.`,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleAssignTask} className="cursor-pointer">
            <ClipboardList className="mr-2 h-4 w-4" />
            Assign Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAssignProject} className="cursor-pointer">
            <FolderKanban className="mr-2 h-4 w-4" />
            Assign Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Task Assignment Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assign Task to {teamMember.name}</DialogTitle>
          </DialogHeader>
          <CreateTaskForm
            onTaskCreated={handleTaskCreated}
            onCancel={() => setIsTaskDialogOpen(false)}
            preselectedAssignee={teamMember.id}
          />
        </DialogContent>
      </Dialog>

      {/* Project Assignment Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assign Project to {teamMember.name}</DialogTitle>
          </DialogHeader>
          <CreateProjectForm
            onProjectCreated={handleProjectCreated}
            onCancel={() => setIsProjectDialogOpen(false)}
            preselectedAssignee={teamMember.id}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

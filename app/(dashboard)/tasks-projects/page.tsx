"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectsList } from "@/components/dashboard/projects-list"
import { TasksList } from "@/components/dashboard/tasks-list"
import { CreateTaskForm } from "@/components/dashboard/create-task-form"
import { CreateProjectForm } from "@/components/dashboard/create-project-form"
import { PlusCircle, X } from "lucide-react"

export default function TasksProjectsPage() {
  const [activeTab, setActiveTab] = useState("tasks")
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Function to handle storage events
    const handleStorageChange = () => {
      setRefreshKey((prev) => prev + 1)
    }

    // Add event listener
    window.addEventListener("storage", handleStorageChange)

    // Clean up
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const handleTaskCreated = () => {
    setShowCreateTask(false)
    setRefreshKey((prev) => prev + 1)
  }

  const handleProjectCreated = () => {
    setShowCreateProject(false)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks & Projects</h1>
          <p className="text-muted-foreground">Manage your tasks and projects in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateTask(true)} disabled={showCreateTask}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Button>
          <Button onClick={() => setShowCreateProject(true)} disabled={showCreateProject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {showCreateTask && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={() => setShowCreateTask(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CreateTaskForm onTaskCreated={handleTaskCreated} onCancel={() => setShowCreateTask(false)} />
        </div>
      )}

      {showCreateProject && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={() => setShowCreateProject(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CreateProjectForm onProjectCreated={handleProjectCreated} onCancel={() => setShowCreateProject(false)} />
        </div>
      )}

      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>View and manage all your tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              <TasksList key={`tasks-${refreshKey}`} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>View and manage all your projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectsList key={`projects-${refreshKey}`} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

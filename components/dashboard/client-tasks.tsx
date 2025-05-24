import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal } from "lucide-react"

export function ClientTasks({ limit }: { limit?: number }) {
  const tasks = [
    {
      id: "1",
      name: "Design Homepage Mockup",
      project: "Website Redesign",
      projectId: "1",
      priority: "High",
      dueDate: "May 10, 2025",
      assignee: {
        name: "Alex Johnson",
        avatar: "/abstract-geometric-shapes.png",
      },
      completed: false,
    },
    {
      id: "2",
      name: "Create Social Media Content Calendar",
      project: "Social Media Campaign",
      projectId: "2",
      priority: "Medium",
      dueDate: "May 12, 2025",
      assignee: {
        name: "Sarah Miller",
        avatar: "/abstract-geometric-shapes.png",
      },
      completed: false,
    },
    {
      id: "3",
      name: "Edit Product Demo Video",
      project: "Product Launch Video",
      projectId: "3",
      priority: "High",
      dueDate: "May 8, 2025",
      assignee: {
        name: "Mike Wilson",
        avatar: "/diverse-group-collaborating.png",
      },
      completed: true,
    },
    {
      id: "4",
      name: "Finalize Logo Design",
      project: "Brand Guidelines",
      projectId: "4",
      priority: "Low",
      dueDate: "May 5, 2025",
      assignee: {
        name: "Emily Chen",
        avatar: "/abstract-geometric-shapes.png",
      },
      completed: true,
    },
    {
      id: "5",
      name: "Competitor Analysis Research",
      project: "Marketing Strategy",
      projectId: "5",
      priority: "Medium",
      dueDate: "May 15, 2025",
      assignee: {
        name: "David Kim",
        avatar: "/abstract-geometric-shapes.png",
      },
      completed: false,
    },
  ]

  const displayTasks = limit ? tasks.slice(0, limit) : tasks

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTasks.map((task) => (
              <TableRow key={task.id} className={task.completed ? "opacity-60" : ""}>
                <TableCell>
                  <Checkbox checked={task.completed} />
                </TableCell>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>{task.project}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"
                    }
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.dueDate}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                      <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{task.assignee.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

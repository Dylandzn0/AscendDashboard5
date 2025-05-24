"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Mail } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export function ClientTeamMembers({ clientId }: { clientId: string }) {
  const { toast } = useToast()

  // This would come from your database in a real app
  const teamMembers = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@ascendmedia.com",
      role: "Project Manager",
      avatar: "/abstract-geometric-shapes.png",
      canInvoice: true,
    },
    {
      id: "2",
      name: "Sarah Miller",
      email: "sarah@ascendmedia.com",
      role: "Designer",
      avatar: "/abstract-geometric-shapes.png",
      canInvoice: true,
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike@ascendmedia.com",
      role: "Editor",
      avatar: "/diverse-group-collaborating.png",
      canInvoice: false,
    },
    {
      id: "4",
      name: "Emily Chen",
      email: "emily@ascendmedia.com",
      role: "YouTube Manager",
      avatar: "/abstract-geometric-shapes.png",
      canInvoice: true,
    },
  ]

  const toggleInvoicePermission = (memberId: string) => {
    toast({
      title: "Permission updated",
      description: "Team member's invoice permission has been updated.",
    })
  }

  const sendInvite = (memberId: string) => {
    toast({
      title: "Invite sent",
      description: "An invitation has been sent to the team member.",
    })
  }

  return (
    <div>
      <div className="rounded-md border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invoice Permission</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{member.name}</div>
                  </div>
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <Badge variant={member.canInvoice ? "default" : "outline"}>
                    {member.canInvoice ? "Can Invoice" : "No Access"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleInvoicePermission(member.id)}>
                        {member.canInvoice ? "Remove Invoice Permission" : "Grant Invoice Permission"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => sendInvite(member.id)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invite
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

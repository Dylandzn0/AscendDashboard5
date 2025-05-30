"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamMembersList } from "@/components/dashboard/team-members-list"
import { CreateTeamMemberForm } from "@/components/dashboard/create-team-member-form"
import { EditTeamMemberForm } from "@/components/dashboard/edit-team-member-form"
import { RolesList } from "@/components/dashboard/roles-list"
import { CreateRoleForm } from "@/components/dashboard/create-role-form"
import { EditRoleForm } from "@/components/dashboard/edit-role-form"
import { SendNotificationForm } from "@/components/dashboard/send-notification"
import { NotificationsList } from "@/components/dashboard/notifications-list"
import { useToast } from "@/components/ui/use-toast"
import { Shield, Users, Bell, BarChart, UserPlus } from "lucide-react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Button } from "@/components/ui/button"
import { TeamProfileEditor } from "@/components/dashboard/team-profile-editor"

export default function OwnerPanelPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  // Check URL parameters on load
  useEffect(() => {
    const tab = searchParams.get("tab")
    const editMemberId = searchParams.get("edit")
    const isNewMember = searchParams.get("new") === "true"
    const editRoleId = searchParams.get("editRole")
    const isNewRole = searchParams.get("newRole") === "true"

    if (tab) {
      setActiveTab(tab)
    }

    if (editMemberId) {
      setSelectedMemberId(editMemberId)
      setActiveTab("edit-member")
    } else if (isNewMember) {
      setActiveTab("create-member")
    } else if (editRoleId) {
      setSelectedRoleId(editRoleId)
      setActiveTab("edit-role")
    } else if (isNewRole) {
      setActiveTab("create-role")
    }
  }, [searchParams])

  // Redirect if not owner
  if (user?.role !== "owner") {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      variant: "destructive",
    })
    router.push("/dashboard")
    return null
  }

  const handleEditMember = (memberId: string) => {
    setSelectedMemberId(memberId)
    setActiveTab("edit-member")
    // Update URL without refreshing the page
    router.push(`/owner-panel?tab=edit-member&edit=${memberId}`, { scroll: false })
  }

  const handleCreateMemberSuccess = () => {
    toast({
      title: "Team Member Created",
      description: "The team member has been created successfully.",
    })
    setActiveTab("team-members")
    router.push("/owner-panel?tab=team-members", { scroll: false })
  }

  const handleUpdateMemberSuccess = () => {
    toast({
      title: "Team Member Updated",
      description: "The team member has been updated successfully.",
    })
    setActiveTab("team-members")
    router.push("/owner-panel?tab=team-members", { scroll: false })
  }

  const handleCancelEditMember = () => {
    setSelectedMemberId(null)
    setActiveTab("team-members")
    router.push("/owner-panel?tab=team-members", { scroll: false })
  }

  const handleCreateRole = () => {
    setActiveTab("create-role")
    router.push("/owner-panel?tab=create-role", { scroll: false })
  }

  const handleEditRole = (roleId: string) => {
    setSelectedRoleId(roleId)
    setActiveTab("edit-role")
    router.push(`/owner-panel?tab=edit-role&editRole=${roleId}`, { scroll: false })
  }

  const handleCreateRoleSuccess = () => {
    toast({
      title: "Role Created",
      description: "The role has been created successfully.",
    })
    setActiveTab("roles")
    router.push("/owner-panel?tab=roles", { scroll: false })
  }

  const handleUpdateRoleSuccess = () => {
    toast({
      title: "Role Updated",
      description: "The role has been updated successfully.",
    })
    setActiveTab("roles")
    router.push("/owner-panel?tab=roles", { scroll: false })
  }

  const handleCancelEditRole = () => {
    setSelectedRoleId(null)
    setActiveTab("roles")
    router.push("/owner-panel?tab=roles", { scroll: false })
  }

  const handleNotificationSent = () => {
    toast({
      title: "Notification Sent",
      description: "Your notification has been sent successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Owner Panel</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 sm:w-[600px]">
          <TabsTrigger value="dashboard" onClick={() => router.push("/owner-panel?tab=dashboard", { scroll: false })}>
            <BarChart className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="team-members"
            onClick={() => router.push("/owner-panel?tab=team-members", { scroll: false })}
          >
            <Users className="mr-2 h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger
            value="team-profiles"
            onClick={() => router.push("/owner-panel?tab=team-profiles", { scroll: false })}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Team Profiles
          </TabsTrigger>
          <TabsTrigger value="roles" onClick={() => router.push("/owner-panel?tab=roles", { scroll: false })}>
            <Shield className="mr-2 h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            onClick={() => router.push("/owner-panel?tab=notifications", { scroll: false })}
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Owner Dashboard</CardTitle>
              <CardDescription>Overview of your organization's key metrics and activities.</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardStats />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="team-members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your team members, their roles, and client access permissions.</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setActiveTab("create-member")
                  router.push("/owner-panel?tab=create-member", { scroll: false })
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Team Member
              </Button>
            </CardHeader>
            <CardContent>
              <TeamMembersList onEditMember={handleEditMember} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Profiles Tab */}
        <TabsContent value="team-profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Profiles</CardTitle>
              <CardDescription>
                Edit team member profiles including names, titles, bios, and avatars. Changes will be immediately
                reflected on the team page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamProfileEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-member" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Team Member</CardTitle>
              <CardDescription>Add a new team member to your organization and set their permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateTeamMemberForm onSuccess={handleCreateMemberSuccess} onCancel={handleCancelEditMember} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit-member" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Team Member</CardTitle>
              <CardDescription>Update team member details, role, and client access permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMemberId && (
                <EditTeamMemberForm
                  memberId={selectedMemberId}
                  onSuccess={handleUpdateMemberSuccess}
                  onCancel={handleCancelEditMember}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Create and manage custom roles with specific permissions that can be assigned to team members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolesList onCreateRole={handleCreateRole} onEditRole={handleEditRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-role" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
              <CardDescription>
                Define a new role with specific permissions that can be assigned to team members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateRoleForm onSuccess={handleCreateRoleSuccess} onCancel={handleCancelEditRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit-role" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Role</CardTitle>
              <CardDescription>Modify role details and permissions. System roles cannot be edited.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRoleId && (
                <EditRoleForm
                  roleId={selectedRoleId}
                  onSuccess={handleUpdateRoleSuccess}
                  onCancel={handleCancelEditRole}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Notifications</CardTitle>
              <CardDescription>
                Send notifications to team members, specific roles, or the entire organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SendNotificationForm onSuccess={handleNotificationSent} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>View and manage previously sent notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

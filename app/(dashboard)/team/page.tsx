"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useDisplayTitle } from "@/lib/display-title-context"
import { TeamMemberCard } from "@/components/dashboard/team-member-card"
import { RequestMeetingButton } from "@/components/dashboard/request-meeting-button"
import { loadData } from "@/lib/data-persistence"
import { TeamMemberCalendar } from "@/components/calendar/team-member-calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, Calendar, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getStrikeStatus } from "@/lib/strikes-system"
import { Switch } from "@/components/ui/switch"

export default function TeamPage() {
  const { users } = useAuth()
  const { getDisplayTitle } = useDisplayTitle()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedView, setSelectedView] = useState<"grid" | "calendar">("grid")
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [visibilityStates, setVisibilityStates] = useState<Record<string, boolean>>({})
  const [filterRole, setFilterRole] = useState<string | null>(null)

  // Load visibility states from local storage
  useEffect(() => {
    const savedStates = loadData("team-visibility-states", {})
    setVisibilityStates(savedStates)
  }, [])

  // Save visibility states to local storage
  const handleToggleVisibility = (userId: string) => {
    const newStates = {
      ...visibilityStates,
      [userId]: !visibilityStates[userId],
    }
    setVisibilityStates(newStates)
    loadData("team-visibility-states", newStates)
  }

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesRole = !filterRole || user.role === filterRole

      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      // Sort by role priority
      const getRolePriority = (role: string) => {
        if (role === "owner" || role === "president" || role === "ceo") return 1
        if (role.includes("manager") || role.includes("director") || role.includes("lead")) return 2
        return 3
      }

      const priorityA = getRolePriority(a.role)
      const priorityB = getRolePriority(b.role)

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // If same priority, sort alphabetically by name
      return a.name.localeCompare(b.name)
    })

  // Get unique roles for filtering
  const uniqueRoles = Array.from(new Set(users.map((user) => user.role)))

  // Get user category for styling
  const getUserCategory = (userRole: string): string => {
    if (userRole === "owner" || userRole === "president" || userRole === "ceo") {
      return "owner"
    }
    if (
      userRole === "manager" ||
      userRole === "youtube_manager" ||
      userRole.includes("manager") ||
      userRole.includes("director") ||
      userRole.includes("lead")
    ) {
      return "management"
    }
    return "creative"
  }

  // Get role color based on category
  const getRoleColor = (category: string): string => {
    switch (category) {
      case "owner":
        return "bg-purple-100 dark:bg-purple-950/40"
      case "management":
        return "bg-blue-100 dark:bg-blue-950/40"
      case "creative":
        return "bg-amber-100 dark:bg-amber-950/40"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  // Get role icon based on category
  const getRoleIcon = (category: string): string => {
    switch (category) {
      case "owner":
        return "👑"
      case "management":
        return "📊"
      case "creative":
        return "✨"
      default:
        return "🔹"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-[300px]"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[120px]">
                  <Filter className="mr-2 h-4 w-4" />
                  {filterRole ? "Filtered" : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setFilterRole(null)}>All Roles</DropdownMenuItem>
                {uniqueRoles.map((role) => (
                  <DropdownMenuItem key={role} onClick={() => setFilterRole(role)}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as "grid" | "calendar")}>
              <TabsList className="grid w-[160px] grid-cols-2">
                <TabsTrigger value="grid">
                  <Users className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <Tabs value={selectedView} className="space-y-4">
        <TabsContent value="grid" className="space-y-8">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">No team members found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user) => {
                const category = getUserCategory(user.role)
                const strikeStatus = getStrikeStatus(user.id)
                const showContactInfo = visibilityStates[user.id] || false
                return (
                  <TeamMemberCard
                    key={user.id}
                    user={user}
                    showContactInfo={showContactInfo}
                    onToggleVisibility={() => handleToggleVisibility(user.id)}
                    roleColor={getRoleColor(category)}
                    roleIcon={getRoleIcon(category)}
                    displayTitle={getDisplayTitle(user.id)}
                    actionButton={
                      <RequestMeetingButton
                        memberId={user.id}
                        disabled={strikeStatus.isCritical}
                        className="w-full"
                      />
                    }
                    contactInfo={
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {showContactInfo ? "Contact visible" : "Contact hidden"}
                        </span>
                        <Switch
                          checked={showContactInfo}
                          onCheckedChange={(checked) => {
                            handleToggleVisibility(user.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Toggle contact information visibility"
                          className="scale-75 data-[state=checked]:bg-primary/80"
                        />
                      </div>
                    }
                  />
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <div className="space-y-8">
            {selectedMember ? (
              <TeamMemberCalendar memberId={selectedMember} onBack={() => setSelectedMember(null)} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((user) => {
                  const category = getUserCategory(user.role)
                  const showContactInfo = visibilityStates[user.id] || false
                  return (
                    <TeamMemberCard
                      key={user.id}
                      user={user}
                      showContactInfo={showContactInfo}
                      onToggleVisibility={() => handleToggleVisibility(user.id)}
                      roleColor={getRoleColor(category)}
                      roleIcon={getRoleIcon(category)}
                      displayTitle={getDisplayTitle(user.id)}
                      actionButton={
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => setSelectedMember(user.id)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View Calendar
                        </Button>
                      }
                      contactInfo={
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {showContactInfo ? "Contact visible" : "Contact hidden"}
                          </span>
                          <Switch
                            checked={showContactInfo}
                            onCheckedChange={(checked) => {
                              handleToggleVisibility(user.id)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Toggle contact information visibility"
                            className="scale-75 data-[state=checked]:bg-primary/80"
                          />
                        </div>
                      }
                    />
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useDisplayTitle } from "@/lib/display-title-context"
import { TeamMemberCard } from "@/components/dashboard/team-member-card"
import { RequestMeetingButton } from "@/components/dashboard/request-meeting-button"
import { loadData, saveData } from "@/lib/data-persistence"
import { TeamMemberCalendar } from "@/components/calendar/team-member-calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, Calendar, Filter, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRoles } from "@/lib/roles-context"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

// Define role categories and their display order
const ROLE_CATEGORIES = {
  OWNER: "owner",
  MANAGEMENT: "management",
  CREATIVE: "creative",
}

// Category display configuration
const categoryConfig = {
  [ROLE_CATEGORIES.OWNER]: {
    title: "Owners",
    description: "Leadership team guiding the company vision and strategy",
    color: "bg-purple-100 dark:bg-purple-950/40",
    icon: "👑",
    priority: 1,
  },
  [ROLE_CATEGORIES.MANAGEMENT]: {
    title: "Management",
    description: "Team leaders overseeing projects and operations",
    color: "bg-blue-100 dark:bg-blue-950/40",
    icon: "📊",
    priority: 2,
  },
  [ROLE_CATEGORIES.CREATIVE]: {
    title: "Creatives",
    description: "Talented individuals bringing ideas to life",
    color: "bg-amber-100 dark:bg-amber-950/40",
    icon: "✨",
    priority: 3,
  },
}

export default function TeamPage() {
  const { users, user, refreshUsers } = useAuth()
  const { roles } = useRoles()
  const { getDisplayTitle, refreshTitles } = useDisplayTitle()
  const { toast } = useToast()
  const [visibilitySettings, setVisibilitySettings] = useState<Record<string, boolean>>({})
  const [selectedTab, setSelectedTab] = useState<"directory" | "calendar">("directory")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updateCounter, setUpdateCounter] = useState(0) // Used to force re-renders when needed
  const isOwner = user?.role === "owner"

  // Load visibility settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = loadData("teamVisibilitySettings", {})
    setVisibilitySettings(savedSettings)
  }, [])

  // Save visibility settings to localStorage when they change
  useEffect(() => {
    if (Object.keys(visibilitySettings).length > 0) {
      saveData("teamVisibilitySettings", visibilitySettings)
    }
  }, [visibilitySettings])

  const toggleVisibility = (userId: string) => {
    setVisibilitySettings((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  // Format role name for display (fallback if no custom title)
  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Determine the category for a user based on their role
  const getUserCategory = (userRole: string): string => {
    // Check for owner roles
    if (userRole === "owner" || userRole === "president" || userRole === "ceo") {
      return ROLE_CATEGORIES.OWNER
    }

    // Check for management roles
    if (
      userRole === "manager" ||
      userRole === "youtube_manager" ||
      userRole.includes("manager") ||
      userRole.includes("director") ||
      userRole.includes("lead")
    ) {
      return ROLE_CATEGORIES.MANAGEMENT
    }

    // All other roles are creative
    return ROLE_CATEGORIES.CREATIVE
  }

  // Filter users based on search query and category filter - memoized to prevent recalculation on every render
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      const userCategory = getUserCategory(user.role)
      const matchesCategory = filterCategory === null || userCategory === filterCategory

      return matchesSearch && matchesCategory
    })
  }, [users, searchQuery, filterCategory])

  // Group users by category - memoized to prevent recalculation on every render
  const usersByCategory = useMemo(() => {
    return filteredUsers.reduce(
      (groups, user) => {
        const category = getUserCategory(user.role)
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(user)
        return groups
      },
      {} as Record<string, typeof users>,
    )
  }, [filteredUsers])

  // Handle team member card click
  const handleTeamMemberClick = (userId: string) => {
    setSelectedUserId(userId)
    setSelectedTab("calendar")
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("")
    setFilterCategory(null)
  }

  // Refresh team data
  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshUsers()
    refreshTitles()
    setUpdateCounter((prev) => prev + 1) // Increment counter to force re-render

    // Show toast notification
    toast({
      title: "Team data refreshed",
      description: "The latest team information has been loaded.",
    })

    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 800)
  }

  // Get category display order - memoized to prevent recalculation on every render
  const categoryDisplayOrder = useMemo(() => {
    return Object.keys(ROLE_CATEGORIES)
      .map((key) => ROLE_CATEGORIES[key as keyof typeof ROLE_CATEGORIES])
      .filter((category) => usersByCategory[category] && usersByCategory[category].length > 0)
      .sort((a, b) => {
        return (categoryConfig[a].priority || 99) - (categoryConfig[b].priority || 99)
      })
  }, [usersByCategory])

  // Get role color based on category
  const getRoleColor = (category: string): string => {
    return categoryConfig[category]?.color || "bg-gray-100 dark:bg-gray-800"
  }

  // Get role icon based on category
  const getRoleIcon = (category: string): string => {
    return categoryConfig[category]?.icon || "🔹"
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Teams</h1>
        <p className="text-muted-foreground max-w-2xl">Manage and collaborate with your team members</p>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value as any)}
        className="w-full max-w-md mx-auto mb-8"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="directory" className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            <span>Directory</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Calendars</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsContent value="directory" className="mt-0">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{filterCategory ? categoryConfig[filterCategory].title : "Filter by category"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setFilterCategory(null)}>All Team Members</DropdownMenuItem>
                <Separator className="my-2" />
                {Object.values(ROLE_CATEGORIES).map((category) => (
                  <DropdownMenuItem key={category} onClick={() => setFilterCategory(category)}>
                    <span className="mr-2">{categoryConfig[category].icon}</span> {categoryConfig[category].title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 w-10"
              title="Refresh team data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            {(searchQuery || filterCategory) && (
              <Button variant="ghost" onClick={clearFilters} className="sm:w-auto">
                Clear filters
              </Button>
            )}
          </div>

          {/* Helper text for the new assignment feature */}
          <div className="text-center text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
            <p>Click the menu icon on any team member card to assign tasks or projects directly to that person.</p>
          </div>

          <ScrollArea className="pr-4">
            <div className="space-y-16 pb-8">
              {categoryDisplayOrder.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg max-w-md mx-auto">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No team members found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                categoryDisplayOrder.map((category) => {
                  const categoryInfo = categoryConfig[category]
                  const membersInCategory = usersByCategory[category] || []

                  return (
                    <div key={category} className="space-y-8">
                      <div className="flex flex-col items-center text-center">
                        <div className={`${categoryInfo.color} p-3 rounded-full mb-2`}>
                          <span className="text-2xl">{categoryInfo.icon}</span>
                        </div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          {categoryInfo.title}
                          <span className="text-sm bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                            {membersInCategory.length}
                          </span>
                        </h2>
                        <p className="text-muted-foreground max-w-lg mt-1">{categoryInfo.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                        {membersInCategory.map((user) => (
                          <TeamMemberCard
                            key={`${user.id}-${updateCounter}`} // Use updateCounter instead of Date.now()
                            user={{
                              ...user,
                              // Use the custom display title from the context
                              role: getDisplayTitle(user.id, formatRoleName(user.role)),
                            }}
                            showContactInfo={visibilitySettings[user.id] || false}
                            onToggleVisibility={() => toggleVisibility(user.id)}
                            roleColor={getRoleColor(category)}
                            roleIcon={getRoleIcon(category)}
                            actionButton={
                              <div className="flex justify-center mt-3">
                                {category === ROLE_CATEGORIES.OWNER ? (
                                  <RequestMeetingButton ownerId={user.id} ownerName={user.name} />
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTeamMemberClick(user.id)}
                                    className="w-full"
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Calendar
                                  </Button>
                                )}
                              </div>
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <TeamMemberCalendar initialUserId={selectedUserId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

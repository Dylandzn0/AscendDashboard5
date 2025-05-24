"use client"

import React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Import the data persistence utility
import { loadData, saveData } from "@/lib/data-persistence"
import { generateId } from "@/lib/uuid"
import { useRoles } from "./roles-context"

// Define user roles
export type UserRole = string

// Define client access type
export type ClientAccess = {
  clientId: string
  canView: boolean
  canEdit: boolean
  canInvoice: boolean
}

// Define custom link type
export type CustomLink = {
  title: string
  url: string
}

// Define social media links type
export type SocialMediaLinks = {
  facebook?: string
  twitter?: string
  linkedin?: string
  instagram?: string
  youtube?: string
  customLinks?: CustomLink[]
}

// Define user type
export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  bio?: string
  clientAccess: ClientAccess[]
  socialMedia?: SocialMediaLinks
}

// Define auth context type
type AuthContextType = {
  user: User | null
  users: User[]
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  hasClientAccess: (clientId: string, permission: "view" | "edit" | "invoice" | "revenue") => boolean
  hasPermission: (permissionId: string) => boolean
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>
  updateProfile: (userId: string, updates: Partial<User>) => Promise<boolean>
  createUser: (userData: Omit<User, "id"> & { password: string }) => Promise<User>
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  getAvailableClients: () => { id: string; name: string }[]
  refreshUsers: () => void
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data - in a real app, this would come from a database
let USERS = [
  // Verify the owner account is correctly set up
  // Make sure this entry in the USERS array has the correct email and role:
  {
    id: "1",
    name: "Dylan",
    email: "dylandzn00@gmail.com",
    password: "DylanDZNTest", // In a real app, this would be hashed
    role: "owner",
    bio: "Founder and CEO of Ascend Media. Passionate about helping creators grow their online presence and build sustainable businesses through strategic content creation and distribution.",
    avatar: "/abstract-geometric-shapes.png",
    clientAccess: [
      { clientId: "capri", canView: true, canEdit: true, canInvoice: true },
      { clientId: "piper-rockelle", canView: true, canEdit: true, canInvoice: true },
      { clientId: "paryeet", canView: true, canEdit: true, canInvoice: true },
      { clientId: "lacy-vods", canView: true, canEdit: true, canInvoice: true },
    ],
    socialMedia: {
      facebook: "https://facebook.com/ascendmedia",
      twitter: "https://twitter.com/ascendmedia",
      linkedin: "https://linkedin.com/company/ascendmedia",
      instagram: "https://instagram.com/ascendmedia",
      youtube: "https://youtube.com/ascendmedia",
      customLinks: [
        { title: "Portfolio", url: "https://ascendmedia.com/portfolio" },
        { title: "Blog", url: "https://ascendmedia.com/blog" },
      ],
    },
  },
  {
    id: "2",
    name: "Sarah Miller",
    email: "sarah@ascendmedia.com",
    password: "password123",
    role: "designer",
    bio: "Creative designer with over 8 years of experience in digital media. Specializing in thumbnail design, channel branding, and visual storytelling that drives engagement.",
    avatar: "/abstract-geometric-shapes.png",
    clientAccess: [
      { clientId: "capri", canView: true, canEdit: true, canInvoice: true },
      { clientId: "piper-rockelle", canView: true, canEdit: false, canInvoice: false },
    ],
    socialMedia: {
      facebook: "https://facebook.com/sarahmiller",
      instagram: "https://instagram.com/sarahmiller",
      linkedin: "https://linkedin.com/in/sarahmiller",
      customLinks: [{ title: "Design Portfolio", url: "https://sarahmiller.design" }],
    },
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike@ascendmedia.com",
    password: "password123",
    role: "editor",
    bio: "Video editing professional with expertise in pacing, storytelling, and creating engaging content. Previously worked with major YouTube creators and brings a keen eye for detail to every project.",
    avatar: "/diverse-group-collaborating.png",
    clientAccess: [
      { clientId: "paryeet", canView: true, canEdit: true, canInvoice: true },
      { clientId: "lacy-vods", canView: true, canEdit: true, canInvoice: false },
    ],
    socialMedia: {
      twitter: "https://twitter.com/mikewilson",
      linkedin: "https://linkedin.com/in/mikewilson",
      youtube: "https://youtube.com/mikewilson",
    },
  },
  {
    id: "4",
    name: "Emily Chen",
    email: "emily@ascendmedia.com",
    password: "password123",
    role: "youtube_manager",
    bio: "Content strategy expert focused on channel growth, audience development, and content optimization. Helped multiple channels grow from zero to millions of subscribers through data-driven approaches.",
    avatar: "/abstract-geometric-shapes.png",
    clientAccess: [{ clientId: "piper-rockelle", canView: true, canEdit: true, canInvoice: true }],
    socialMedia: {
      youtube: "https://youtube.com/emilychen",
      instagram: "https://instagram.com/emilychen",
      twitter: "https://twitter.com/emilychen",
      customLinks: [{ title: "Content Tips", url: "https://emilychen.com/content-tips" }],
    },
  },
  {
    id: "5",
    name: "Capri Team Member",
    email: "capri@ascendmedia.com",
    password: "capri123",
    role: "creative",
    bio: "Dedicated team member working exclusively with Capri's channel. Handles day-to-day operations, community management, and content scheduling to ensure consistent growth.",
    avatar: "/abstract-geometric-shapes.png",
    clientAccess: [{ clientId: "capri", canView: true, canEdit: true, canInvoice: true }],
    socialMedia: {
      instagram: "https://instagram.com/capri_team",
    },
  },
]

// Try to load saved users from localStorage
const savedUsers = loadData("users", null)
// Check if savedUsers is an array before using array methods
if (savedUsers && Array.isArray(savedUsers) && savedUsers.length > 0) {
  // We need to merge the passwords from USERS with the saved users
  USERS = savedUsers.map((savedUser: User) => {
    const originalUser = USERS.find((u) => u.id === savedUser.id)
    return originalUser ? { ...savedUser, password: originalUser.password } : savedUser
  })
} else {
  // If no saved users or not an array, save the default users
  saveData("users", USERS)
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { roles, getRole } = useRoles()
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(USERS)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = loadData("user", null)
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  // Refresh users from localStorage
  const refreshUsers = () => {
    const refreshedUsers = loadData("users", USERS)
    if (refreshedUsers && Array.isArray(refreshedUsers)) {
      setUsers(refreshedUsers)
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // Find user with matching email and password
    const matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

    if (matchedUser) {
      // Create user object without password
      const { password: _, ...userWithoutPassword } = matchedUser
      setUser(userWithoutPassword)
      saveData("user", userWithoutPassword)
      return true
    }

    return false
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Check if user has access to a client
  const hasClientAccess = (clientId: string, permission: "view" | "edit" | "invoice" | "revenue") => {
    if (!user) return false

    // Owner has access to everything
    if (user.role === "owner") return true

    // Check specific client access
    const clientAccess = user.clientAccess.find((access) => access.clientId === clientId)
    if (!clientAccess) return false

    // Special case for revenue - only owners and specific roles can see it
    if (permission === "revenue") {
      return user.role === "owner" || user.role === "designer" || user.role === "editor"
    }

    switch (permission) {
      case "view":
        return clientAccess.canView
      case "edit":
        return clientAccess.canEdit
      case "invoice":
        return clientAccess.canInvoice
      default:
        return false
    }
  }

  // Check if user has a specific permission
  const hasPermission = (permissionId: string) => {
    if (!user) return false

    // Get the user's role
    const userRole = getRole(user.role)

    // If role not found, deny access
    if (!userRole) return false

    // Find the permission in the role
    const permission = userRole.permissions.find((p) => p.id === permissionId)

    // If permission not found or not enabled, deny access
    if (!permission || !permission.enabled) return false

    return true
  }

  // Password change function
  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    // Find user with matching ID and password
    const userIndex = users.findIndex((u) => u.id === userId && u.password === currentPassword)

    if (userIndex !== -1) {
      // Update the password in our mock database
      const updatedUsers = [...users]
      updatedUsers[userIndex].password = newPassword
      setUsers(updatedUsers)
      saveData("users", updatedUsers)

      // If this is the currently logged in user, update the stored user
      // (but don't include the password in what we store in state/localStorage)
      if (user && user.id === userId) {
        const { password: _, ...userWithoutPassword } = updatedUsers[userIndex]
        setUser(userWithoutPassword)
        saveData("user", userWithoutPassword)
      }

      return true
    }

    return false
  }

  // Update profile function
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    // Find user with matching ID
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      // Update the user in our mock database
      const updatedUsers = [...users]
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        ...updates,
      }
      setUsers(updatedUsers)
      saveData("users", updatedUsers)

      // If this is the currently logged in user, update the stored user
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          ...updates,
        }
        setUser(updatedUser)
        saveData("user", updatedUser)
      }

      return true
    }

    return false
  }

  // Create user function
  const createUser = async (userData: Omit<User, "id"> & { password: string }): Promise<User> => {
    const newUser = {
      id: generateId(),
      ...userData,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    saveData("users", updatedUsers)

    // Return the user without the password
    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  // Update user function
  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      // Find user with matching ID
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex !== -1) {
        // Create a deep copy of the users array
        const updatedUsers = JSON.parse(JSON.stringify(users))

        // Update the user with the new data
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          ...updates,
        }

        // Special handling for nested objects like socialMedia
        if (updates.socialMedia) {
          updatedUsers[userIndex].socialMedia = {
            ...(updatedUsers[userIndex].socialMedia || {}),
            ...updates.socialMedia,
          }
        }

        // Update state
        setUsers(updatedUsers)

        // Save to localStorage
        saveData("users", updatedUsers)

        // If this is the currently logged in user, update the stored user
        if (user && user.id === userId) {
          const updatedUser = {
            ...user,
            ...updates,
          }

          // Special handling for nested objects like socialMedia
          if (updates.socialMedia) {
            updatedUser.socialMedia = {
              ...(user.socialMedia || {}),
              ...updates.socialMedia,
            }
          }

          setUser(updatedUser)
          saveData("user", updatedUser)
        }

        return true
      }
      return false
    } catch (error) {
      console.error("Error updating user:", error)
      return false
    }
  }

  // Delete user function
  const deleteUser = async (userId: string): Promise<boolean> => {
    // Cannot delete the owner account
    const userToDelete = users.find((u) => u.id === userId)
    if (userToDelete?.role === "owner") {
      return false
    }

    // Cannot delete yourself
    if (user?.id === userId) {
      return false
    }

    const updatedUsers = users.filter((u) => u.id !== userId)
    setUsers(updatedUsers)
    saveData("users", updatedUsers)
    return true
  }

  // Get available clients
  const getAvailableClients = () => {
    return [
      { id: "capri", name: "Capri" },
      { id: "piper-rockelle", name: "Piper Rockelle" },
      { id: "paryeet", name: "Paryeet" },
      { id: "lacy-vods", name: "Lacy VODS" },
    ]
  }

  const contextValue = React.useMemo<AuthContextType>(
    () => ({
      user,
      users,
      login,
      logout,
      isLoading,
      hasClientAccess,
      hasPermission,
      changePassword,
      updateProfile,
      createUser,
      updateUser,
      deleteUser,
      getAvailableClients,
      refreshUsers,
    }),
    [user, users, isLoading, roles],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

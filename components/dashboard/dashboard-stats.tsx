"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { DollarSign, Users, FileText, ArrowUpRight, AlertTriangle, Briefcase, AlertCircle } from "lucide-react"
import { loadData } from "@/lib/data-persistence"
import { getActiveStrikes, type Strike } from "@/lib/strikes-system"

type SimpleInvoice = {
  id: string
  name: string
  clientId: string
  clientName: string
  date: Date
  total: number
  status: string
  createdBy: string
  createdByName: string
}

type SimpleClient = {
  id: string
  name: string
  revenue: number
}

export function DashboardStats() {
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalInvoicesAmount, setTotalInvoicesAmount] = useState(0)
  const [teamMembersCount, setTeamMembersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Explicitly check if the user is the owner by email
  const isOwner = user?.email === "dylandzn00@gmail.com" || user?.role === "owner"

  // Load data
  const users = loadData("users", [])
  const clients = loadData("clients", {})
  const strikes = loadData("strikes", []) as Strike[]

  // Calculate strike statistics
  const activeStrikes = users.reduce((acc, user) => {
    const userActiveStrikes = getActiveStrikes(user.id)
    return acc + userActiveStrikes.length
  }, 0)

  const criticalMembers = users.filter(user => {
    const userActiveStrikes = getActiveStrikes(user.id)
    return userActiveStrikes.length >= 3
  }).length

  const atRiskMembers = users.filter(user => {
    const userActiveStrikes = getActiveStrikes(user.id)
    return userActiveStrikes.length === 2
  }).length

  useEffect(() => {
    const loadStats = () => {
      try {
        // Load clients data
        const allClients = loadData<SimpleClient[]>("clients", [])
        const allInvoices = loadData<SimpleInvoice[]>("invoices", [])
        const allTeamMembers = loadData<any[]>("team-members", [])

        if (!Array.isArray(allClients) || !Array.isArray(allInvoices)) {
          console.error("Expected arrays for clients and invoices")
          return
        }

        // Calculate total revenue from all clients
        const revenue = allClients.reduce((sum, client) => sum + (client.revenue || 0), 0)
        setTotalRevenue(revenue)

        // Calculate total invoices amount
        const invoicesTotal = allInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
        setTotalInvoicesAmount(invoicesTotal)

        // Set team members count
        setTeamMembersCount(Array.isArray(allTeamMembers) ? allTeamMembers.length : 0)

      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()

    // Listen for storage events to refresh the stats
    const handleStorageChange = () => {
      loadStats()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [user, isOwner])

  // Calculate profit
  const totalProfit = totalRevenue - totalInvoicesAmount

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Total revenue across all clients
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalInvoicesAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Total amount from all invoices
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalProfit.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Revenue minus invoices</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamMembersCount}</div>
          <p className="text-xs text-muted-foreground">Total team members</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
              <h3 className="text-2xl font-bold">{Object.keys(clients).length}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Strikes</p>
              <h3 className="text-2xl font-bold">{activeStrikes}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {atRiskMembers} at risk
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Status</p>
              <h3 className="text-2xl font-bold">{criticalMembers}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Members under review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

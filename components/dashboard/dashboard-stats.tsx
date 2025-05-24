"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { DollarSign, Users, FileText, ArrowUpRight } from "lucide-react"
import { loadData } from "@/lib/data-persistence"

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

export function DashboardStats() {
  const [pendingInvoices, setPendingInvoices] = useState<SimpleInvoice[]>([])
  const [pendingAmount, setPendingAmount] = useState(0)
  const [clientCount, setClientCount] = useState(0)
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Explicitly check if the user is the owner by email
  const isOwner = user?.email === "dylandzn00@gmail.com" || user?.role === "owner"

  useEffect(() => {
    const loadInvoices = () => {
      try {
        const allInvoices = loadData<SimpleInvoice[]>("invoices", [])

        if (!Array.isArray(allInvoices)) {
          console.error("Expected allInvoices to be an array, got:", typeof allInvoices)
          setPendingInvoices([])
          setPendingAmount(0)
          setInvoiceCount(0)
          return
        }

        let filteredInvoices = [...allInvoices]

        // For non-owners, only show their own invoices
        if (!isOwner) {
          filteredInvoices = filteredInvoices.filter((invoice) => invoice.createdBy === user?.id)
        }

        // Get pending invoices
        const pending = filteredInvoices.filter((invoice) => invoice.status === "pending")
        setPendingInvoices(pending)

        // Calculate total pending amount
        const total = pending.reduce((sum, invoice) => sum + invoice.total, 0)
        setPendingAmount(total)

        // Count total invoices
        setInvoiceCount(filteredInvoices.length)

        // Count unique clients
        const uniqueClients = new Set(filteredInvoices.map((invoice) => invoice.clientId))
        setClientCount(uniqueClients.size)
      } catch (error) {
        console.error("Error loading invoices:", error)
        setPendingInvoices([])
        setPendingAmount(0)
        setInvoiceCount(0)
      } finally {
        setLoading(false)
      }
    }

    loadInvoices()

    // Listen for storage events to refresh the stats
    const handleStorageChange = () => {
      loadInvoices()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [user, isOwner])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {pendingInvoices.length} pending {pendingInvoices.length === 1 ? "invoice" : "invoices"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{invoiceCount}</div>
          <p className="text-xs text-muted-foreground">
            {isOwner ? "Total invoices created" : "Invoices you've created"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientCount}</div>
          <p className="text-xs text-muted-foreground">{isOwner ? "Total active clients" : "Clients you work with"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">{isOwner ? "Across all clients" : "Assigned to you"}</p>
        </CardContent>
      </Card>
    </div>
  )
}

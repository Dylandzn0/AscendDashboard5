"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { OrgHierarchyProvider } from "@/lib/org-hierarchy-context"
import { RolesProvider } from "@/lib/roles-context"
import { NotificationProvider } from "@/lib/notification-context"
import { DisplayTitleProvider } from "@/lib/display-title-context"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RolesProvider>
        <DisplayTitleProvider>
          <AuthProvider>
            <OrgHierarchyProvider>
              <NotificationProvider>
                {children}
                <Toaster />
              </NotificationProvider>
            </OrgHierarchyProvider>
          </AuthProvider>
        </DisplayTitleProvider>
      </RolesProvider>
    </ThemeProvider>
  )
}

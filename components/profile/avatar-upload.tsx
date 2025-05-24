"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { getInitials } from "@/lib/utils"

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
}: {
  currentAvatar: string
  onAvatarChange: (url: string) => void
}) {
  const [isHovering, setIsHovering] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload the file to a storage service
    // For this demo, we'll use a placeholder URL based on the file name
    const placeholderUrl = `/placeholder.svg?height=200&width=200&query=profile picture of ${file.name}`
    onAvatarChange(placeholderUrl)
  }

  return (
    <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentAvatar || "/placeholder.svg"} alt="Profile picture" />
        <AvatarFallback className="text-lg">{getInitials("User Name")}</AvatarFallback>
      </Avatar>

      <label
        htmlFor="avatar-upload"
        className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white transition-opacity cursor-pointer ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <Camera className="h-6 w-6" />
        <span className="sr-only">Upload new avatar</span>
      </label>

      <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
    </div>
  )
}

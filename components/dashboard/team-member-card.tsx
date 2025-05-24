"use client"

import type { User } from "@/lib/auth-context"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Briefcase,
  ChevronDown,
  ChevronUp,
  LinkIcon,
} from "lucide-react"
import { useState, type ReactNode, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { TeamActionDropdown } from "@/components/dashboard/team-action-dropdown"

interface TeamMemberCardProps {
  user: User
  showContactInfo: boolean
  onToggleVisibility: () => void
  actionButton?: ReactNode
  roleColor?: string
  roleIcon?: string
}

export function TeamMemberCard({
  user,
  showContactInfo,
  onToggleVisibility,
  actionButton,
  roleColor = "bg-primary-100 dark:bg-primary-900/40",
  roleIcon = "",
}: TeamMemberCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showFullBio, setShowFullBio] = useState(false)
  const [key, setKey] = useState(Date.now())

  // Reset component state when user changes
  useEffect(() => {
    setKey(Date.now())
    setImageError(false)
    setShowFullBio(false)
  }, [user.id, user.avatar, user.bio])

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Format role for display
  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Function to render social media links
  const renderSocialMediaLinks = () => {
    if (!user.socialMedia) return null

    const socialLinks = []

    // Add standard social media links
    if (user.socialMedia.facebook) {
      socialLinks.push(
        <TooltipProvider key="facebook">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={user.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background rounded-full p-2 transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                aria-label={`${user.name}'s Facebook profile`}
              >
                <Facebook className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Facebook</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    if (user.socialMedia.twitter) {
      socialLinks.push(
        <TooltipProvider key="twitter">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={user.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background rounded-full p-2 transition-all hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-950/30 dark:hover:text-sky-400"
                aria-label={`${user.name}'s Twitter profile`}
              >
                <Twitter className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Twitter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    if (user.socialMedia.linkedin) {
      socialLinks.push(
        <TooltipProvider key="linkedin">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={user.socialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background rounded-full p-2 transition-all hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                aria-label={`${user.name}'s LinkedIn profile`}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>LinkedIn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    if (user.socialMedia.instagram) {
      socialLinks.push(
        <TooltipProvider key="instagram">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={user.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background rounded-full p-2 transition-all hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-950/30 dark:hover:text-pink-400"
                aria-label={`${user.name}'s Instagram profile`}
              >
                <Instagram className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Instagram</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    if (user.socialMedia.youtube) {
      socialLinks.push(
        <TooltipProvider key="youtube">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={user.socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background rounded-full p-2 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                aria-label={`${user.name}'s YouTube channel`}
              >
                <Youtube className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>YouTube</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    // Add custom links
    if (user.socialMedia.customLinks && user.socialMedia.customLinks.length > 0) {
      user.socialMedia.customLinks.forEach((customLink, index) => {
        if (customLink.title && customLink.url) {
          socialLinks.push(
            <TooltipProvider key={`custom-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={customLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-background rounded-full p-2 transition-all hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30 dark:hover:text-purple-400"
                    aria-label={customLink.title}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{customLink.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>,
          )
        }
      })
    }

    return socialLinks.length > 0 ? <div className="flex flex-wrap justify-center gap-1 mt-3">{socialLinks}</div> : null
  }

  // Function to render the "View all profiles" button
  const renderViewAllProfilesButton = () => {
    if (!user.socialMedia) return null

    const hasSocialLinks =
      user.socialMedia.facebook ||
      user.socialMedia.twitter ||
      user.socialMedia.linkedin ||
      user.socialMedia.instagram ||
      user.socialMedia.youtube ||
      (user.socialMedia.customLinks && user.socialMedia.customLinks.length > 0)

    if (!hasSocialLinks) return null

    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-xs mt-2 h-7 px-2 text-muted-foreground hover:text-foreground"
        onClick={onToggleVisibility}
      >
        {showContactInfo ? (
          <>
            Hide contact info <ChevronUp className="ml-1 h-3 w-3" />
          </>
        ) : (
          <>
            Show contact info <ChevronDown className="ml-1 h-3 w-3" />
          </>
        )}
      </Button>
    )
  }

  // Get client names
  const getClientNames = () => {
    if (!user.clientAccess || user.clientAccess.length === 0) return null

    return user.clientAccess
      .map((access) => access.clientId.charAt(0).toUpperCase() + access.clientId.slice(1).replace(/-/g, " "))
      .join(", ")
  }

  // Truncate bio if it's too long
  const renderBio = () => {
    if (!user.bio) return null

    const isBioLong = user.bio.length > 120

    return (
      <div className="mt-3 pt-3 border-t border-border/50 text-center">
        <p className="text-sm text-muted-foreground">
          {showFullBio || !isBioLong ? user.bio : `${user.bio.substring(0, 120)}...`}
        </p>
        {isBioLong && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-6 text-xs px-2 py-0 flex items-center mx-auto"
            onClick={() => setShowFullBio(!showFullBio)}
          >
            {showFullBio ? (
              <>
                Show less <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>
    )
  }

  // Check if user has any social media links
  const hasSocialMedia = () => {
    if (!user.socialMedia) return false

    return (
      !!user.socialMedia.facebook ||
      !!user.socialMedia.twitter ||
      !!user.socialMedia.linkedin ||
      !!user.socialMedia.instagram ||
      !!user.socialMedia.youtube ||
      (user.socialMedia.customLinks && user.socialMedia.customLinks.length > 0)
    )
  }

  return (
    <Card
      key={key}
      className="overflow-hidden transition-all hover:shadow-md border-border/50 h-full flex flex-col w-full max-w-xs"
    >
      <div className="flex flex-col items-center p-6 pb-4">
        <div className="relative">
          <Avatar className="h-20 w-20 mb-4">
            {user.avatar && !imageError ? (
              <AvatarImage
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                onError={() => setImageError(true)}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            )}
          </Avatar>
          <div className="absolute -top-2 -right-2">
            <TeamActionDropdown teamMember={user} />
          </div>
        </div>
        <h3 className="font-medium text-lg text-center">{user.name}</h3>
        <p className="text-sm text-muted-foreground text-center">{user.role}</p>
      </div>

      <CardContent className="px-6 pb-4 pt-0 flex-grow text-center">
        {user.clientAccess && user.clientAccess.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-xs mb-3">
            <Briefcase className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{getClientNames()}</span>
          </div>
        )}

        {showContactInfo && (
          <div className="flex items-center justify-center gap-1.5 text-xs mb-3">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <a href={`mailto:${user.email}`} className="text-primary hover:underline">
              {user.email}
            </a>
          </div>
        )}

        {/* Bio display */}
        {renderBio()}

        {/* Always show social media links section if they exist */}
        {hasSocialMedia() && (
          <div className="mt-4">
            {!showContactInfo && (
              <div className="text-xs text-muted-foreground mb-2">Connect with {user.name.split(" ")[0]}</div>
            )}
            {renderSocialMediaLinks()}
            {renderViewAllProfilesButton()}
          </div>
        )}

        {actionButton && <div className="mt-4">{actionButton}</div>}
      </CardContent>

      <CardFooter className="bg-muted/30 px-6 py-3 border-t border-border/30 mt-auto flex justify-center">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {showContactInfo ? "Contact visible" : "Contact hidden"}
          </span>
          <Switch
            checked={showContactInfo}
            onCheckedChange={onToggleVisibility}
            aria-label="Toggle contact information visibility"
            className="scale-75 data-[state=checked]:bg-primary/80"
          />
        </div>
      </CardFooter>
    </Card>
  )
}

"use client"

import { useEffect, useState, useTransition } from "react"
import { getUser, logoutAction } from "@/modules/auth/auth-session"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar"
import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, BellIcon, LogOutIcon } from "lucide-react"

export function NavUser({
  user: initialUser,
}: {
  user?: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<{
    name: string
    email: string
    avatar: string
  }>(initialUser || {
    name: "Loading...",
    email: "loading...",
    avatar: "",
  })
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function fetchUser() {
      try {
        const u = await getUser()
        if (u) {
          setUser({
            name: u.name,
            email: u.email,
            avatar: u.image || "",
          })
        }
      } catch (error) {
        console.error("Failed to fetch user with Server Action:", error)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction()
      } catch (error) {
        console.error("Logout error:", error)
      }
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem 
              disabled={isPending} 
              onClick={handleLogout} 
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOutIcon />
              {isPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

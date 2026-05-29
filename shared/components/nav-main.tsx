"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import Link from "next/link"

export interface NavGroup {
  label: string
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}

export function NavMain({
  groups,
}: {
  groups: NavGroup[]
}) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <SidebarGroup key={group.label} className="py-0">
          <SidebarGroupLabel className="px-3 font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1.5">
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <Link href={item.url}>
                      {item.icon}
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  )
}

"use client"

import * as React from "react"

import { NavMain, type NavGroup } from "@/shared/components/nav-main"
import { NavUser } from "@/shared/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  AppleIcon,
  TagIcon,
  UsersIcon,
  MapPinIcon,
  ShoppingCartIcon,
  FileTextIcon,
  SettingsIcon,
  StoreIcon
} from "lucide-react"

const data = {
  user: {
    name: "Admin Golden Buah",
    email: "admin@goldenbuah.com",
    avatar: "/avatars/admin.jpg",
  },
  // Main admin sections grouped by Master Data, Transaksi, and Laporan
  sidebarGroups: [
    {
      label: "Utama",
      items: [
        {
          title: "Dashboard Admin",
          url: "/admin/dashboard",
          icon: <LayoutDashboardIcon className="text-blue-500" />,
        }
      ]
    },
    {
      label: "Master Data",
      items: [
        {
          title: "Katalog Buah",
          url: "/admin/dashboard/products",
          icon: <AppleIcon className="text-emerald-500" />,
        },
        {
          title: "Kategori Buah",
          url: "/admin/dashboard/categories",
          icon: <TagIcon className="text-amber-500" />,
        },
        {
          title: "Pelanggan Terdaftar",
          url: "#",
          icon: <UsersIcon className="text-indigo-500" />,
        },
        {
          title: "Alamat Pengiriman",
          url: "#",
          icon: <MapPinIcon className="text-rose-500" />,
        },
      ],
    },
    {
      label: "Transaksi",
      items: [
        {
          title: "Daftar Pesanan",
          url: "#",
          icon: <ShoppingCartIcon className="text-cyan-500" />,
        },
      ],
    },
    {
      label: "Laporan",
      items: [
        {
          title: "Laporan Penjualan",
          url: "#",
          icon: <FileTextIcon className="text-orange-500" />,
        },
      ],
    }
  ] as NavGroup[],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <StoreIcon className="size-5! text-emerald-600" />
                <span className="text-base font-semibold text-emerald-800 dark:text-emerald-400">Toko Golden Buah</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavMain groups={data.sidebarGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

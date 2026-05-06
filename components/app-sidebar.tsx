"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  PackageIcon,
  TagsIcon,
  MapPinIcon,
  SettingsIcon,
  FileTextIcon,
  CommandIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin Diskominsa",
    email: "admin@acehprov.go.id",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Manajemen Aset",
      url: "/dashboard/assets",
      icon: <PackageIcon />,
    },
    {
      title: "Kategori",
      url: "/dashboard/categories",
      icon: <TagsIcon />,
    },
    {
      title: "Lokasi",
      url: "/dashboard/locations",
      icon: <MapPinIcon />,
    },
    {
      title: "Parameter Fuzzy",
      url: "/dashboard/fuzzy-settings",
      icon: <SettingsIcon />,
    },
    {
      title: "Laporan",
      url: "/dashboard/reports",
      icon: <FileTextIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">ASINSA</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

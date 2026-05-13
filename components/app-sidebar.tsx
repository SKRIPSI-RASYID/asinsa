"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  PackageIcon,
  TagsIcon,
  SettingsIcon,
  FileTextIcon,
  CommandIcon,
  ZapIcon,
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
  ],
  navInventory: [
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
  ],
  navFuzzy: [
    {
      title: "Evaluasi Kelayakan",
      url: "/dashboard/evaluation",
      icon: <ZapIcon />,
    },
    {
      title: "Riwayat Evaluasi",
      url: "/dashboard/evaluation/history",
      icon: <FileTextIcon />,
    },
    {
      title: "Parameter Fuzzy",
      url: "/dashboard/fuzzy-settings",
      icon: <SettingsIcon />,
    },
  ],
  navReports: [
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CommandIcon className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-base">ASINSA</span>
                  <span className="truncate text-xs opacity-70">Aset Diskominsa</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain label="Inventaris" items={data.navInventory} />
        <NavMain label="Analisis" items={data.navFuzzy} />
        <NavMain label="Sistem" items={data.navReports} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

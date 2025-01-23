"use client";

import * as React from "react";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenuButton, SidebarRail } from "@/components/ui/sidebar";
import { NavBoards } from "@/components/nav-boards";
import { ChevronDown } from "lucide-react";
import { Command } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex w-fit items-center gap-2 px-2.5 h-12">
          <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Command className="size-3" />
          </div>
          <span className="truncate font-semibold">Cuadratic</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavBoards />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

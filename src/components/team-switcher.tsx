"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { useRouter } from "next/router";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar(); 
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem> 
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <img
              src="/inspector-general.webp"
              alt="" 
              className="rounded-md"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              Inspector General
            </span>
            <span className="truncate text-xs">Free Plan</span>
          </div> 
        </SidebarMenuButton> 
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

"use client";

import * as React from "react"; 
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem, 
} from "~/components/ui/sidebar";
import { useRouter } from "next/router";

export function TeamSwitcher() { 
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem> 
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
            <img
              src="/inspector-general.png"
              alt="" 
              className="rounded-md"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              Inspector General
            </span>
            <span className="truncate text-xs">Powered by NZQR</span>
          </div> 
        </SidebarMenuButton> 
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

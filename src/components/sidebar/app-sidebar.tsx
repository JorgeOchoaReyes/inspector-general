"use client";

import * as React from "react";
import {  
  BookAIcon,
  BookOpen, 
  GithubIcon,
  GitPullRequest, 
  HomeIcon, 
  Settings2, 
} from "lucide-react";

import { NavMain } from "~/components/sidebar/nav-main"; 
import { NavUser } from "~/components/sidebar/nav-user";
import { TeamSwitcher } from "~/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { ModeToggle } from "./theme-changer";
import { useRouter } from "next/router"; 
import { useSession } from "next-auth/react";

const data = { 
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: HomeIcon,
      isActive: false, 
    },
    {
      title: "Repositories",
      url: "/dashboard/repositories",
      icon: BookAIcon,
      isActive: false,
      items: [
        {
          title: "All Repositories",
          url: "/dashboard/repositories",
        },
        {
          title: "Starred",
          url: "/dashboard/repositories?filter=starred",
        }, 
      ],
    },
    {
      title: "Pull Request",
      url: "/dashboard/pull-requests",
      icon: GitPullRequest,
      items: [
        {
          title: "Recent",
          url: "/dashboard/pull-requests?filter=recent",
        },
        {
          title: "All Pull Requests",
          url: "/dashboard/pull-requests?filter=all",
        },
        {
          title: "Starred",
          url: "/dashboard/pull-requests?filter=starred",
        },
      ],
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: GitPullRequest,
      items: [
        {
          title: "Red Horse Team Chat",
          url: "/dashboard/pull-requests?filter=recent",
        }, 
      ],
    },
    {
      title: "GitHub",
      url: "/dashboard/github",
      icon: GithubIcon, 
      items: [
        {
          title: "Synced Repositories",
          url: "/dashboard/github/repositories",
        },
        {
          title: "Authentication",
          url: "/dashboard/github",
        }, 
      ],
    },
    {
      title: "Help",
      url: "/dashboard/help",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "/dashboard/help?section=introduction",
        },
        {
          title: "Get Started",
          url: "/dashboard/help?section=get-started",
        },
        {
          title: "Tutorials",
          url: "/dashboard/help?section=tutorials",
        },
        {
          title: "Changelog",
          url: "/dashboard/help?section=changelog",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/settings?tab=general",
        },
        {
          title: "Team",
          url: "/dashboard/settings?tab=team",
        },
        {
          title: "Billing",
          url: "/dashboard/settings?tab=billing",
        },
        {
          title: "Usage",
          url: "/dashboard/settings?tab=usage",
        },
      ],
    },
  ],  
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter(); 
  const pathName = router.pathname; 
  const nav = data.navMain.map((n) => {
    n.isActive = pathName.includes(n.url);
    return n;
  });

  const { data: userData } = useSession();

  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader>
        <TeamSwitcher  />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={nav} />  
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={
          data ? {
            name: userData?.user.name ?? "",
            email: userData?.user.email ?? "",
            avatar: userData?.user.image ?? "",
          } : {
            name: "Guest",
            email: "",
            avatar: "",
          }
        } />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

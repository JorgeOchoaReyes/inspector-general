"use client";

import * as React from "react";
import { 
  BookA,
  BookAIcon,
  BookOpen, 
  GithubIcon,
  GitPullRequest, 
  Settings2, 
} from "lucide-react";

import { NavMain } from "~/components/nav-main"; 
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { ModeToggle } from "./theme-changer";
import { useRouter } from "next/router"; 

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
  
  ],
  navMain: [
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={nav} />  
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between"> 
          <div className="text-sm text-muted-foreground">Theme</div> 
          <ModeToggle />
        </div>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

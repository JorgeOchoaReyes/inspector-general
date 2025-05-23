import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/sidebar/app-sidebar"; 
import { Separator } from "@radix-ui/react-separator";
import { useRouter } from "next/router";
import {
  Breadcrumb, 
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList, 
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { GithubTokenError } from "../view/githubTokenError";
import React, { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { useStorage } from "~/hooks/use-storage";

export const DashboardLayout: React.FC<{
    children: React.ReactNode;
    title?: string;
}> = ({ children, title }) => {
  const { pathname } = useRouter(); 
  const splitPath = pathname.split("/").filter(Boolean); 
  const hasGithubToken = api.repos.userHasGitHubToken.useQuery(undefined); 
  const storage = useStorage();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hasGithubToken.data?.hasToken !== storage.does_user_have_github_token) {  
      storage.setDoesUserHaveGithubToken(hasGithubToken.data?.hasToken ?? false);
    }
  }, [hasGithubToken.data?.hasToken]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHydrated(true);
    }
  }, []);
  
  const pathNameCheck = pathname !== "/dashboard/github";
  const basePath = pathname === "/dashboard";
  const pathNameCheckBlockPaths = pathname.includes("/pull-requests") || pathname.includes("/repositories");
  const showGithubTokenError = !storage.does_user_have_github_token && pathNameCheck && (pathNameCheckBlockPaths || basePath);

  return <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <title>{title}</title>
        <div className="flex items-center gap-2 px-4"> 
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />  
          <Breadcrumb>
            <BreadcrumbList>
              {
                splitPath.map((path, index) => {
                  let capitalFirstLetter = path.charAt(0).toUpperCase() + path.slice(1);
                  if(path.includes("[") && path.includes("]")) {
                    capitalFirstLetter = "Details";
                  }
                  const isLastElement = index === splitPath.length - 1; 
                  const compoundedPath = splitPath.slice(0, index + 1).join("/");
                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={`/${compoundedPath}`}><h1 className="text-lg font-semibold">{capitalFirstLetter}</h1></BreadcrumbLink>
                      </BreadcrumbItem>
                      { !isLastElement && <BreadcrumbSeparator /> }
                    </React.Fragment>
                  );
                })
              } 
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>   
      { 
        (showGithubTokenError && hydrated) ? <GithubTokenError /> : children
      }  
    </SidebarInset>
  </SidebarProvider>;
};


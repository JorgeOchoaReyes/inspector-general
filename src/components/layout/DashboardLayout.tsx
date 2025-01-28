import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar"; 
import { Separator } from "@radix-ui/react-separator";

export const DashboardLayout: React.FC<{
    children: React.ReactNode;
    title?: string;
}> = ({ children, title }) => {
  return <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <title>{title}</title>
        <div className="flex items-center gap-2 px-4"> 
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </header>
      {children}
    </SidebarInset>
  </SidebarProvider>;
};
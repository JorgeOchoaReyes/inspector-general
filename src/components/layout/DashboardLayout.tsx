import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar"; 

export const DashboardLayout: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
  return <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      {children}
    </SidebarInset>
  </SidebarProvider>;
};
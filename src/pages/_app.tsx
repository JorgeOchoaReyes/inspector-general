/* eslint-disable @typescript-eslint/no-floating-promises */
import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar"; 
import { ThemeProvider } from "~/components/theme-provider"; 
import { useRouter } from "next/router";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { useEffect } from "react";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  
  // redirect to login if not authenticated
  useEffect(() => {
    if (!session && router.pathname !== "/sign-in") {
      router.push("/sign-in");
    }
  }, [session]);

  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >  
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className={GeistSans.className}>
              <Component {...pageProps} />
            </div>
          </SidebarInset>
        </SidebarProvider> 
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AUTH_ROUTES, DEFAULT_REDIRECTS } from "@/constants";

// Components
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthGuard } from "@/components/auth-guard";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Icons
import { LogOut, Bell, Settings } from "lucide-react";

function MainContent({ children }) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleMainClick = (e) => {
    // Only close sidebar on mobile when clicking anywhere in main content
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main
        className="flex-1 overflow-auto"
        onClick={handleMainClick}
        onTouchStart={handleMainClick}
      >
        <ErrorBoundary message="Failed to load dashboard content. Please try refreshing the page.">
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Define public routes that should not show dashboard layout
  const publicRoutes = [AUTH_ROUTES.LOGIN];
  const isPublicRoute = publicRoutes.includes(pathname);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: DEFAULT_REDIRECTS.AFTER_LOGOUT });
  };

  // For public routes (like login), render without dashboard layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, use AuthGuard and dashboard layout
  return (
    <AuthGuard>
      <SidebarProvider>
        <DashboardSidebar className="w-56" />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>

              <Separator orientation="vertical" className="h-4" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-8 gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>

              <Separator orientation="vertical" className="h-4" />
              <SidebarTrigger className="h-8 w-8" />
            </div>
          </header>

          <MainContent>{children}</MainContent>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}

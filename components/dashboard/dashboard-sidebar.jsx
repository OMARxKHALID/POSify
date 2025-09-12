"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

// UI Components
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import { Building2, Crown, ChevronDown, Check } from "lucide-react";

// Import navigation permissions and helper functions
import { NAVIGATION_PERMISSIONS } from "@/constants";
import { filterNavigationByPermissions } from "@/lib/utils/permission-utils";

// Helper Components
function OrganizationSwitcher({ user, organizations = [] }) {
  const [selectedOrg, setSelectedOrg] = useState(
    user?.organizationName || "No Organization"
  );

  const availableOrgs = useMemo(() => {
    return organizations.length > 0
      ? organizations
      : [
          {
            id: "1",
            name: user?.organizationName || "My Restaurant",
            isActive: true,
          },
          { id: "2", name: "Demo Store", isActive: false },
          { id: "3", name: "Test Location", isActive: false },
        ];
  }, [organizations, user?.organizationName]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between h-12 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate max-w-32">
                {selectedOrg}
              </span>
              <span className="text-xs text-muted-foreground">
                Organization
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {availableOrgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setSelectedOrg(org.name)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{org.name}</span>
            </div>
            {selectedOrg === org.name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem className="text-muted-foreground">
          <Building2 className="h-4 w-4 mr-2" />
          Manage Organizations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserProfile({ user, isSuperAdmin }) {
  const userInitials = useMemo(() => {
    return user?.name?.charAt(0)?.toUpperCase() || "U";
  }, [user?.name]);

  const roleDisplay = useMemo(() => {
    return user?.role?.replace("_", " ").toUpperCase() || "USER";
  }, [user?.role]);

  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.profileImage} alt={`${user?.name} profile`} />
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col min-w-0">
        <p className="text-sm font-medium truncate">{user?.name}</p>
        <div className="flex items-center gap-1">
          {isSuperAdmin && <Crown className="h-3 w-3 text-yellow-500" />}
          <Badge
            variant={isSuperAdmin ? "default" : "secondary"}
            className="text-xs"
          >
            {roleDisplay}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function NavigationGroup({ title, items, pathname, onItemClick }) {
  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent className="px-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                onClick={onItemClick}
                className="w-full justify-start gap-2 h-9"
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-2 w-full"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebar({ ...props }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobile, setOpenMobile } = useSidebar();

  const user = session?.user;
  const isSuperAdmin = user?.role === "super_admin";

  // Filter navigation based on user permissions
  const filteredNavigation = useMemo(() => {
    const filtered = filterNavigationByPermissions(
      NAVIGATION_PERMISSIONS,
      user
    );
    return filtered;
  }, [user]);

  // Handle sidebar click to close on mobile only
  const handleSidebarClick = useMemo(() => {
    return (e) => {
      if (isMobile) {
        setOpenMobile(false);
      }
    };
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar {...props} onClick={handleSidebarClick}>
      <SidebarHeader className="border-b">
        {/* Organization Switcher - Hide for super admin */}
        {!isSuperAdmin && <OrganizationSwitcher user={user} />}

        {/* Only show separator if organization switcher is visible */}
        {!isSuperAdmin && <Separator className="my-2" />}

        {user && <UserProfile user={user} isSuperAdmin={isSuperAdmin} />}
      </SidebarHeader>
      <SidebarContent className="gap-1 py-2">
        {Object.entries(filteredNavigation).map(([key, items]) => (
          <NavigationGroup
            key={key}
            title={key.charAt(0).toUpperCase() + key.slice(1)}
            items={items}
            pathname={pathname}
            onItemClick={handleSidebarClick}
          />
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

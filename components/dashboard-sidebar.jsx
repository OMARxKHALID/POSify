"use client";

import * as React from "react";
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
import {
  LayoutDashboard,
  Building2,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Crown,
  Receipt,
  TrendingUp,
  Bell,
  HelpCircle,
  ChevronDown,
  Check,
} from "lucide-react";

// Constants
const NAVIGATION_DATA = {
  main: [
    {
      title: "Dashboard",
      url: "/admin/dashboard/overview",
      icon: LayoutDashboard,
    },
    { title: "Analytics", url: "/admin/dashboard/analytics", icon: BarChart3 },
  ],
  business: [
    {
      title: "Organization",
      url: "/admin/dashboard/organization",
      icon: Building2,
    },
    {
      title: "Store Settings",
      url: "/admin/dashboard/settings",
      icon: Building2,
    },
  ],
  operations: [
    { title: "Orders", url: "/admin/dashboard/orders", icon: ShoppingCart },
    { title: "Products", url: "/admin/dashboard/products", icon: Package },
    { title: "Receipts", url: "/admin/dashboard/receipts", icon: Receipt },
  ],
  management: [
    { title: "Users", url: "/admin/dashboard/users", icon: Users },
    { title: "Reports", url: "/admin/dashboard/reports", icon: TrendingUp },
  ],
  system: [
    { title: "Settings", url: "/admin/dashboard/settings", icon: Settings },
    {
      title: "Notifications",
      url: "/admin/dashboard/notifications",
      icon: Bell,
    },
    { title: "Help & Support", url: "/admin/dashboard/help", icon: HelpCircle },
  ],
};

// Helper Components
function OrganizationSwitcher({ user, organizations = [] }) {
  const [selectedOrg, setSelectedOrg] = React.useState(
    user?.organizationName || "No Organization"
  );

  const availableOrgs =
    organizations.length > 0
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
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.profileImage} />
        <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col min-w-0">
        <p className="text-sm font-medium truncate">{user?.name}</p>
        <div className="flex items-center gap-1">
          {isSuperAdmin && <Crown className="h-3 w-3 text-yellow-500" />}
          <Badge
            variant={isSuperAdmin ? "default" : "secondary"}
            className="text-xs"
          >
            {user?.role?.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function NavigationGroup({ title, items, pathname, onItemClick }) {
  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel className="px-2 py-1">{title}</SidebarGroupLabel>
      <SidebarGroupContent className="px-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                onClick={onItemClick}
              >
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
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
  const isOwner = user?.organizationName;

  const getFilteredNavigation = () => {
    const filtered = { ...NAVIGATION_DATA };
    if (isSuperAdmin) return filtered;
    if (!isOwner) delete filtered.system;
    return filtered;
  };

  const filteredNavigation = getFilteredNavigation();

  // Handle sidebar click to close on mobile only
  const handleSidebarClick = (e) => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar {...props} onClick={handleSidebarClick}>
      <SidebarHeader>
        {/* Organization Switcher */}
        <OrganizationSwitcher user={user} />

        <Separator />

        {user && <UserProfile user={user} isSuperAdmin={isSuperAdmin} />}
      </SidebarHeader>
      <SidebarContent className="gap-1">
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

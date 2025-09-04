"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Shield, Building2, Loader2, Zap } from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "super_admin":
        return <Shield className="h-3 w-3" />;
      case "admin":
        return <Building2 className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">POSify</h1>
              <p className="text-xs text-muted-foreground">API Testing Suite</p>
            </div>
          </div>
        </div>

        {/* Auth Status */}
        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : session ? (
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                    {session.user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {session.user?.name || session.user?.email}
                    </span>
                    {session.user?.role && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${getRoleColor(session.user.role)}`}
                      >
                        {getRoleIcon(session.user.role)}
                        <span className="ml-1 capitalize">
                          {session.user.role.replace("_", " ")}
                        </span>
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {session.user?.email}
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-1 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Not logged in
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/test-routes")}
                className="flex items-center space-x-1"
              >
                <User className="h-3 w-3" />
                <span>Login</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

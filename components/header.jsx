"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">POSify</h1>
            <span className="ml-2 text-sm text-gray-500">API Testing</span>
          </div>

          {/* Auth Status */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                {/* Just show the email */}
                <div className="text-sm text-gray-700">
                  Logged in as:{" "}
                  <span className="font-medium">{session.user?.email}</span>
                </div>

                {/* Sign Out Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Not logged in</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/test-routes")}
                >
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

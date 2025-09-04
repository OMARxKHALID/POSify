import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to POSify
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern Point of Sale system for restaurants and retail businesses.
            Test your API endpoints and explore the system.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 API Testing
              </CardTitle>
              <CardDescription>
                Test all your API endpoints with proper error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/test-routes">
                <Button className="w-full">Open Testing Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔐 Authentication
              </CardTitle>
              <CardDescription>Login and manage user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Dashboard
              </CardTitle>
              <CardDescription>
                Access the main application dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Open Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>
                Follow these steps to test your API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-2">
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                  1
                </span>
                <p>
                  Click "Open Testing Dashboard" to access the API testing
                  interface
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                  2
                </span>
                <p>Start with "User Registration" to create a test user</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                  3
                </span>
                <p>Use the returned user ID for "Organization Registration"</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                  4
                </span>
                <p>Test login with the created credentials</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

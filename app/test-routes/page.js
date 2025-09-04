"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  Trash2,
  UserPlus,
  Shield,
  Building2,
  LogIn,
  Users,
  Zap,
  Code,
  Database,
  Settings,
} from "lucide-react";

export default function TestRoutesPage() {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  // Form states
  const [userForm, setUserForm] = useState({
    name: "demo",
    email: "demo@gmail.com",
    password: "Admin@123",
    role: "pending",
    status: "active",
    emailVerified: true,
    permissions: ["*"],
  });

  const [superAdminForm, setSuperAdminForm] = useState({
    name: "omar",
    email: "superadmin@gmail.com",
    password: "Admin@123",
    role: "super_admin",
    status: "active",
    emailVerified: true,
    permissions: ["*"],
  });

  const [orgForm, setOrgForm] = useState({
    userId: "",
    organizationName: "My Restaurant",
    businessType: "restaurant",
    information: {
      legalName: "My Restaurant LLC",
      displayName: "My Restaurant",
      orgPhone: "+1-555-0123",
      email: "contact@myrestaurant.com",
      website: "https://myrestaurant.com",
      address: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
      },
      logoUrl: "https://example.com/logo.png",
      taxId: "TAX123456789",
      currency: "USD",
      timezone: "America/New_York",
      language: "en",
    },
  });

  const [loginForm, setLoginForm] = useState({
    email: "john.doe@example.com",
    password: "password123",
  });

  const [usersQuery, setUsersQuery] = useState({
    organizationId: "",
    page: "1",
    limit: "10",
    search: "",
  });

  const setLoadingState = (key, isLoading) => {
    setLoading((prev) => ({ ...prev, [key]: isLoading }));
  };

  const setResult = (key, result) => {
    setResults((prev) => ({ ...prev, [key]: result }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const setError = (key, error) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
    setResults((prev) => ({ ...prev, [key]: null }));
  };

  const handleApiCall = async (endpoint, method, data, key) => {
    setLoadingState(key, true);

    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (data && method !== "GET") {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, options);
      const result = await response.json();

      if (response.ok) {
        setResult(key, result);
      } else {
        setError(key, result);
      }
    } catch (error) {
      setError(key, {
        message: error.message,
        code: "NETWORK_ERROR",
        status: 0,
      });
    } finally {
      setLoadingState(key, false);
    }
  };

  const handleNextAuthLogin = async (credentials) => {
    setLoadingState("login", true);
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError("login", {
          message: result.error,
          code: "AUTH_ERROR",
          status: 401,
        });
      } else {
        setResult("login", {
          message: "Login successful!",
          data: { user: "Authenticated" },
        });
      }
    } catch (error) {
      setError("login", {
        message: error.message,
        code: "NETWORK_ERROR",
        status: 0,
      });
    } finally {
      setLoadingState("login", false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearResult = (key) => {
    setResults((prev) => ({ ...prev, [key]: null }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const renderResult = (key, title) => {
    const result = results[key];
    const error = errors[key];

    if (!result && !error) return null;

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {result ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              {title} Response
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(JSON.stringify(result || error, null, 2))
                }
                className="h-7 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearResult(key)}
                className="h-7 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
            {JSON.stringify(result || error, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                API Testing Suite
              </h1>
              <p className="text-muted-foreground">
                Test and validate your POSify API endpoints
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="auth" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="organizations"
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Queries
            </TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="auth" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Login */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    NextAuth Login
                    <Badge variant="outline" className="ml-auto">
                      NextAuth signIn()
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Authenticate using NextAuth credentials provider
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Enter password"
                    />
                  </div>
                  <Button
                    onClick={() => handleNextAuthLogin(loginForm)}
                    disabled={loading["login"]}
                    className="w-full"
                  >
                    {loading["login"] ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Login
                  </Button>
                  {renderResult("login", "Login")}
                </CardContent>
              </Card>

              {/* Super Admin Registration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Super Admin Registration
                    <Badge variant="outline" className="ml-auto">
                      POST /api/register/super-admin
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Register a super admin user (one-time only)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="super-name">Name</Label>
                    <Input
                      id="super-name"
                      value={superAdminForm.name}
                      onChange={(e) =>
                        setSuperAdminForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="super-email">Email</Label>
                    <Input
                      id="super-email"
                      type="email"
                      value={superAdminForm.email}
                      onChange={(e) =>
                        setSuperAdminForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="super-password">Password</Label>
                    <Input
                      id="super-password"
                      type="password"
                      value={superAdminForm.password}
                      onChange={(e) =>
                        setSuperAdminForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Enter password"
                    />
                  </div>
                  <Button
                    onClick={() =>
                      handleApiCall(
                        "/api/register/super-admin",
                        "POST",
                        superAdminForm,
                        "super-admin-register"
                      )
                    }
                    disabled={loading["super-admin-register"]}
                    className="w-full"
                  >
                    {loading["super-admin-register"] ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Register Super Admin
                  </Button>
                  {renderResult(
                    "super-admin-register",
                    "Super Admin Registration"
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  User Registration
                  <Badge variant="outline" className="ml-auto">
                    POST /api/register
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Register a new user (pending role, needs organization)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Name</Label>
                    <Input
                      id="user-name"
                      value={userForm.name}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) =>
                      setUserForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter password"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleApiCall(
                      "/api/register",
                      "POST",
                      userForm,
                      "user-register"
                    )
                  }
                  disabled={loading["user-register"]}
                  className="w-full"
                >
                  {loading["user-register"] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Register User
                </Button>
                {renderResult("user-register", "User Registration")}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Registration
                  <Badge variant="outline" className="ml-auto">
                    POST /api/organizations/register
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Create an organization and link it to a user (makes user
                  admin)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-user-id">User ID</Label>
                  <Input
                    id="org-user-id"
                    value={orgForm.userId}
                    onChange={(e) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        userId: e.target.value,
                      }))
                    }
                    placeholder="Enter user ID from registration"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={orgForm.organizationName}
                      onChange={(e) =>
                        setOrgForm((prev) => ({
                          ...prev,
                          organizationName: e.target.value,
                        }))
                      }
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-type">Business Type</Label>
                    <Input
                      id="org-type"
                      value={orgForm.businessType}
                      onChange={(e) =>
                        setOrgForm((prev) => ({
                          ...prev,
                          businessType: e.target.value,
                        }))
                      }
                      placeholder="e.g., restaurant, retail"
                    />
                  </div>
                </div>
                <Button
                  onClick={() =>
                    handleApiCall(
                      "/api/organizations/register",
                      "POST",
                      orgForm,
                      "org-register"
                    )
                  }
                  disabled={loading["org-register"]}
                  className="w-full"
                >
                  {loading["org-register"] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Register Organization
                </Button>
                {renderResult("org-register", "Organization Registration")}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Queries Tab */}
          <TabsContent value="queries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Users Query
                  <Badge variant="outline" className="ml-auto">
                    GET /api/dashboard/users
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Query users with filters and pagination
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="query-org-id">Organization ID</Label>
                    <Input
                      id="query-org-id"
                      value={usersQuery.organizationId}
                      onChange={(e) =>
                        setUsersQuery((prev) => ({
                          ...prev,
                          organizationId: e.target.value,
                        }))
                      }
                      placeholder="Enter organization ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="query-search">Search</Label>
                    <Input
                      id="query-search"
                      value={usersQuery.search}
                      onChange={(e) =>
                        setUsersQuery((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      placeholder="Search users"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="query-page">Page</Label>
                    <Input
                      id="query-page"
                      type="number"
                      value={usersQuery.page}
                      onChange={(e) =>
                        setUsersQuery((prev) => ({
                          ...prev,
                          page: e.target.value,
                        }))
                      }
                      placeholder="Page number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="query-limit">Limit</Label>
                    <Input
                      id="query-limit"
                      type="number"
                      value={usersQuery.limit}
                      onChange={(e) =>
                        setUsersQuery((prev) => ({
                          ...prev,
                          limit: e.target.value,
                        }))
                      }
                      placeholder="Items per page"
                    />
                  </div>
                </div>
                <Button
                  onClick={() =>
                    handleApiCall(
                      `/api/dashboard/users?${new URLSearchParams(
                        usersQuery
                      ).toString()}`,
                      "GET",
                      null,
                      "users-query"
                    )
                  }
                  disabled={loading["users-query"]}
                  className="w-full"
                >
                  {loading["users-query"] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Query Users
                </Button>
                {renderResult("users-query", "Users Query")}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

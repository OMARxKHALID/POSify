"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, CheckCircle, XCircle, Copy, Trash2 } from "lucide-react";

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

      // Handle NextAuth endpoints differently
      if (endpoint.includes("/api/auth/")) {
        if (endpoint.includes("/api/auth/session")) {
          // Session endpoint returns JSON
          const result = await response.json();
          if (response.ok) {
            setResult(key, result);
          } else {
            setError(key, result);
          }
        } else if (endpoint.includes("/api/auth/signout")) {
          // Signout endpoint returns HTML/redirect, not JSON
          if (response.ok) {
            setResult(key, {
              success: true,
              message: "Successfully signed out",
              statusCode: 200,
            });
          } else {
            setError(key, {
              success: false,
              error: "Signout failed",
              code: "SIGNOUT_FAILED",
              details: [],
              statusCode: response.status,
            });
          }
        } else if (endpoint.includes("/api/auth/callback/credentials")) {
          // Login callback returns HTML or redirect, not JSON
          if (response.ok) {
            setResult(key, {
              success: true,
              message:
                "Login successful! Check session to verify authentication.",
              statusCode: 200,
            });
          } else {
            setError(key, {
              success: false,
              error: "Login failed",
              code: "LOGIN_FAILED",
              details: [],
              statusCode: response.status,
            });
          }
        } else {
          // Other NextAuth endpoints
          const result = await response.json();
          if (response.ok) {
            setResult(key, result);
          } else {
            setError(key, result);
          }
        }
      } else {
        // Regular API endpoint handling
        const result = await response.json();
        if (response.ok) {
          setResult(key, result);
        } else {
          setError(key, result);
        }
      }
    } catch (error) {
      setError(key, {
        success: false,
        error: error.message,
        code: "NETWORK_ERROR",
        details: [],
        statusCode: 0,
      });
    } finally {
      setLoadingState(key, false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearResult = (key) => {
    setResults((prev) => {
      const newResults = { ...prev };
      delete newResults[key];
      return newResults;
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
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
          success: false,
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
          details: [],
          statusCode: 401,
        });
      } else if (result?.ok) {
        setResult("login", {
          success: true,
          message: "Login successful! Check session to verify authentication.",
          statusCode: 200,
        });
      } else {
        setError("login", {
          success: false,
          error: "Login failed",
          code: "LOGIN_FAILED",
          details: [],
          statusCode: 500,
        });
      }
    } catch (error) {
      setError("login", {
        success: false,
        error: error.message,
        code: "NETWORK_ERROR",
        details: [],
        statusCode: 0,
      });
    } finally {
      setLoadingState("login", false);
    }
  };

  const renderResult = (key, title) => {
    const result = results[key];
    const error = errors[key];
    const isLoading = loading[key];

    if (isLoading) {
      return (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading...</AlertDescription>
        </Alert>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Error:</strong>{" "}
                {error.error?.message || error.message || "Unknown error"}
              </p>
              <p>
                <strong>Code:</strong> {error.error?.code || error.code}
              </p>
              <p>
                <strong>Status:</strong> {error.statusCode}
              </p>
              {(error.details || error.error?.details) &&
                (error.details?.length > 0 ||
                  error.error?.details?.length > 0) && (
                  <div>
                    <strong>Details:</strong>
                    <pre className="text-xs mt-1 bg-red-50 p-2 rounded">
                      {JSON.stringify(
                        error.details || error.error?.details,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (result) {
      return (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p>
                  <strong>Success:</strong> {result.message}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(result, null, 2))
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearResult(key)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <pre className="text-xs bg-green-50 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          API Routes Testing Dashboard
        </h1>
        <p className="text-muted-foreground">
          Test all your API endpoints with proper error handling and response
          display
        </p>
      </div>

      <Tabs defaultValue="registration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="nextauth">NextAuth</TabsTrigger>
        </TabsList>

        {/* Registration Tab */}
        <TabsContent value="registration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Registration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  User Registration
                  <Badge variant="outline">POST /api/register</Badge>
                </CardTitle>
                <CardDescription>
                  Register a new user without organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) =>
                      setUserForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
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

            {/* Super Admin Registration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Super Admin Registration
                  <Badge variant="outline">
                    POST /api/register/super-admin
                  </Badge>
                </CardTitle>
                <CardDescription>Register a super admin user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={superAdminForm.name}
                    onChange={(e) =>
                      setSuperAdminForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={superAdminForm.email}
                    onChange={(e) =>
                      setSuperAdminForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={superAdminForm.password}
                    onChange={(e) =>
                      setSuperAdminForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
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

          {/* Organization Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Organization Registration
                <Badge variant="outline">
                  POST /api/organizations/register
                </Badge>
              </CardTitle>
              <CardDescription>
                Register a new organization and link it to a user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    User ID (from user registration)
                  </label>
                  <Input
                    value={orgForm.userId}
                    onChange={(e) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        userId: e.target.value,
                      }))
                    }
                    placeholder="Paste user ID from registration response"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Organization Name
                  </label>
                  <Input
                    value={orgForm.organizationName}
                    onChange={(e) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        organizationName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Business Type</label>
                <select
                  value={orgForm.businessType}
                  onChange={(e) =>
                    setOrgForm((prev) => ({
                      ...prev,
                      businessType: e.target.value,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="bakery">Bakery</option>
                  <option value="bar">Bar</option>
                  <option value="food-truck">Food Truck</option>
                  <option value="retail">Retail</option>
                </select>
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

        {/* Authentication Tab */}
        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Login Test
                <Badge variant="outline">NextAuth signIn()</Badge>
              </CardTitle>
              <CardDescription>
                Test user login with NextAuth.js credentials provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => handleNextAuthLogin(loginForm)}
                disabled={loading["login"]}
                className="w-full"
              >
                {loading["login"] ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Login with NextAuth
              </Button>
              {renderResult("login", "Login")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Get Users
                <Badge variant="outline">GET /api/dashboard/users</Badge>
              </CardTitle>
              <CardDescription>
                Fetch users for an organization with pagination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Organization ID</label>
                  <Input
                    value={usersQuery.organizationId}
                    onChange={(e) =>
                      setUsersQuery((prev) => ({
                        ...prev,
                        organizationId: e.target.value,
                      }))
                    }
                    placeholder="Organization ID"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Page</label>
                  <Input
                    type="number"
                    value={usersQuery.page}
                    onChange={(e) =>
                      setUsersQuery((prev) => ({
                        ...prev,
                        page: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Limit</label>
                  <Input
                    type="number"
                    value={usersQuery.limit}
                    onChange={(e) =>
                      setUsersQuery((prev) => ({
                        ...prev,
                        limit: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    value={usersQuery.search}
                    onChange={(e) =>
                      setUsersQuery((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    placeholder="Search users..."
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  const params = new URLSearchParams(usersQuery).toString();
                  handleApiCall(
                    `/api/dashboard/users?${params}`,
                    "GET",
                    null,
                    "get-users"
                  );
                }}
                disabled={loading["get-users"]}
                className="w-full"
              >
                {loading["get-users"] ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Get Users
              </Button>
              {renderResult("get-users", "Get Users")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NextAuth Tab */}
        <TabsContent value="nextauth" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Session Check
                  <Badge variant="outline">GET /api/auth/session</Badge>
                </CardTitle>
                <CardDescription>Check current user session</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() =>
                    handleApiCall("/api/auth/session", "GET", null, "session")
                  }
                  disabled={loading["session"]}
                  className="w-full"
                >
                  {loading["session"] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Check Session
                </Button>
                {renderResult("session", "Session")}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Sign Out
                  <Badge variant="outline">POST /api/auth/signout</Badge>
                </CardTitle>
                <CardDescription>Sign out current user</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() =>
                    handleApiCall("/api/auth/signout", "POST", {}, "signout")
                  }
                  disabled={loading["signout"]}
                  variant="destructive"
                  className="w-full"
                >
                  {loading["signout"] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Sign Out
                </Button>
                {renderResult("signout", "Sign Out")}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common testing scenarios and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUserForm({
                  name: `Test User ${Date.now()}`,
                  email: `test${Date.now()}@example.com`,
                  password: "password123",
                  role: "pending",
                  status: "active",
                  emailVerified: true,
                  permissions: ["*"],
                });
              }}
            >
              Generate Test User
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuperAdminForm({
                  name: `Super Admin ${Date.now()}`,
                  email: `admin${Date.now()}@posify.com`,
                  password: "admin123456",
                  role: "super_admin",
                  status: "active",
                  emailVerified: true,
                  permissions: ["*"],
                });
              }}
            >
              Generate Test Super Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOrgForm((prev) => ({
                  ...prev,
                  organizationName: `Test Restaurant ${Date.now()}`,
                }));
              }}
            >
              Generate Test Organization
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResults({});
                setErrors({});
              }}
            >
              Clear All Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

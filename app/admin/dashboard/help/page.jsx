"use client";

import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  FileText,
  Video,
  ExternalLink,
} from "lucide-react";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HelpPage() {
  const helpCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics of using POSify",
      icon: BookOpen,
      articles: 12,
      color: "bg-blue-500",
    },
    {
      title: "Orders & Sales",
      description: "Manage orders, payments, and sales",
      icon: FileText,
      articles: 8,
      color: "bg-green-500",
    },
    {
      title: "Menu Management",
      description: "Create and manage your menu items",
      icon: FileText,
      articles: 6,
      color: "bg-orange-500",
    },
    {
      title: "User Management",
      description: "Manage staff and permissions",
      icon: FileText,
      articles: 4,
      color: "bg-purple-500",
    },
    {
      title: "Settings & Configuration",
      description: "Configure your restaurant settings",
      icon: FileText,
      articles: 10,
      color: "bg-red-500",
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: FileText,
      articles: 15,
      color: "bg-yellow-500",
    },
  ];

  const quickLinks = [
    { title: "How to create your first order", href: "#" },
    { title: "Setting up payment methods", href: "#" },
    { title: "Managing menu categories", href: "#" },
    { title: "User roles and permissions", href: "#" },
    { title: "Receipt printing setup", href: "#" },
    { title: "Backup and restore data", href: "#" },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Help & Support"
        description="Find answers, guides, and support resources"
        icon={HelpCircle}
      />

      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help articles, guides, and FAQs..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>
                  Popular help topics and guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {quickLinks.map((link, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="justify-start h-auto p-3"
                      asChild
                    >
                      <a
                        href={link.href}
                        className="flex items-center justify-between w-full"
                      >
                        <span>{link.title}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Categories */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {helpCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${category.color} text-white`}
                      >
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {category.title}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {category.articles} articles
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {category.description}
                    </CardDescription>
                    <Button variant="outline" size="sm" className="w-full">
                      Browse Articles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>Step-by-step video guides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Video className="h-5 w-5 text-red-500" />
                      <h3 className="font-semibold">
                        Getting Started with POSify
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Learn the basics of setting up your restaurant management
                      system.
                    </p>
                    <Button variant="outline" size="sm">
                      Watch Video
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Video className="h-5 w-5 text-red-500" />
                      <h3 className="font-semibold">
                        Managing Orders & Payments
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete guide to processing orders and handling payments.
                    </p>
                    <Button variant="outline" size="sm">
                      Watch Video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Get help from our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        Available 24/7
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Email Support</h3>
                      <p className="text-sm text-muted-foreground">
                        support@posify.com
                      </p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Live Chat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>
                    Current system status and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Status</span>
                      <Badge variant="default" className="bg-green-500">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge variant="default" className="bg-green-500">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Processing</span>
                      <Badge variant="default" className="bg-green-500">
                        Operational
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuFormSchema } from "@/schemas/menu-schema";
import { ADMIN_ROUTES } from "@/constants";
import {
  Edit,
  Utensils,
  DollarSign,
  Clock,
  Star,
  Tag,
  Image,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { FormActions } from "@/components/form/form-actions";
import { FormField } from "@/components/form/form-field";
import { useEditMenuItem, useMenu } from "@/hooks/use-menu";
import { formatCategoryOptions } from "@/lib/utils/category-utils";

export default function EditMenuItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuItemId = searchParams?.get("id") || null;

  const editMenuItemMutation = useEditMenuItem();
  const { data: menuData, isLoading: menuLoading } = useMenu();

  const currentUser = menuData?.currentUser;
  const menuItems = menuData?.menuItems || [];
  const categories = menuData?.categories || [];
  const targetMenuItem =
    menuItems.find((item) => item.id === menuItemId) || null;

  // Form setup
  const form = useForm({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      icon: "",
      available: true,
      prepTime: 0,
      isSpecial: false,
      categoryId: "uncategorized",
    },
  });

  useEffect(() => {
    if (targetMenuItem) {
      form.reset({
        name: targetMenuItem.name ?? "",
        description: targetMenuItem.description ?? "",
        price: targetMenuItem.price ?? 0,
        image: targetMenuItem.image ?? "",
        icon: targetMenuItem.icon ?? "",
        available: targetMenuItem.available ?? true,
        prepTime: targetMenuItem.prepTime ?? 0,
        isSpecial: targetMenuItem.isSpecial ?? false,
        categoryId: targetMenuItem.categoryId ?? "uncategorized",
      });
    }
  }, [targetMenuItem, form]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await editMenuItemMutation.mutateAsync({
        menuItemId,
        menuItemData: data,
      });
      router.push(ADMIN_ROUTES.MENU || "/admin/dashboard/menu");
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  };

  // Redirect if user doesn't have permission (only admin can edit menu items)
  useEffect(() => {
    if (!menuLoading && currentUser?.role !== "admin") {
      router.push(ADMIN_ROUTES.MENU || "/admin/dashboard/menu");
    }
  }, [currentUser?.role, router, menuLoading]);

  // Show loading while checking permissions
  if (menuLoading || currentUser?.role !== "admin") {
    return (
      <PageLayout
        isLoading={true}
        errorMessage="Loading menu item edit form..."
      />
    );
  }

  // If targetMenuItem doesn't exist (but we have permission) -> show not found
  if (!targetMenuItem) {
    return (
      <PageLayout error={{ message: "Menu item not found" }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Menu item not found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The menu item you're trying to edit doesn't exist or you don't
              have permission to access it.
            </p>
            <Button
              onClick={() =>
                router.push(ADMIN_ROUTES.MENU || "/admin/dashboard/menu")
              }
            >
              Back to Menu
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const isMutating =
    editMenuItemMutation?.isLoading || editMenuItemMutation?.isPending;

  return (
    <PageLayout errorMessage="Failed to load menu item edit form. Please try refreshing the page.">
      <PageHeader
        title="Edit Menu Item"
        description="Update menu item information and settings"
        icon={Edit}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* Menu Item Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Current Menu Item Information
          </CardTitle>
          <CardDescription>
            Overview of the menu item's current details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
              {targetMenuItem.icon ? (
                <span className="text-2xl">{targetMenuItem.icon}</span>
              ) : (
                <Utensils className="h-8 w-8" />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-w-0">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">
                  {targetMenuItem.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Price</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  ${targetMenuItem.price?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Badge variant="outline">
                  {targetMenuItem.categoryId?.name || "Uncategorized"}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2">
                  {targetMenuItem.available ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Badge
                    variant={targetMenuItem.available ? "default" : "secondary"}
                  >
                    {targetMenuItem.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Menu Item Form */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Information
              </CardTitle>
              <CardDescription>
                Update the menu item's details and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    label="Item Name"
                    icon={Utensils}
                    placeholder="Enter menu item name"
                    className="h-11"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    label="Description"
                    icon={Utensils}
                    component="textarea"
                    placeholder="Enter item description"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    label="Price"
                    icon={DollarSign}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    label="Category"
                    icon={Tag}
                    component="select"
                    placeholder="Select category"
                    disabled={isMutating}
                    options={formatCategoryOptions(categories)}
                  />

                  <FormField
                    control={form.control}
                    name="prepTime"
                    label="Preparation Time (minutes)"
                    icon={Clock}
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    label="Menu Item Image"
                    icon={Image}
                    component="image"
                    placeholder="Drop an image here or click to browse"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    label="Icon"
                    icon={Star}
                    placeholder="Enter emoji or icon (optional)"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="available"
                    label="Available"
                    icon={Eye}
                    component="switch"
                    switchDescription="Make this item available on the menu"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="isSpecial"
                    label="Special Item"
                    icon={Star}
                    component="switch"
                    switchDescription="Mark as a special featured item"
                    disabled={isMutating}
                  />

                  <FormActions
                    isLoading={isMutating}
                    submitText="Update Menu Item"
                    submitIcon={Edit}
                    disabled={!form.formState.isValid}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Edit Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Changes will be reflected immediately on your menu
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <DollarSign className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Price changes affect all new orders immediately
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Eye className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set availability to control when items appear on the menu
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Star className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Special items can be highlighted for promotions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Preparation Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Clock className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Accurate prep times help with kitchen planning
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Utensils className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Include time for cooking, plating, and quality checks
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Display Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Tag className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lower numbers appear first on the menu
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Utensils className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use this to control the order of items within categories
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

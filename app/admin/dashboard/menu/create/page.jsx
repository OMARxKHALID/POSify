"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuFormSchema } from "@/schemas/menu-schema";
import { ADMIN_ROUTES } from "@/constants";
import {
  Plus,
  Utensils,
  DollarSign,
  Clock,
  Star,
  Tag,
  Image,
  Eye,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

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
import { FormField } from "@/components/form/form-field";
import { FormActions } from "@/components/form/form-actions";
import { useCreateMenuItem, useMenu } from "@/hooks/use-menu";
import { formatCategoryOptions } from "@/lib/utils/category-utils";

export default function CreateMenuItemPage() {
  const router = useRouter();
  const createMenuItemMutation = useCreateMenuItem();
  const { data: menuData, isLoading: menuLoading } = useMenu();

  const currentUser = menuData?.currentUser;
  const categories = menuData?.categories || [];

  // Show warning if categories failed to load
  const categoriesError = !menuLoading && categories.length === 0 && menuData;

  // Initialize form with validation
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

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await createMenuItemMutation.mutateAsync(data);
      router.push(ADMIN_ROUTES.MENU || "/admin/dashboard/menu");
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  };

  // Redirect if user doesn't have permission (only admin can create menu items)
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
        errorMessage="Loading menu item creation form..."
      />
    );
  }

  return (
    <PageLayout errorMessage="Failed to load menu item creation form. Please try refreshing the page.">
      <PageHeader
        title="Create New Menu Item"
        description="Add a new item to your restaurant menu"
        icon={Plus}
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* Create Menu Item Form */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Menu Item
              </CardTitle>
              <CardDescription>
                Enter the details for the new menu item
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
                    disabled={createMenuItemMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    label="Description"
                    icon={Utensils}
                    component="textarea"
                    placeholder="Enter item description"
                    disabled={createMenuItemMutation.isPending}
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
                    disabled={createMenuItemMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    label="Category"
                    icon={Tag}
                    component="select"
                    placeholder={
                      categoriesError
                        ? "Categories unavailable"
                        : "Select category"
                    }
                    disabled={
                      createMenuItemMutation.isPending || categoriesError
                    }
                    options={formatCategoryOptions(categories)}
                  />
                  {categoriesError && (
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Categories could not be loaded. You can still create menu
                      items without categories.
                    </p>
                  )}

                  <FormField
                    control={form.control}
                    name="prepTime"
                    label="Preparation Time (minutes)"
                    icon={Clock}
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={createMenuItemMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    label="Menu Item Image"
                    icon={Image}
                    component="image"
                    placeholder="Drop an image here or click to browse"
                    disabled={createMenuItemMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    label="Icon"
                    icon={Star}
                    placeholder="Enter emoji or icon (optional)"
                    disabled={createMenuItemMutation.isPending}
                  />

                  <div className="flex items-center space-x-4">
                    <FormField
                      control={form.control}
                      name="available"
                      label="Available"
                      icon={Eye}
                      component="switch"
                      switchDescription="Make this item available on the menu"
                      disabled={createMenuItemMutation.isPending}
                    />

                    <FormField
                      control={form.control}
                      name="isSpecial"
                      label="Special Item"
                      icon={Star}
                      component="switch"
                      switchDescription="Mark as a special featured item"
                      disabled={createMenuItemMutation.isPending}
                    />
                  </div>

                  <FormActions
                    isLoading={createMenuItemMutation.isPending}
                    submitText="Create Menu Item"
                    submitIcon={Plus}
                    onCancel={() => router.back()}
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
                Menu Item Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use clear, descriptive names that customers will understand
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                  <DollarSign className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set competitive prices that reflect your food costs and profit
                  margins
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                  <Clock className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Accurate prep times help with kitchen planning and customer
                  expectations
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                  <Star className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mark special items to highlight them on your menu
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <AlertTriangle className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use high-quality images that showcase your food
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Image className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Recommended size: 800x600 pixels or similar aspect ratio
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Eye className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Good lighting and clean presentation make items more appealing
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Tag className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Categories help organize your menu and improve customer
                  navigation
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
                  <Utensils className="h-3 w-3" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create categories like "Appetizers", "Main Courses",
                  "Desserts", etc.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

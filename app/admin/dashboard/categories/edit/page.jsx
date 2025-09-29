"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema } from "@/schemas/category-schema";
import { ADMIN_ROUTES } from "@/constants";
import {
  Edit,
  FolderOpen,
  Eye,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

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
import { useEditCategory, useCategories } from "@/hooks/use-categories";

export default function EditCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get("id") || null;

  const editCategoryMutation = useEditCategory();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const currentUser = categoriesData?.currentUser;
  const categories = categoriesData?.categories || [];
  const targetCategory =
    categories.find((category) => category.id === categoryId) || null;

  // Initialize form with validation
  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      image: "",
      isActive: true,
    },
  });

  // Update form when category data is loaded
  useEffect(() => {
    if (targetCategory) {
      form.reset({
        name: targetCategory.name || "",
        description: targetCategory.description || "",
        icon: targetCategory.icon || "",
        image: targetCategory.image || "",
        isActive: targetCategory.isActive ?? true,
      });
    }
  }, [targetCategory, form]);

  // Handle form submission
  const onSubmit = async (data) => {
    if (!categoryId) return;

    try {
      await editCategoryMutation.mutateAsync({
        categoryId,
        categoryData: data,
      });
      router.push(ADMIN_ROUTES.CATEGORIES);
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(ADMIN_ROUTES.CATEGORIES);
  };

  // Check if we're in a loading or error state
  const isMutating = editCategoryMutation.isPending;

  // Show loading state
  if (categoriesLoading) {
    return (
      <PageLayout isLoading={true} error={null} errorMessage="">
        <PageHeader
          title="Edit Category"
          description="Loading category information..."
          icon={Edit}
        />
      </PageLayout>
    );
  }

  // Show error state if category not found
  if (!targetCategory) {
    return (
      <PageLayout
        isLoading={false}
        error={true}
        errorMessage="Category not found. Please check the URL and try again."
      >
        <PageHeader
          title="Edit Category"
          description="Category not found"
          icon={Edit}
        />
      </PageLayout>
    );
  }

  return (
    <Suspense fallback={null}>
    <PageLayout isLoading={false} error={null} errorMessage="">
      <PageHeader
        title="Edit Category"
        description="Update category information and settings"
        icon={Edit}
      />

      <div className="grid gap-6">
        {/* Category Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Category Information
            </CardTitle>
            <CardDescription>
              Current category details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                  {targetCategory.icon ? (
                    <span className="text-xl">{targetCategory.icon}</span>
                  ) : (
                    <FolderOpen className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{targetCategory.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {targetCategory.description || "No description"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {targetCategory.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Badge
                    variant={targetCategory.isActive ? "default" : "secondary"}
                  >
                    {targetCategory.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Category
            </CardTitle>
            <CardDescription>
              Update the category information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    label="Category Name"
                    placeholder="Enter category name"
                    component="input"
                    disabled={isMutating}
                    required
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="Enter category description (optional)"
                    component="textarea"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    label="Icon"
                    placeholder="Enter emoji or icon (optional)"
                    component="input"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    label="Banner Image"
                    placeholder="Enter image URL (optional)"
                    component="image"
                    disabled={isMutating}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    label="Active Status"
                    switchDescription="Make this category visible to customers"
                    component="switch"
                    disabled={isMutating}
                  />
                </div>

                <FormActions
                  onCancel={handleCancel}
                  submitText="Update Category"
                  cancelText="Cancel"
                  isLoading={isMutating}
                  disabled={!form.formState.isValid}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
    </Suspense>
  );
}

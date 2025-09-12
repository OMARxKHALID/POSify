"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema } from "@/schemas/category-schema";
import { ADMIN_ROUTES } from "@/constants";
import {
  Plus,
  FolderOpen,
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
import { useCreateCategory, useCategories } from "@/hooks/use-categories";

export default function CreateCategoryPage() {
  const router = useRouter();
  const createCategoryMutation = useCreateCategory();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const currentUser = categoriesData?.currentUser;

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

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await createCategoryMutation.mutateAsync(data);
      router.push(ADMIN_ROUTES.CATEGORIES);
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(ADMIN_ROUTES.CATEGORIES);
  };

  return (
    <PageLayout isLoading={categoriesLoading} error={null} errorMessage="">
      <PageHeader
        title="Create New Category"
        description="Add a new category to organize your menu items"
        icon={Plus}
      />

      <div className="grid gap-6">
        {/* Category Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Category Information
            </CardTitle>
            <CardDescription>
              Enter the details for your new category
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
                    disabled={createCategoryMutation.isPending}
                    required
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="Enter category description (optional)"
                    component="textarea"
                    disabled={createCategoryMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    label="Icon"
                    placeholder="Enter emoji or icon (optional)"
                    component="input"
                    disabled={createCategoryMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    label="Banner Image"
                    placeholder="Enter image URL (optional)"
                    component="image"
                    disabled={createCategoryMutation.isPending}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    label="Active Status"
                    switchDescription="Make this category visible to customers"
                    component="switch"
                    disabled={createCategoryMutation.isPending}
                  />
                </div>

                <FormActions
                  onCancel={handleCancel}
                  submitText="Create Category"
                  cancelText="Cancel"
                  isLoading={createCategoryMutation.isPending}
                  disabled={!form.formState.isValid}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Category Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Category Preview
            </CardTitle>
            <CardDescription>
              Preview how your category will appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                {form.watch("icon") ? (
                  <span className="text-xl">{form.watch("icon")}</span>
                ) : (
                  <FolderOpen className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {form.watch("name") || "Category Name"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {form.watch("description") || "No description"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {form.watch("isActive") ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {form.watch("isActive") ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

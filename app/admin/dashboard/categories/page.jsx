"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FolderOpen,
  Eye,
  EyeOff,
  Calendar,
  Image,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageLayout } from "@/components/dashboard/page-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { useCategoriesManagement } from "@/hooks/use-categories";

// Column helper for table
const columnHelper = createColumnHelper();

export default function CategoriesPage() {
  const router = useRouter();
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
    deleteCategory,
  } = useCategoriesManagement();

  // Extract data from API response
  const categories = useMemo(
    () => categoriesData?.categories || [],
    [categoriesData?.categories]
  );

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    categoryId: null,
    categoryInfo: null,
  });

  // Define table columns
  const columns = [
    columnHelper.accessor("name", {
      header: "Category",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
              {category.icon ? (
                <span className="text-lg">{category.icon}</span>
              ) : (
                <FolderOpen className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-muted-foreground">
                {category.description || "No description"}
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <Eye className="h-3 w-3 text-green-600" />
            ) : (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    }),
    columnHelper.accessor("image", {
      header: "Image",
      cell: ({ row }) => {
        const image = row.getValue("image");
        return image ? (
          <div className="flex items-center gap-2">
            <Image className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Has image</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No image</span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt");
        return (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(createdAt), "MMM dd, yyyy")}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const category = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/admin/dashboard/categories/edit?id=${category.id}`
                  )
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteCategory(category.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  // Handle category deletion
  const handleDeleteCategory = (categoryId) => {
    const category = categories.find((item) => item.id === categoryId);
    if (category) {
      setDeleteDialog({
        isOpen: true,
        categoryId,
        categoryInfo: {
          name: category.name,
          icon: category.icon,
        },
      });
    }
  };

  // Confirm category deletion
  const confirmDeleteCategory = async () => {
    if (!deleteDialog.categoryId) return;

    try {
      await deleteCategory.mutateAsync(deleteDialog.categoryId);
      setDeleteDialog({ isOpen: false, categoryId: null, categoryInfo: null });
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, categoryId: null, categoryInfo: null });
  };

  // Handle create category navigation
  const handleCreateCategory = () => {
    router.push("/admin/dashboard/categories/create");
  };

  return (
    <PageLayout
      isLoading={isLoading}
      error={isError ? error : null}
      errorMessage="Failed to load categories management. Please try refreshing the page."
    >
      <PageHeader
        title="Categories Management"
        description="Manage your menu categories and organization"
        icon={FolderOpen}
      />

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            All Categories
          </CardTitle>
          <CardDescription>
            Manage menu categories, icons, and organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={categories}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search categories by name or description..."
            showAddButton={true}
            addButtonText="Add New Category"
            onAddClick={handleCreateCategory}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete Category"
        cancelText="Cancel"
        isLoading={deleteCategory.isPending}
        userInfo={deleteDialog.categoryInfo}
      />
    </PageLayout>
  );
}

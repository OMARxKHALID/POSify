"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Utensils,
  Clock,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
import { useMenuManagement } from "@/hooks/use-menu";
import {
  formatCategoryDisplay,
  findCategoryById,
} from "@/lib/utils/category-utils";
import {
  formatPrice,
  formatPrepTime,
  getAvailabilityStatus,
  getSpecialStatus,
} from "@/lib/utils/menu-utils";

// Column helper for table
const columnHelper = createColumnHelper();

export default function MenuPage() {
  const router = useRouter();
  const {
    data: menuData,
    isLoading,
    isError,
    error,
    deleteMenuItem,
  } = useMenuManagement();

  // Extract data from API response
  const menuItems = useMemo(
    () => menuData?.menuItems || [],
    [menuData?.menuItems]
  );
  const categories = useMemo(
    () => menuData?.categories || [],
    [menuData?.categories]
  );

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    menuItemId: null,
    menuItemInfo: null,
  });

  // Define table columns
  const columns = [
    columnHelper.accessor("name", {
      header: "Menu Item",
      cell: ({ row }) => {
        const menuItem = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
              {menuItem.icon ? (
                <span className="text-lg">{menuItem.icon}</span>
              ) : (
                <Utensils className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="font-medium">{menuItem.name}</div>
              <div className="text-sm text-muted-foreground">
                {menuItem.description || "No description"}
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price");
        return (
          <div className="font-mono font-medium flex items-center gap-1">
            {formatPrice(price)}
          </div>
        );
      },
    }),
    columnHelper.accessor("categoryId", {
      header: ({ column, table }) => {
        return (
          <div className="flex items-center gap-2">
            <span>Category</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[150px]">
                <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={!column.getFilterValue()}
                  onCheckedChange={() => column.setFilterValue(undefined)}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={column.getFilterValue() === "uncategorized"}
                  onCheckedChange={(checked) =>
                    column.setFilterValue(checked ? "uncategorized" : undefined)
                  }
                >
                  Uncategorized
                </DropdownMenuCheckboxItem>
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category.id}
                    checked={column.getFilterValue() === category.id}
                    onCheckedChange={(checked) =>
                      column.setFilterValue(checked ? category.id : undefined)
                    }
                  >
                    {formatCategoryDisplay(category)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId");
        const category = findCategoryById(categories, categoryId);
        return (
          <Badge variant="secondary">{formatCategoryDisplay(category)}</Badge>
        );
      },
    }),
    columnHelper.accessor("available", {
      header: "Status",
      cell: ({ row }) => {
        const available = row.getValue("available");
        const status = getAvailabilityStatus(available);
        return (
          <div className="flex items-center gap-2">
            {available ? (
              <Eye className="h-3 w-3 text-green-600" />
            ) : (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
            <Badge variant={status.variant}>{status.text}</Badge>
          </div>
        );
      },
    }),
    columnHelper.accessor("prepTime", {
      header: "Prep Time",
      cell: ({ row }) => {
        const prepTime = row.getValue("prepTime");
        return (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatPrepTime(prepTime)}
          </div>
        );
      },
    }),
    columnHelper.accessor("isSpecial", {
      header: "Special",
      cell: ({ row }) => {
        const isSpecial = row.getValue("isSpecial");
        const status = getSpecialStatus(isSpecial);
        return <Badge variant={status.variant}>{status.text}</Badge>;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt");
        return (
          <div className="text-sm text-muted-foreground">
            {format(new Date(createdAt), "MMM dd, yyyy")}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const menuItem = row.original;

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
                  router.push(`/admin/dashboard/menu/edit?id=${menuItem.id}`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteMenuItem(menuItem.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  // Handle menu item deletion
  const handleDeleteMenuItem = (menuItemId) => {
    const menuItem = menuItems.find((item) => item.id === menuItemId);
    if (menuItem) {
      setDeleteDialog({
        isOpen: true,
        menuItemId,
        menuItemInfo: {
          name: menuItem.name,
          price: menuItem.price,
        },
      });
    }
  };

  // Confirm menu item deletion
  const confirmDeleteMenuItem = async () => {
    if (!deleteDialog.menuItemId) return;

    try {
      await deleteMenuItem.mutateAsync(deleteDialog.menuItemId);
      setDeleteDialog({ isOpen: false, menuItemId: null, menuItemInfo: null });
    } catch (error) {
      // Error handling is already done in the hook with toast notifications
    }
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, menuItemId: null, menuItemInfo: null });
  };

  // Handle create menu item navigation
  const handleCreateMenuItem = () => {
    router.push("/admin/dashboard/menu/create");
  };

  return (
    <PageLayout
      isLoading={isLoading}
      error={isError ? error : null}
      errorMessage="Failed to load menu management. Please try refreshing the page."
    >
      <PageHeader
        title="Menu Management"
        description="Manage your restaurant menu items, pricing, and availability"
        icon={Utensils}
      />
      {/* Menu Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            All Menu Items
          </CardTitle>
          <CardDescription>
            Manage menu items, pricing, and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={menuItems}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search menu items by name or description..."
            showAddButton={true}
            addButtonText="Add New Item"
            onAddClick={handleCreateMenuItem}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteMenuItem}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu item? This action cannot be undone."
        confirmText="Delete Item"
        cancelText="Cancel"
        isLoading={deleteMenuItem.isPending}
        userInfo={deleteDialog.menuItemInfo}
      />
    </PageLayout>
  );
}

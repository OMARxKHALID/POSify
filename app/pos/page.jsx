"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CategoryNav } from "@/components/pos/category-nav";
import { SearchBar } from "@/components/pos/search-bar";
import { MenuGrid } from "@/components/pos/menu-grid";
import { OrderCart } from "@/components/pos/order-cart";
import { ItemDetailModal } from "@/components/pos/item-detail-modal";
import { useCartStore } from "@/lib/store/use-cart-store";
import { POSHeader } from "@/components/pos/pos-header";
import { useMenu } from "@/hooks/use-menu";
import { useCategories } from "@/hooks/use-categories";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { PageLoading } from "@/components/ui/loading";
import { useMounted } from "@/hooks/use-mounted";
import SectionErrorBoundary from "@/components/ui/section-error-boundary";

/**
 * Login prompt component for unauthenticated users
 */
function LoginPrompt() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/admin/login");
  };

  return (
    <div className="h-screen w-full overflow-hidden flex items-center justify-center bg-background">
      <div className="text-center text-muted-foreground max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Login Required
        </h3>
        <p className="text-sm mb-6 text-muted-foreground">
          You need to be logged in to access the POS system. Please sign in with
          your staff or admin account.
        </p>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default function POSpage() {
  const isMounted = useMounted();
  const { data: session, status } = useSession();

  if (!isMounted) {
    return <PageLoading />;
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return <PageLoading />;
  }

  // Show login prompt if not authenticated
  if (status === "unauthenticated" || !session) {
    return <LoginPrompt />;
  }

  // Check if user has required role (admin or staff)
  const userRole = session?.user?.role;
  if (!userRole || !["admin", "staff"].includes(userRole)) {
    return (
      <div className="h-screen w-full overflow-hidden flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            Access Denied
          </h3>
          <p className="text-sm mb-6 text-muted-foreground">
            You don't have the required permissions to access the POS system.
            Only staff and admin users can use this feature.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <POSmain />;
}

export function POSmain() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { isCartOpen, toggleCart } = useCartStore();

  // Fetch menu items and categories from API
  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
  } = useMenu();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const menuItems = menuData?.menuItems || [];
  const categories = categoriesData?.categories || [];

  // Show error state if there are critical errors
  if (menuError || categoriesError) {
    return (
      <div className="h-screen w-full overflow-hidden flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            Failed to load menu data
          </h3>
          <p className="text-sm mb-6 text-muted-foreground">
            {menuError?.message ||
              categoriesError?.message ||
              "Unable to load menu items and categories"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* ---------------- Mobile Layout ---------------- */}
      <div className="flex flex-col h-full lg:hidden">
        <div className="flex flex-col flex-1 overflow-hidden bg-card">
          <div className="flex-shrink-0 p-4 space-y-3">
            <POSHeader />
            <CategoryNav
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              menuItems={menuItems}
              isLoading={categoriesLoading}
            />
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <SectionErrorBoundary
              title="Menu loading error"
              description="Unable to display menu items"
            >
              <MenuGrid
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onItemSelect={setSelectedItem}
                menuItems={menuItems}
                isLoading={menuLoading}
              />
            </SectionErrorBoundary>
          </div>
        </div>

        {isCartOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={toggleCart}
          >
            <div
              className="absolute inset-x-0 top-0 bottom-0"
              onClick={(e) => e.stopPropagation()}
            >
              <SectionErrorBoundary
                title="Cart error"
                description="Unable to display shopping cart"
              >
                <OrderCart
                  cartOpen={isCartOpen}
                  toggleCart={toggleCart}
                  isMobile
                />
              </SectionErrorBoundary>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Desktop Layout ---------------- */}
      <div className="hidden h-full lg:flex">
        {isCartOpen ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={75} minSize={50}>
              <div className="flex flex-col h-full overflow-hidden bg-card">
                <div className="flex-shrink-0 p-4 space-y-3">
                  <POSHeader />
                  <CategoryNav
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    categories={categories}
                    menuItems={menuItems}
                    isLoading={categoriesLoading}
                  />
                  <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <MenuGrid
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                    onItemSelect={setSelectedItem}
                    menuItems={menuItems}
                    isLoading={menuLoading}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={25} minSize={25} maxSize={40}>
              <OrderCart cartOpen={isCartOpen} toggleCart={toggleCart} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden bg-card">
            <div className="flex-shrink-0 p-4 space-y-3">
              <POSHeader />
              <CategoryNav
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
                menuItems={menuItems}
                isLoading={categoriesLoading}
              />
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <MenuGrid
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onItemSelect={setSelectedItem}
                menuItems={menuItems}
                isLoading={menuLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Item Modal ---------------- */}
      <ItemDetailModal
        open={!!selectedItem}
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

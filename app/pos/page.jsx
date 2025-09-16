"use client";

import { useState } from "react";
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

export default function POSpage() {
  const isMounted = useMounted();

  if (!isMounted) {
    return <PageLoading />;
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
          <div className="flex-shrink-0 p-4 space-y-4">
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

        {isCartOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={toggleCart}
          >
            <div
              className="absolute inset-x-0 top-0 bottom-0"
              onClick={(e) => e.stopPropagation()}
            >
              <OrderCart
                cartOpen={isCartOpen}
                toggleCart={toggleCart}
                isMobile
              />
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
                <div className="flex-shrink-0 p-4 space-y-4">
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

            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <OrderCart cartOpen={isCartOpen} toggleCart={toggleCart} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden bg-card">
            <div className="flex-shrink-0 p-4 space-y-4">
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

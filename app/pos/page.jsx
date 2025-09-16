"use client";

import { useState } from "react";
import { CategoryNav } from "@/components/pos/category-nav";
import { SearchBar } from "@/components/pos/search-bar";
import { MenuGrid } from "@/components/pos/menu-grid";
import { OrderCart } from "@/components/pos/order-cart";
import { ItemDetailModal } from "@/components/pos/item-detail-modal";
import { useCartStore } from "@/lib/store/use-cart-store";
import { POSHeader } from "@/components/pos/pos-header";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default function POSPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { isCartOpen, toggleCart } = useCartStore();

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

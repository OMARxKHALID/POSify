"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryNav } from "./category-nav";
import { SearchBar } from "./search-bar";
import { MenuGrid } from "./menu-grid";
import { OrderCart } from "./order-cart";
import { ItemDetailModal } from "./item-detail-modal";
import { useCartStore } from "@/lib/store/use-cart-store";

export function POSMobileContent() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { isCartOpen, toggleCart } = useCartStore();

  return (
    <div className="grid gap-3 sm:gap-4">
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            <CategoryNav
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <div className="h-[300px] sm:h-[400px] overflow-hidden">
              <MenuGrid
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onItemSelect={setSelectedItem}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={toggleCart}
        >
          <div
            className="absolute inset-x-0 top-0 bottom-0 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <OrderCart
                  cartOpen={isCartOpen}
                  toggleCart={toggleCart}
                  isMobile
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <ItemDetailModal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        selectedItem={selectedItem}
      />
    </div>
  );
}

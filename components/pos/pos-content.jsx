import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryNav } from "./category-nav";
import { SearchBar } from "./search-bar";
import { MenuGrid } from "./menu-grid";
import { OrderCart } from "./order-cart";
import { ItemDetailModal } from "./item-detail-modal";
import { useCartStore } from "@/lib/store/use-cart-store";

export function POSContent() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { isCartOpen, toggleCart } = useCartStore();

  return (
    <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] flex flex-col gap-3 sm:gap-4">
      <div
        className={`flex-1 grid min-h-0 gap-3 sm:gap-4 ${
          isCartOpen ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"
        }`}
      >
        <div
          className={
            isCartOpen
              ? "lg:col-span-3 flex flex-col min-h-0"
              : "flex flex-col min-h-0"
          }
        >
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="flex-1 flex flex-col min-h-0 p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4 flex-shrink-0">
                <CategoryNav
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              <div className="flex-1 min-h-0 mt-3 sm:mt-4">
                <MenuGrid
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  onItemSelect={setSelectedItem}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {isCartOpen && (
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <OrderCart
                  cartOpen={isCartOpen}
                  toggleCart={toggleCart}
                  isMobile={false}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ItemDetailModal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        selectedItem={selectedItem}
      />
    </div>
  );
}

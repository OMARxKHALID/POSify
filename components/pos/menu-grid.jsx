"use client";

import { MenuItemCard } from "./menu-item-card";

export function MenuGrid({ selectedCategory, searchQuery, onItemSelect }) {
  const mockItems = [
    // Burgers
    {
      id: 1,
      name: "Classic Burger",
      icon: "🍔",
      category: "Burger",
      price: 8.99,
      available: true,
    },
    {
      id: 2,
      name: "Cheeseburger",
      icon: "🧀",
      category: "Burger",
      price: 9.99,
      available: true,
    },
    {
      id: 3,
      name: "Bacon Burger",
      icon: "🥓",
      category: "Burger",
      price: 11.99,
      available: true,
    },
    {
      id: 4,
      name: "Veggie Burger",
      icon: "🥬",
      category: "Burger",
      price: 8.49,
      available: true,
    },
    {
      id: 5,
      name: "Chicken Burger",
      icon: "🍗",
      category: "Burger",
      price: 9.49,
      available: true,
    },

    // Pizza
    {
      id: 6,
      name: "Margherita Pizza",
      icon: "🍕",
      category: "Pizza",
      price: 12.5,
      available: true,
    },
    {
      id: 7,
      name: "Pepperoni Pizza",
      icon: "🍕",
      category: "Pizza",
      price: 14.99,
      available: true,
    },
    {
      id: 8,
      name: "BBQ Chicken Pizza",
      icon: "🍕",
      category: "Pizza",
      price: 15.99,
      available: true,
    },
    {
      id: 9,
      name: "Veggie Supreme",
      icon: "🍕",
      category: "Pizza",
      price: 13.99,
      available: true,
    },
    {
      id: 10,
      name: "Meat Lovers",
      icon: "🍕",
      category: "Pizza",
      price: 16.99,
      available: true,
    },

    // Sushi
    {
      id: 11,
      name: "California Roll",
      icon: "🍣",
      category: "Sushi",
      price: 9.75,
      available: true,
    },
    {
      id: 12,
      name: "Salmon Roll",
      icon: "🍣",
      category: "Sushi",
      price: 11.99,
      available: true,
    },
    {
      id: 13,
      name: "Dragon Roll",
      icon: "🍣",
      category: "Sushi",
      price: 13.99,
      available: true,
    },
    {
      id: 14,
      name: "Spicy Tuna Roll",
      icon: "🍣",
      category: "Sushi",
      price: 10.99,
      available: true,
    },
    {
      id: 15,
      name: "Rainbow Roll",
      icon: "🍣",
      category: "Sushi",
      price: 12.99,
      available: true,
    },

    // Desserts
    {
      id: 16,
      name: "Chocolate Cake",
      icon: "🍰",
      category: "Dessert",
      price: 6.0,
      available: true,
    },
    {
      id: 17,
      name: "Cheesecake",
      icon: "🧀",
      category: "Dessert",
      price: 7.99,
      available: true,
    },
    {
      id: 18,
      name: "Ice Cream",
      icon: "🍦",
      category: "Dessert",
      price: 4.99,
      available: true,
    },
    {
      id: 19,
      name: "Tiramisu",
      icon: "🍰",
      category: "Dessert",
      price: 8.99,
      available: true,
    },
    {
      id: 20,
      name: "Apple Pie",
      icon: "🥧",
      category: "Dessert",
      price: 5.99,
      available: true,
    },

    // Drinks
    {
      id: 21,
      name: "Iced Coffee",
      icon: "🥤",
      category: "Drink",
      price: 4.25,
      available: true,
    },
    {
      id: 22,
      name: "Cappuccino",
      icon: "☕",
      category: "Drink",
      price: 4.99,
      available: true,
    },
    {
      id: 23,
      name: "Fresh Juice",
      icon: "🧃",
      category: "Drink",
      price: 5.99,
      available: true,
    },
    {
      id: 24,
      name: "Smoothie",
      icon: "🥤",
      category: "Drink",
      price: 6.99,
      available: true,
    },
    {
      id: 25,
      name: "Soft Drink",
      icon: "🥤",
      category: "Drink",
      price: 2.99,
      available: true,
    },

    // Salads
    {
      id: 26,
      name: "Caesar Salad",
      icon: "🥗",
      category: "Salad",
      price: 8.99,
      available: true,
    },
    {
      id: 27,
      name: "Greek Salad",
      icon: "🥗",
      category: "Salad",
      price: 9.99,
      available: true,
    },
    {
      id: 28,
      name: "Cobb Salad",
      icon: "🥗",
      category: "Salad",
      price: 10.99,
      available: true,
    },
    {
      id: 29,
      name: "Garden Salad",
      icon: "🥗",
      category: "Salad",
      price: 7.99,
      available: true,
    },
    {
      id: 30,
      name: "Chicken Salad",
      icon: "🥗",
      category: "Salad",
      price: 11.99,
      available: true,
    },

    // Pasta
    {
      id: 31,
      name: "Spaghetti Carbonara",
      icon: "🍝",
      category: "Pasta",
      price: 13.99,
      available: true,
    },
    {
      id: 32,
      name: "Fettuccine Alfredo",
      icon: "🍝",
      category: "Pasta",
      price: 12.99,
      available: true,
    },
    {
      id: 33,
      name: "Penne Arrabbiata",
      icon: "🍝",
      category: "Pasta",
      price: 11.99,
      available: true,
    },
    {
      id: 34,
      name: "Lasagna",
      icon: "🍝",
      category: "Pasta",
      price: 14.99,
      available: true,
    },
    {
      id: 35,
      name: "Ravioli",
      icon: "🥟",
      category: "Pasta",
      price: 13.49,
      available: true,
    },

    // Appetizers
    {
      id: 36,
      name: "Chicken Wings",
      icon: "🍗",
      category: "Appetizer",
      price: 9.99,
      available: true,
    },
    {
      id: 37,
      name: "Mozzarella Sticks",
      icon: "🧀",
      category: "Appetizer",
      price: 7.99,
      available: true,
    },
    {
      id: 38,
      name: "Nachos",
      icon: "🌮",
      category: "Appetizer",
      price: 8.99,
      available: true,
    },
    {
      id: 39,
      name: "Buffalo Wings",
      icon: "🍗",
      category: "Appetizer",
      price: 10.99,
      available: true,
    },
    {
      id: 40,
      name: "Onion Rings",
      icon: "🧅",
      category: "Appetizer",
      price: 6.99,
      available: true,
    },
  ];

  // Filter items based on category and search
  const filteredItems = mockItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 p-3 sm:p-4 max-w-full">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onItemSelect={onItemSelect} />
        ))}
      </div>
    </div>
  );
}

/**
 * Order API utility functions
 * Centralized utilities for order-related API operations
 */

import { Order } from "@/models/order";
import { Menu } from "@/models/menu";
import { formatOrderData } from "@/lib/utils/format-utils";

/**
 * Validate and enrich order items with menu data
 */
export const validateAndEnrichOrderItems = async (items, organizationId) => {
  // Validate menu items exist and are available
  const menuItemIds = items.map((item) => item.menuItem);
  
  // Separate valid ObjectIds from mock/demo IDs to prevent CastError
  const validMongoIds = menuItemIds.filter(id => id.match(/^[0-9a-fA-F]{24}$/));
  const mockIds = menuItemIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));

  let menuItems = [];

  // Fetch real items from DB
  if (validMongoIds.length > 0) {
    const dbItems = await Menu.find({
      _id: { $in: validMongoIds },
      organizationId,
      available: true,
    }).lean();
    menuItems = [...dbItems];
  }

  // Fallback to mock data for demo IDs
  if (mockIds.length > 0) {
    const { mockMenuItems } = require("@/lib/mockup-data/menu-mockup");
    const fallbackItems = mockMenuItems
      .filter(item => mockIds.includes(item._id || item.id))
      .map(item => ({
        ...item,
        _id: item._id || item.id // Ensure we have _id for lookup consistency
      }));
    menuItems = [...menuItems, ...fallbackItems];
  }

  if (menuItems.length !== menuItemIds.length) {
    console.warn("Item mismatch:", { found: menuItems.length, requested: menuItemIds.length });
    // In demo mode we might want to be more lenient, but for now we follow original logic
    // unless it's strictly mock IDs being used
    if (validMongoIds.length > 0 && menuItems.length < validMongoIds.length) {
      throw new Error("INVALID_MENU_ITEMS");
    }
  }

  // Create menu item lookup
  const menuItemMap = {};
  menuItems.forEach((item) => {
    menuItemMap[item._id.toString()] = item;
  });

  // Validate and enrich order items
  return items.map((item) => {
    const menuItem = menuItemMap[item.menuItem];
    return {
      ...item,
      name: menuItem.name,
      price: menuItem.price,
      prepTime: menuItem.prepTime || item.prepTime,
    };
  });
};

/**
 * Create order with validation and enrichment
 */
export const createOrderWithValidation = async (
  organizationId,
  orderData,
  currentUserId
) => {
  const enrichedItems = await validateAndEnrichOrderItems(
    orderData.items,
    organizationId
  );

  // SECURE & OPTIMIZED: Calculate totals on a temporary instance BEFORE saving
  const tempOrder = new Order({
    ...orderData,
    items: enrichedItems,
    organizationId
  });
  tempOrder.calculateTotals();

  // SECURE: Perform a SINGLE persistent write with all data (including totals)
  const order = await Order.createWithOrderNumber(organizationId, {
    ...orderData,
    items: enrichedItems,
    servedBy: currentUserId,
    subtotal: tempOrder.subtotal,
    total: tempOrder.total,
  });

  // SECURE: Automate Inventory Decrement
  try {
    const realItemsToDecrement = enrichedItems.filter(item => 
      item.menuItem.toString().match(/^[0-9a-fA-F]{24}$/)
    );
    
    if (realItemsToDecrement.length > 0) {
      await Menu.decrementStock(organizationId, realItemsToDecrement);
    }
  } catch (inventoryError) {
    console.error("Inventory Decrement Failed:", inventoryError);
  }

  return order;
};

/**
 * Populate order with related data
 */
export const populateOrder = async (orderId, organizationId) => {
  return await Order.findOne({
    _id: orderId,
    organizationId,
  })
    .populate("servedBy", "name email")
    .populate("items.menuItem", "name price image description")
    .populate("returns.processedBy", "name email")
    .lean();
};

/**
 * Format order for API response
 */
export const formatOrderForResponse = (order) => {
  return formatOrderData(order);
};

/**
 * Handle order validation errors
 */
export const handleOrderValidationError = (error) => {
  console.error("Order validation error:", error);

  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    return {
      type: "validation",
      message: `VALIDATION_ERROR: ${validationErrors.join(", ")}`,
    };
  }

  if (error.code === 11000) {
    return {
      type: "duplicate",
      message: "ORDER_NUMBER_EXISTS",
    };
  }

  if (error.message === "INVALID_MENU_ITEMS") {
    return {
      type: "validation",
      message:
        "INVALID_MENU_ITEMS: One or more menu items are invalid or unavailable",
    };
  }

  // Handle specific error types
  if (error.message?.includes("Menu item")) {
    return {
      type: "validation",
      message: `MENU_ITEM_ERROR: ${error.message}`,
    };
  }

  return {
    type: "server",
    message: `ORDER_OPERATION_FAILED: ${error.message || "Unknown error"}`,
  };
};

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
  const menuItems = await Menu.find({
    _id: { $in: menuItemIds },
    organizationId,
    available: true,
  }).lean();

  if (menuItems.length !== menuItemIds.length) {
    throw new Error("INVALID_MENU_ITEMS");
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
  // Validate and enrich order items
  const enrichedItems = await validateAndEnrichOrderItems(
    orderData.items,
    organizationId
  );

  // Create order with auto-generated order number
  const order = await Order.createWithOrderNumber(organizationId, {
    ...orderData,
    items: enrichedItems,
    servedBy: currentUserId,
  });

  // Calculate totals
  order.calculateTotals();
  await order.save();

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
    .populate("managerApproval.approvedBy", "name email")
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

  return {
    type: "server",
    message: "ORDER_OPERATION_FAILED",
  };
};

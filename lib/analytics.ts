// Centralized analytics service for Firebase event tracking

import { analytics } from "@/lib/firebase";
import { logEvent, Analytics } from "firebase/analytics";

// Types for event parameters
type AddToCartParams = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  userId?: string;
  weight?: string;      // Added weight parameter
  grind?: string;       // Added grind parameter
  packaging?: string;   // Added packaging parameter
};

type RemoveFromCartParams = AddToCartParams;

type OrderPlacedParams = {
  orderId: string;
  amount: number;
  status: string;
  userId?: string;
};

type OrderStatusUpdateParams = {
  orderId: string;
  status: string;
  userId?: string;
};

type UserRegistrationParams = {
  userId: string;
  email: string;
};

type UserLoginParams = UserRegistrationParams;

type ProductViewParams = {
  productId: string;
  name: string;
  userId?: string;
};

// Helper to safely log events (no-op if analytics is not initialized)
export function trackEvent(
  eventName: string,
  eventParams: Record<
    string,
    string | number | boolean | undefined | unknown[]
  > = {}
) {
  if (typeof window !== "undefined" && analytics) {
    logEvent(analytics as Analytics, eventName, eventParams);
  } else {
    // Optionally, queue events or log to console in dev
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${eventName}`, eventParams);
    }
  }
}

// E-commerce specific events
export function trackAddToCart(params: AddToCartParams) {
  trackEvent("add_to_cart", {
    product_id: params.productId,
    name: params.name,
    price: params.price,
    quantity: params.quantity,
    user_id: params.userId,
    weight: params.weight,
    grind: params.grind,
    packaging: params.packaging,
  });
}

export function trackRemoveFromCart(params: RemoveFromCartParams) {
  trackEvent("remove_from_cart", {
    product_id: params.productId,
    name: params.name,
    price: params.price,
    quantity: params.quantity,
    user_id: params.userId,
    weight: params.weight,
    grind: params.grind,
    packaging: params.packaging,
  });
}

export function trackOrderPlaced(params: OrderPlacedParams) {
  trackEvent("order_placed", {
    order_id: params.orderId,
    amount: params.amount,
    status: params.status,
    user_id: params.userId,
  });
}

export function trackOrderStatusUpdate(params: OrderStatusUpdateParams) {
  trackEvent("order_status_update", {
    order_id: params.orderId,
    status: params.status,
    user_id: params.userId,
  });
}

export function trackUserRegistration(params: UserRegistrationParams) {
  trackEvent("user_registration", {
    user_id: params.userId,
    email: params.email,
  });
}

export function trackUserLogin(params: UserLoginParams) {
  trackEvent("user_login", {
    user_id: params.userId,
    email: params.email,
  });
}

export function trackProductView(params: ProductViewParams) {
  trackEvent("view_product", {
    product_id: params.productId,
    name: params.name,
    user_id: params.userId,
  });
}

// Additional e-commerce tracking functions
export function trackCartView(userId?: string) {
  trackEvent("view_cart", { user_id: userId });
}

export function trackCheckoutStarted(params: {
  userId?: string;
  cartValue: number;
  itemCount: number;
}) {
  trackEvent("begin_checkout", {
    user_id: params.userId,
    cart_value: params.cartValue,
    item_count: params.itemCount,
  });
}

export function trackSearchPerformed(params: {
  searchTerm: string;
  userId?: string;
  resultCount?: number;
}) {
  trackEvent("search", {
    search_term: params.searchTerm,
    user_id: params.userId,
    result_count: params.resultCount,
  });
}

export function trackCategoryView(params: {
  categoryId: string;
  categoryName: string;
  userId?: string;
}) {
  trackEvent("view_category", {
    category_id: params.categoryId,
    category_name: params.categoryName,
    user_id: params.userId,
  });
}

export function trackWishlistAdd(params: {
  productId: string;
  name: string;
  userId?: string;
}) {
  trackEvent("add_to_wishlist", {
    product_id: params.productId,
    name: params.name,
    user_id: params.userId,
  });
}

export function trackWishlistRemove(params: {
  productId: string;
  name: string;
  userId?: string;
}) {
  trackEvent("remove_from_wishlist", {
    product_id: params.productId,
    name: params.name,
    user_id: params.userId,
  });
}

export function trackPageView(params: {
  pagePath: string;
  pageTitle?: string;
  userId?: string;
}) {
  trackEvent("page_view", {
    page_path: params.pagePath,
    page_title: params.pageTitle,
    user_id: params.userId,
  });
}

// Advanced e-commerce tracking
export function trackPurchase(params: {
  orderId: string;
  value: number;
  currency?: string;
  items: Array<{
    productId: string;
    name: string;
    category?: string;
    quantity: number;
    price: number;
    weight?: string;
    grind?: string;
    packaging?: string;
  }>;
  userId?: string;
}) {
  trackEvent("purchase", {
    order_id: params.orderId,
    value: params.value,
    currency: params.currency || "USD",
    items: params.items.map(item => ({
      product_id: item.productId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      weight: item.weight,
      grind: item.grind,
      packaging: item.packaging,
    })),
    user_id: params.userId,
  });
}

export function trackBestSellingProducts(params: {
  products: Array<{
    productId: string;
    name: string;
    category?: string;
    salesCount: number;
    revenue: number;
  }>;
  timeframe: string;
}) {
  trackEvent("best_selling_products", {
    products: params.products,
    timeframe: params.timeframe,
  });
}

export function trackOrderDetails(params: {
  orderId: string;
  orderNumber: string;
  status: string;
  value: number;
  itemCount: number;
  paymentMethod: string;
  shippingMethod?: string;
  userId?: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    weight?: string;
    grind?: string;
    packaging?: string;
  }>;
}) {
  trackEvent("order_details", {
    order_id: params.orderId,
    order_number: params.orderNumber,
    status: params.status,
    value: params.value,
    item_count: params.itemCount,
    payment_method: params.paymentMethod,
    shipping_method: params.shippingMethod,
    user_id: params.userId,
    products: params.products.map(p => ({
      product_id: p.productId,
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      weight: p.weight,
      grind: p.grind,
      packaging: p.packaging,
    })),
  });
}

export function trackOrderFullfillment(params: {
  orderId: string;
  status: string;
  previousStatus: string;
  value: number;
  fulfillmentTime?: number;
  userId?: string;
}) {
  trackEvent("order_fulfillment", {
    order_id: params.orderId,
    status: params.status,
    previous_status: params.previousStatus,
    value: params.value,
    fulfillment_time: params.fulfillmentTime,
    user_id: params.userId,
  });
}

export function trackInventoryAction(params: {
  productId: string;
  name: string;
  action: "restock" | "low_stock" | "out_of_stock";
  currentStock: number;
  previousStock?: number;
}) {
  trackEvent("inventory_action", {
    product_id: params.productId,
    name: params.name,
    action: params.action,
    current_stock: params.currentStock,
    previous_stock: params.previousStock,
  });
}

/**
 * Track customer lifetime analytics
 */
export function trackCustomerLifetime(
  userId: string,
  totalSpent: number,
  orderCount: number,
  avgOrderValue: number
) {
  if (typeof window !== "undefined" && analytics) {
    logEvent(analytics, "customer_lifetime_value", {
      user_id: userId,
      total_spent: totalSpent,
      order_count: orderCount,
      average_order_value: avgOrderValue,
      ltv_segment:
        totalSpent > 1000
          ? "high_value"
          : totalSpent > 500
          ? "medium_value"
          : "low_value",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track product search events
 */
export function trackProductSearch(
  searchTerm: string,
  resultsCount: number,
  category?: string,
  filters?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && analytics) {
    logEvent(analytics, "search", {
      search_term: searchTerm,
      results_count: resultsCount,
      category: category || "all",
      filters: JSON.stringify(filters || {}),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track category view events with enhanced data
 */
export function trackCategoryViewEnhanced(
  categoryName: string,
  categoryId: string,
  productCount: number
) {
  if (typeof window !== "undefined" && analytics) {
    logEvent(analytics, "view_item_list", {
      item_list_id: categoryId,
      item_list_name: categoryName,
      items_count: productCount,
      list_type: "category",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track enhanced user registration events
 */
export function trackUserRegistrationEnhanced(
  userId: string,
  registrationMethod: "email" | "google" | "facebook" | "other"
) {
  if (typeof window !== "undefined" && analytics) {
    logEvent(analytics, "sign_up", {
      method: registrationMethod,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track enhanced user login events
 */
export function trackUserLoginEnhanced(
  userId: string,
  loginMethod: "email" | "google" | "facebook" | "other"
) {
  if (typeof window !== "undefined" && analytics) {
    logEvent(analytics, "login", {
      method: loginMethod,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  }
}
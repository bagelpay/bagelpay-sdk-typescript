/**
 * BagelPay API Models
 */

/**
 * Customer data for checkout session
 */
export interface Customer {
  email: string;
}

/**
 * Request model for creating a checkout session
 */
export interface CheckoutRequest {
  productId: string;
  customer?: Customer;
  requestId?: string;
  units?: string;
  successUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Response model for checkout session
 */
export interface CheckoutResponse {
  object?: string;
  units?: number;
  metadata?: Record<string, any>;
  status?: string;
  mode?: string;
  paymentId?: string;
  productId?: string;
  requestId?: string;
  successUrl?: string;
  checkoutUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresOn?: string;
}

/**
 * Request model for creating a product
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingType: string;
  taxInclusive: boolean;
  taxCategory: string;
  recurringInterval: string;
  trialDays: number;
}

/**
 * Product model
 */
export interface Product {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  object?: string;
  mode?: string;
  productId?: string;
  storeId?: string;
  productUrl?: string;
  billingType?: string;
  billingPeriod?: string;
  taxCategory?: string;
  taxInclusive?: boolean;
  isArchive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  trialDays?: number;
  recurringInterval?: string;
}

/**
 * Product list response
 */
export interface ProductListResponse {
  total: number;
  items: Product[];
  code: number;
  msg: string;
}

/**
 * Request model for updating a product
 */
export interface UpdateProductRequest {
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingType: string;
  taxInclusive: boolean;
  taxCategory: string;
  recurringInterval: string;
  trialDays: number;
}

/**
 * Transaction customer model
 */
export interface TransactionCustomer {
  id?: string;
  email?: string;
}

/**
 * Transaction model
 */
export interface Transaction {
  object?: string;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  amountPaid?: number;
  discountAmount?: number;
  currency?: string;
  taxAmount?: number;
  taxCountry?: string;
  refundedAmount?: number;
  type?: string;
  customer?: TransactionCustomer;
  createdAt?: string;
  updatedAt?: string;
  remark?: string;
  mode?: string;
  fees?: number;
  tax?: number;
  net?: number;
}

/**
 * Transaction list response
 */
export interface TransactionListResponse {
  total: number;
  items: Transaction[];
  code: number;
  msg: string;
}

/**
 * Subscription customer model
 */
export interface SubscriptionCustomer {
  id?: string;
  email?: string;
}

/**
 * Subscription model
 */
export interface Subscription {
  status?: string;
  remark?: string;
  customer?: SubscriptionCustomer;
  mode?: string;
  last4?: string;
  subscriptionId?: string;
  productId?: string;
  storeId?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  cancelAt?: string;
  trialStart?: string;
  trialEnd?: string;
  units?: number;
  createdAt?: string;
  updatedAt?: string;
  productName?: string;
  paymentMethod?: string;
  nextBillingAmount?: string;
  recurringInterval?: string;
}

/**
 * Subscription list response
 */
export interface SubscriptionListResponse {
  total: number;
  items: Subscription[];
  code: number;
  msg: string;
}

/**
 * Customer data model
 */
export interface CustomerData {
  id?: number;
  name?: string;
  email?: string;
  remark?: string;
  subscriptions?: number;
  payments?: number;
  storeId?: string;
  totalSpend?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Customer list response
 */
export interface CustomerListResponse {
  total: number;
  items: CustomerData[];
  code: number;
  msg: string;
}

/**
 * API error model
 */
export interface ApiError {
  error: string;
  message: string;
  code?: string;
}

/**
 * Utility functions for converting between camelCase and snake_case
 */
export class ModelUtils {
  /**
   * Convert snake_case to camelCase
   */
  static toCamelCase(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => ModelUtils.toCamelCase(item));
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = ModelUtils.toCamelCase(value);
    }
    return result;
  }

  /**
   * Convert camelCase to snake_case
   */
  static toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => ModelUtils.toSnakeCase(item));
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = ModelUtils.toSnakeCase(value);
    }
    return result;
  }

  /**
   * Create CheckoutResponse from API response
   */
  static createCheckoutResponse(data: any): CheckoutResponse {
    // Extract the actual checkout data from the API response
    const checkoutData = data.data || data;
    return ModelUtils.toCamelCase(checkoutData) as CheckoutResponse;
  }

  /**
   * Create Product from API response
   */
  static createProduct(data: any): Product {
    // Extract the actual product data from the API response
    const productData = data.data || data;
    return ModelUtils.toCamelCase(productData) as Product;
  }

  /**
   * Create ProductListResponse from API response
   */
  static createProductListResponse(data: any): ProductListResponse {
    // For list responses, the data structure is already at the top level
    const response = ModelUtils.toCamelCase(data) as ProductListResponse;
    response.items = response.items.map(item => ModelUtils.toCamelCase(item));
    return response;
  }

  /**
   * Create TransactionListResponse from API response
   */
  static createTransactionListResponse(data: any): TransactionListResponse {
    // For list responses, the data structure is already at the top level
    const response = ModelUtils.toCamelCase(data) as TransactionListResponse;
    response.items = response.items.map(item => {
      const transaction = ModelUtils.toCamelCase(item) as Transaction;
      if (transaction.customer) {
        transaction.customer = ModelUtils.toCamelCase(transaction.customer);
      }
      return transaction;
    });
    return response;
  }

  /**
   * Create SubscriptionListResponse from API response
   */
  static createSubscriptionListResponse(data: any): SubscriptionListResponse {
    // For list responses, the data structure is already at the top level
    const response = ModelUtils.toCamelCase(data) as SubscriptionListResponse;
    response.items = response.items.map(item => {
      const subscription = ModelUtils.toCamelCase(item) as Subscription;
      if (subscription.customer) {
        subscription.customer = ModelUtils.toCamelCase(subscription.customer);
      }
      return subscription;
    });
    return response;
  }

  /**
   * Create Subscription from API response
   */
  static createSubscription(data: any): Subscription {
    // Extract the actual subscription data from the API response
    const subscriptionData = data.data || data;
    const subscription = ModelUtils.toCamelCase(subscriptionData) as Subscription;
    if (subscription.customer) {
      subscription.customer = ModelUtils.toCamelCase(subscription.customer);
    }
    return subscription;
  }

  /**
   * Create CustomerListResponse from API response
   */
  static createCustomerListResponse(data: any): CustomerListResponse {
    // For list responses, the data structure is already at the top level
    const response = ModelUtils.toCamelCase(data) as CustomerListResponse;
    response.items = response.items.map(item => ModelUtils.toCamelCase(item));
    return response;
  }

  /**
   * Create ApiError from API response
   */
  static createApiError(data: any): ApiError {
    return {
      error: data.error || 'Unknown error',
      message: data.msg || data.message || 'An error occurred',
      code: data.code?.toString()
    };
  }
}
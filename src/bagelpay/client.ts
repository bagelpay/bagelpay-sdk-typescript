/**
 * BagelPay API Client
 */

import {
  CheckoutRequest,
  CheckoutResponse,
  CreateProductRequest,
  Product,
  ProductListResponse,
  UpdateProductRequest,
  TransactionListResponse,
  Subscription,
  SubscriptionListResponse,
  CustomerListResponse,
  ModelUtils
} from './models.js';
import {
  BagelPayError,
  BagelPayAPIError
} from './exceptions.js';

/**
 * Configuration options for BagelPayClient
 */
export interface BagelPayClientConfig {
  /** API key for authentication */
  apiKey: string;
  /** Whether to use test mode (default: true) */
  testMode?: boolean;
  /** Optional custom base URL (overrides testMode) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * BagelPay API Client
 * 
 * This client provides access to the BagelPay API endpoints.
 */
export class BagelPayClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(config: BagelPayClientConfig) {
    // Determine base URL based on test mode
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl.replace(/\/$/, '');
    } else {
      this.baseUrl = config.testMode !== false 
        ? 'https://test.bagelpay.io' 
        : 'https://live.bagelpay.io';
    }

    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make HTTP request to the API
   */
  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<any> {
    const url = new URL(endpoint, this.baseUrl);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'BagelPay-TypeScript-SDK/1.0.0',
      'x-api-key': this.apiKey
    };

    const requestInit: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout)
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestInit.body = JSON.stringify(ModelUtils.toSnakeCase(data));
    }

    try {
      const response = await fetch(url.toString(), requestInit);
      
      // Check if request was successful
      if (response.status >= 400) {
        let errorData: any;
        try {
          errorData = await response.json();
          const error = ModelUtils.createApiError(errorData);
          throw new BagelPayAPIError(
            error.message,
            response.status,
            error.code,
            error
          );
        } catch (parseError) {
          if (parseError instanceof BagelPayAPIError) {
            throw parseError;
          }
          // Response is not JSON
          throw new BagelPayAPIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
      }

      let responseData: any;
      try {
        responseData = await response.json();
        
        // Check if the response contains an error even with 200 status
        if (responseData && typeof responseData === 'object' && 'msg' in responseData && 'code' in responseData) {
          // This looks like an error response
          if ([401, 403, 404, 400, 422, 500].includes(responseData.code)) {
            const error = ModelUtils.createApiError(responseData);
            throw new BagelPayAPIError(
              error.message,
              responseData.code || response.status,
              error.code,
              error
            );
          }
        }
        
        return responseData;
      } catch (parseError) {
        if (parseError instanceof BagelPayAPIError) {
          throw parseError;
        }
        // Response is not JSON
        throw new BagelPayError(`Invalid JSON response: ${await response.text()}`);
      }
      
    } catch (error) {
      if (error instanceof BagelPayError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new BagelPayError(`Request timeout after ${this.timeout}ms`);
        }
        throw new BagelPayError(`Request failed: ${error.message}`);
      }
      throw new BagelPayError(`Request failed: ${String(error)}`);
    }
  }

  /**
   * Create a new checkout session
   */
  async createCheckout(checkoutRequest: CheckoutRequest): Promise<CheckoutResponse> {
    const data = await this.makeRequest(
      'POST',
      '/api/payments/checkouts',
      checkoutRequest
    );
    return ModelUtils.createCheckoutResponse(data);
  }

  /**
   * Create a new product
   */
  async createProduct(productRequest: CreateProductRequest): Promise<Product> {
    const data = await this.makeRequest(
      'POST',
      '/api/products/create',
      productRequest
    );
    return ModelUtils.createProduct(data);
  }

  /**
   * List products with pagination
   */
  async listProducts(
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<ProductListResponse> {
    const params = {
      pageNum,
      pageSize
    };
    
    const data = await this.makeRequest(
      'GET',
      '/api/products/list',
      undefined,
      params
    );
    return ModelUtils.createProductListResponse(data);
  }

  /**
   * Get product details by ID
   */
  async getProduct(productId: string): Promise<Product> {
    const data = await this.makeRequest(
      'GET',
      `/api/products/${productId}`
    );
    return ModelUtils.createProduct(data);
  }

  /**
   * Archive a product
   */
  async archiveProduct(productId: string): Promise<Product> {
    const data = await this.makeRequest(
      'POST',
      `/api/products/${productId}/archive`
    );
    return ModelUtils.createProduct(data);
  }

  /**
   * Unarchive a product
   */
  async unarchiveProduct(productId: string): Promise<Product> {
    const data = await this.makeRequest(
      'POST',
      `/api/products/${productId}/unarchive`
    );
    return ModelUtils.createProduct(data);
  }

  /**
   * Update a product
   */
  async updateProduct(request: UpdateProductRequest): Promise<Product> {
    const data = await this.makeRequest(
      'POST',
      '/api/products/update',
      request
    );
    return ModelUtils.createProduct(data);
  }

  /**
   * List transactions with pagination
   */
  async listTransactions(
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<TransactionListResponse> {
    const params = {
      pageNum,
      pageSize
    };
    
    const data = await this.makeRequest(
      'GET',
      '/api/transactions/list',
      undefined,
      params
    );
    return ModelUtils.createTransactionListResponse(data);
  }

  /**
   * List subscriptions with pagination
   */
  async listSubscriptions(
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<SubscriptionListResponse> {
    const params = {
      pageNum,
      pageSize
    };
    
    const data = await this.makeRequest(
      'GET',
      '/api/subscriptions/list',
      undefined,
      params
    );
    return ModelUtils.createSubscriptionListResponse(data);
  }

  /**
   * Get subscription details by ID
   */
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const data = await this.makeRequest(
      'GET',
      `/api/subscriptions/${subscriptionId}`
    );
    return ModelUtils.createSubscription(data);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const data = await this.makeRequest(
      'POST',
      `/api/subscriptions/${subscriptionId}/cancel`
    );
    return ModelUtils.createSubscription(data);
  }

  /**
   * List customers with pagination
   */
  async listCustomers(
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<CustomerListResponse> {
    const params = {
      pageNum,
      pageSize
    };
    
    const data = await this.makeRequest(
      'GET',
      '/api/customers/list',
      undefined,
      params
    );
    return ModelUtils.createCustomerListResponse(data);
  }
}
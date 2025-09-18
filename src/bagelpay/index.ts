/**
 * BagelPay TypeScript SDK
 * 
 * A TypeScript client library for the BagelPay API.
 * 
 * Example usage:
 * ```typescript
 * import { BagelPayClient, CheckoutRequest, Customer } from 'bagelpay';
 * 
 * // 1. Initialize the client
 * const client = new BagelPayClient({
 *   baseUrl: 'https://test.bagelpay.io',
 *   apiKey: 'your-test-api-key-here'
 * });
 * 
 * // 2. Create a payment session
 * const checkoutRequest: CheckoutRequest = {
 *   productId: 'prod_123456789',
 *   requestId: `req_${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}`,
 *   units: '1',
 *   customer: {
 *     email: 'customer@example.com'
 *   },
 *   successUrl: 'https://yoursite.com/success',
 *   metadata: {
 *     orderId: `req_${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}`
 *   }
 * };
 * 
 * // 3. Get payment URL
 * const response = await client.createCheckout(checkoutRequest);
 * console.log(`Payment URL: ${response.checkoutUrl}`);
 * ```
 */

export const VERSION = '1.0.3';
export const AUTHOR = 'andrew@gettrust.ai';
export const EMAIL = 'support@bagelpayment.com';

// Export main classes and exceptions
export { BagelPayClient } from './client.js';

// Export models
export type {
  CheckoutRequest,
  CheckoutResponse,
  CreateProductRequest,
  Product,
  ProductListResponse,
  Customer,
  ApiError,
  Transaction,
  TransactionCustomer,
  TransactionListResponse,
  Subscription,
  SubscriptionCustomer,
  SubscriptionListResponse,
  CustomerData,
  CustomerListResponse
} from './models.js';

// Export exceptions
export {
  BagelPayError,
  BagelPayAPIError,
  BagelPayAuthenticationError,
  BagelPayValidationError,
  BagelPayNotFoundError,
  BagelPayRateLimitError,
  BagelPayServerError
} from './exceptions.js';
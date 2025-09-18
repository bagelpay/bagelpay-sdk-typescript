# BagelPay TypeScript SDK

Official TypeScript SDK for the BagelPay payment platform. Easily integrate subscription billing, one-time payments, and customer management into your TypeScript/JavaScript applications.

## Installation

```bash
npm install bagelpay
```

## Quick Start
```typescript
import { BagelPayClient } from 'bagelpay';

async function main() {
  // Initialize the client
  const client = new BagelPayClient({
    apiKey: 'your-api-key',
    testMode: true, // Use false for production
    timeout: 30000 // Optional: 30 seconds timeout
  });

  try {
    // Create a product
    const product = await client.createProduct({
      name: `Premium Subscription ${Date.now()}`,
      description: 'Monthly premium subscription with unique identifier',
      price: 29.99,
      currency: 'USD',
      billingType: 'subscription',
      taxInclusive: false,
      taxCategory: 'digital_products',
      recurringInterval: 'monthly',
      trialDays: 7
    });

    console.log('✅ Product url:', product.productUrl);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the main function
main().catch(console.error);
```

## Core Features

### 🛍️ Product Management
- Create and manage products
- Support for both subscriptions and one-time payments
- Flexible pricing and billing intervals
- Tax configuration options

### 💳 Checkout & Payments
- Secure checkout session creation
- Customizable success/cancel URLs
- Metadata support for tracking
- Real-time payment status

### 👥 Customer Management
- Customer creation and retrieval
- Subscription management
- Payment history tracking

### 📊 Analytics & Reporting
- Transaction listing and filtering
- Subscription analytics
- Customer insights

## API Reference

### Client Initialization

```typescript
const client = new BagelPayClient({
  apiKey: string,        // Your BagelPay API key
  testMode?: boolean,    // Default: false
  timeout?: number,      // Default: 30000ms
  baseUrl?: string       // Default: https://test.bagelpay.io
});
```

### Products

#### Create Product
```typescript
const product = await client.createProduct({
  name: string,
  description: string,
  price: number,
  currency: string,
  billingType: 'subscription' | 'single_payment',
  taxInclusive: boolean,
  taxCategory: string,
  recurringInterval: 'daily' | 'weekly' | 'monthly' | '3months' | '6months',
  trialDays: number
});
```

#### List Products
```typescript
const products = await client.listProducts(page, limit);
```

#### Get Product
```typescript
const product = await client.getProduct(productId);
```

### Checkout

#### Create Checkout Session
```typescript
const checkout = await client.createCheckout({
  productId: string,
  requestId?: string,
  units?: string,
  customer?: { email: string },
  successUrl?: string,
  metadata?: Record<string, any>
});
```

### Transactions

#### List Transactions
```typescript
const transactions = await client.listTransactions(page, limit);
```

### Subscriptions

#### List Subscriptions
```typescript
const subscriptions = await client.listSubscriptions(page, limit);
```

### Customers

#### List Customers
```typescript
const customers = await client.listCustomers(page, limit);
```

## Error Handling

The SDK provides specific error types for better error handling:

```typescript
import { BagelPayAPIError, BagelPayError } from 'bagelpay';

try {
  const result = await client.createProduct(productData);
} catch (error) {
  if (error instanceof BagelPayAPIError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
  } else if (error instanceof BagelPayError) {
    console.error('SDK Error:', error.message);
  } else {
    console.error('Unknown Error:', error);
  }
}
```


## TypeScript Support

The SDK is written in TypeScript and provides full type definitions out of the box. No additional `@types` packages are required.

```typescript
// All types are automatically inferred
const product: Product = await client.createProduct(productData);
const checkout: CheckoutResponse = await client.createCheckout(checkoutData);
```

## Environment Configuration

### Test Mode
Use test mode for development and testing:

```typescript
const client = new BagelPayClient({
  apiKey: 'bagel_test_your_test_key',
  testMode: true
});
```

### Production Mode
For production environments:

```typescript
const client = new BagelPayClient({
  apiKey: 'bagel_live_your_live_key',
  testMode: false
});
```

## Support

- **Documentation**: [https://bagelpay.gitbook.io/docs/documentation](https://bagelpay.gitbook.io/docs/documentation)
- **API Reference**: [https://bagelpay.gitbook.io/docs/apireference](https://bagelpay.gitbook.io/docs/apireference)
- **Support**: [support@bagelpayent.com](mailto:support@bagelpayent.com)
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/bagelpay/bagelpay-sdk-typescript/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

**Ready to get started?** [Sign up for a BagelPay account](https://bagelpay.io) and get your API keys today!
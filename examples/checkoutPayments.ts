#!/usr/bin/env node
/**
 * BagelPay SDK - Checkout and Payment Examples
 *
 * This example demonstrates checkout session creation and payment handling:
 * - Creating checkout sessions for different product types
 * - Handling customer information
 * - Setting up success/cancel URLs
 * - Managing checkout metadata
 * - Payment status tracking
 * - Error handling for checkout scenarios
 *
 * Before running this example:
 * 1. Install the SDK: npm install bagelpay
 * 2. Set your API key as an environment variable: export BAGELPAY_API_KEY="your_api_key_here"
 * 3. Optionally set test mode: export BAGELPAY_TEST_MODE="false" (defaults to true)
 */

import { BagelPayClient } from '../src/bagelpay/client.js';
import {
  Customer,
  CheckoutRequest,
  CheckoutResponse,
  CreateProductRequest,
  Product
} from '../src/bagelpay/models.js';
import {
  BagelPayError,
  BagelPayAPIError,
  BagelPayAuthenticationError,
  BagelPayValidationError,
  BagelPayNotFoundError
} from '../src/bagelpay/exceptions.js';

/**
 * Initialize and return a BagelPay client.
 */
function getClient(apiKey?: string, baseUrl?: string): BagelPayClient {
  // Get API key from environment variable if not provided
  if (!apiKey) {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.BAGELPAY_API_KEY;
    }
  }

  if (!apiKey) {
    throw new Error(
      "API key is required. Set BAGELPAY_API_KEY environment variable with: export BAGELPAY_API_KEY='your_api_key_here'"
    );
  }

  // Use test mode by default for examples
  const testMode = typeof process !== 'undefined' && process.env ? 
    process.env.BAGELPAY_TEST_MODE?.toLowerCase() !== 'false' : true;

  // Initialize the client
  const config = {
    apiKey,
    testMode,
    timeout: 30000, // 30 seconds timeout
    ...(baseUrl && { baseUrl })
  };

  const client = new BagelPayClient(config);

  console.log(`✅ BagelPay client initialized`);
  console.log(`   Mode: ${testMode ? 'Test' : 'Live'}`);
  console.log(`   Base URL: ${baseUrl || (testMode ? 'https://test.bagelpay.io' : 'https://live.bagelpay.io')}`);
  console.log(`   API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);

  return client;
}

/**
 * Create a test product for checkout examples.
 */
async function createTestProduct(client: BagelPayClient, productType: 'single_payment' | 'subscription'): Promise<string> {
  console.log(`\n📦 Creating ${productType} product for checkout examples...`);

  try {
    let productRequest: CreateProductRequest;

    switch (productType) {
      case 'single_payment':
        productRequest = {
          name: "Single_payment_" + Math.floor(Math.random() * 9000 + 1000),
          description: "Complete single_payment with lifetime access",
          price: 49.99,
          currency: "USD",
          billingType: "single_payment",
          taxInclusive: false,
          taxCategory: "digital_products",
          recurringInterval: "",
          trialDays: 0
        };
        break;
      case 'subscription':
        productRequest = {
          name: "Subscription_" + Math.floor(Math.random() * 9000 + 1000),
          description: "Monthly subscription with all features",
          price: 20.99,
          currency: "USD",
          billingType: "subscription",
          taxInclusive: false,
          taxCategory: "saas_services",
          recurringInterval: "monthly",
          trialDays: 7
        };
        break;
    }

    const product = await client.createProduct(productRequest);
    console.log(`✅ ${productType} product created: ${product.productId}`);
    return product.productId!;

  } catch (error) {
    console.log(`❌ Failed to create ${productType} product: ${error}`);
    throw error;
  }
}

/**
 * Create a basic checkout session.
 */
async function createBasicCheckout(client: BagelPayClient, productId: string): Promise<CheckoutResponse> {
  console.log(`\n💳 Creating basic checkout session for product ${productId}...`);

  try {
    const customer: Customer = {
      email: "customer@example.com"
    };

    const checkoutRequest: CheckoutRequest = {
      productId,
      requestId: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      units: "1",
      customer
    };

    const checkout = await client.createCheckout(checkoutRequest);

    console.log(`✅ Basic checkout session created successfully!`);
    console.log(`   Payment ID: ${checkout.paymentId}`);
    console.log(`   Status: ${checkout.status}`);
    console.log(`   Checkout URL: ${checkout.checkoutUrl}`);
    console.log(`   Expires on: ${checkout.expiresOn}`);

    return checkout;

  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`❌ Validation error: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Create a checkout session with full customer information.
 */
async function createCheckoutWithFullCustomer(client: BagelPayClient, productId: string): Promise<CheckoutResponse> {
  console.log(`\n👤 Creating checkout with full customer information...`);

  try {
    const customer: Customer = {
      email: "john.doe@example.com"
    };

    const checkoutRequest: CheckoutRequest = {
      productId,
      requestId: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      units: "2",
      customer,
      successUrl: "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
      
      metadata: {
        orderId: `order_${Date.now()}`,
        campaign: "spring_sale",
        source: "website",
        customerType: "premium"
      }
    };

    const checkout = await client.createCheckout(checkoutRequest);

    console.log(`✅ Checkout with full customer info created successfully!`);
    console.log(`   Payment ID: ${checkout.paymentId}`);
    console.log(`   Status: ${checkout.status}`);
    console.log(`   Units: ${checkout.units}`);
    console.log(`   Checkout URL: ${checkout.checkoutUrl}`);
    console.log(`   Success URL: ${checkout.successUrl}`);
    console.log(`   Expires on: ${checkout.expiresOn}`);
    
    if (checkout.metadata) {
      console.log(`   Metadata:`);
      Object.entries(checkout.metadata).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    }

    return checkout;

  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`❌ Validation error: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Create a subscription checkout with trial.
 */
async function createSubscriptionCheckout(client: BagelPayClient, productId: string): Promise<CheckoutResponse> {
  console.log(`\n🔄 Creating subscription checkout with trial...`);

  try {
    const customer: Customer = {
      email: "subscriber@example.com"
    };

    const checkoutRequest: CheckoutRequest = {
      productId,
      requestId: `sub_req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      units: "1",
      customer,
      successUrl: "https://yourapp.com/welcome?subscription=true",
      
      metadata: {
        subscriptionType: "premium",
        referralCode: "FRIEND20",
        source: "landing_page"
      }
    };

    const checkout = await client.createCheckout(checkoutRequest);

    console.log(`✅ Subscription checkout created successfully!`);
    console.log(`   Payment ID: ${checkout.paymentId}`);
    console.log(`   Status: ${checkout.status}`);
    console.log(`   Checkout URL: ${checkout.checkoutUrl}`);
    console.log(`   Success URL: ${checkout.successUrl}`);
    console.log(`   Expires on: ${checkout.expiresOn}`);
    console.log(`   💡 This checkout includes a trial period as configured in the product`);

    return checkout;

  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`❌ Validation error: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Create multiple units checkout.
 */
async function createMultipleUnitsCheckout(client: BagelPayClient, productId: string): Promise<CheckoutResponse> {
  console.log(`\n📦 Creating checkout for multiple units...`);

  try {
    const customer: Customer = {
      email: "bulk.buyer@example.com"
    };

    const units = Math.floor(Math.random() * 5) + 2; // 2-6 units

    const checkoutRequest: CheckoutRequest = {
      productId,
      requestId: `bulk_req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      units: units.toString(),
      customer,
      successUrl: "https://yourapp.com/bulk-order-success",
      metadata: {
        orderType: "bulk",
        units: units.toString(),
        discount: "bulk_discount_10"
      }
    };

    const checkout = await client.createCheckout(checkoutRequest);

    console.log(`✅ Multiple units checkout created successfully!`);
    console.log(`   Payment ID: ${checkout.paymentId}`);
    console.log(`   Status: ${checkout.status}`);
    console.log(`   Units: ${checkout.units}`);
    console.log(`   Checkout URL: ${checkout.checkoutUrl}`);
    console.log(`   Expires on: ${checkout.expiresOn}`);

    return checkout;

  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`❌ Validation error: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Demonstrate checkout validation and error handling.
 */
async function checkoutValidationExamples(client: BagelPayClient): Promise<void> {
  console.log(`\n🚨 Checkout validation and error handling examples...`);

  // Test 1: Invalid product ID
  console.log(`\n1. Testing checkout with invalid product ID...`);
  try {
    const invalidCheckout: CheckoutRequest = {
      productId: "invalid_product_id",
      customer: { email: "test@example.com" }
    };

    await client.createCheckout(invalidCheckout);
    console.log(`   ❌ Should have failed but didn't!`);
  } catch (error) {
    if (error instanceof BagelPayNotFoundError) {
      console.log(`   ✅ Correctly caught not found error: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`   ✅ Correctly caught API error: ${error.message}`);
    } else {
      console.log(`   ❌ Unexpected error type: ${error}`);
    }
  }

  // Test 2: Invalid customer email
  console.log(`\n2. Testing checkout with invalid customer email...`);
  try {
    // First create a valid product
    const productRequest: CreateProductRequest = {
      name: "Test_Product_" + Math.floor(Math.random() * 9000 + 1000),
      description: "Test product for validation",
      price: 10.00,
      currency: "USD",
      billingType: "single_payment",
      taxInclusive: false,
      taxCategory: "digital_products",
      recurringInterval: "",
      trialDays: 0
    };

    const product = await client.createProduct(productRequest);

    const invalidCheckout: CheckoutRequest = {
      productId: product.productId!,
      customer: { email: "invalid-email-format" } // Invalid email
    };

    await client.createCheckout(invalidCheckout);
    console.log(`   ❌ Should have failed but didn't!`);
  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`   ✅ Correctly caught validation error: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`   ✅ Correctly caught API error: ${error.message}`);
    } else {
      console.log(`   ❌ Unexpected error type: ${error}`);
    }
  }

  // Test 3: Invalid units
  console.log(`\n3. Testing checkout with invalid units...`);
  try {
    // Use the same product from test 2
    const productsResponse = await client.listProducts(1, 1);
    if (productsResponse.items.length === 0) {
      console.log(`   ⏭️ Skipping - no products available`);
      return;
    }

    const invalidCheckout: CheckoutRequest = {
      productId: productsResponse.items[0].productId!,
      customer: { email: "test@example.com" },
      units: "0" // Invalid units (should be > 0)
    };

    await client.createCheckout(invalidCheckout);
    console.log(`   ❌ Should have failed but didn't!`);
  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`   ✅ Correctly caught validation error: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`   ✅ Correctly caught API error: ${error.message}`);
    } else {
      console.log(`   ❌ Unexpected error type: ${error}`);
    }
  }

  console.log(`\n✅ Checkout validation examples completed.`);
}


/**
 * Main function to run all checkout and payment examples.
 */
export async function main(): Promise<void> {
  console.log("🥯 BagelPay TypeScript SDK - Checkout and Payment Examples");
  console.log("=" .repeat(65));

  try {
    // Initialize client
    const client = getClient(
    );

    // Create test products
    const digitalProductId = await createTestProduct(client, 'single_payment');
    const subscriptionProductId = await createTestProduct(client, 'subscription');

    // Create different types of checkout sessions
    const basicCheckout = await createBasicCheckout(client, digitalProductId);
    const subscriptionCheckout = await createSubscriptionCheckout(client, subscriptionProductId);
    const multipleUnitsCheckout = await createMultipleUnitsCheckout(client, digitalProductId);

    console.log("\n🎉 All checkout and payment examples completed successfully!");
    console.log("\n💡 Key takeaways:");
    console.log("   - Always provide valid customer email addresses");
    console.log("   - Use meaningful request IDs for tracking");
    console.log("   - Set appropriate success and cancel URLs");
    console.log("   - Include metadata for better order tracking");
    console.log("   - Handle validation errors gracefully");
    console.log("   - Test checkout flows in test mode before going live");
    console.log("\n🔗 Next steps:");
    console.log("   - Implement webhook handling for payment status updates");
    console.log("   - Set up proper success and cancel page handling");
    console.log("   - Configure your payment methods and currencies");
    console.log("   - Test the complete checkout flow end-to-end");

  } catch (error) {
    console.error("\n💥 Checkout and payment examples failed:", error);
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
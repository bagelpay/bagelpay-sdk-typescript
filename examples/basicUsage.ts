#!/usr/bin/env node
/**
 * BagelPay SDK - Basic Usage Examples
 *
 * This example demonstrates the basic usage of the BagelPay SDK including:
 * - Client initialization
 * - Product management (create, list, get, update)
 * - Checkout session creation
 * - Transaction listing
 * - Error handling
 *
 * Before running this example:
 * 1. Install the SDK: npm install bagelpay
 * 2. Set your API key as an environment variable: export BAGELPAY_API_KEY="your_api_key_here"
 * 3. Optionally set test mode: export BAGELPAY_TEST_MODE="false" (defaults to true)
 */

import { BagelPayClient } from '../dist/bagelpay/client.js';
import type {
  Customer,
  CheckoutRequest,
  CreateProductRequest,
  UpdateProductRequest,
  Subscription,
  SubscriptionListResponse,
  CustomerListResponse
} from '../src/bagelpay/models.js';
import {
  BagelPayError,
  BagelPayAPIError,
  BagelPayAuthenticationError,
  BagelPayValidationError,
  BagelPayNotFoundError
} from '../dist/bagelpay/exceptions.js';

/**
 * Initialize and return a BagelPay client.
 */
function getClient(apiKey?: string, baseUrl?: string): BagelPayClient {
  // Get API key from parameter or environment variable
  if (!apiKey) {
    apiKey = process.env.BAGELPAY_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      "API key is required. Either pass it as a parameter or " +
      "set BAGELPAY_API_KEY environment variable with: export BAGELPAY_API_KEY='your_api_key_here'"
    );
  }

  // Use test mode by default for examples
  const testMode = process.env.BAGELPAY_TEST_MODE?.toLowerCase() !== 'false';

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
 * Create a sample product and return its product_id.
 */
async function createSampleProduct(client: BagelPayClient): Promise<string> {
  console.log("\n📦 Creating a sample product...");

  try {
    // Create a product request
    const productRequest: CreateProductRequest = {
      name: "Product_TS_" + Math.floor(Math.random() * 9000 + 1000),
      description: "Description_of_product_" + Math.floor(Math.random() * 9000 + 1000),
      price: Math.random() * (1024.5 - 50.5) + 50.5,
      currency: "USD",
      billingType: ["subscription", "subscription", "subscription", "single_payment"][Math.floor(Math.random() * 4)],
      taxInclusive: false,
      taxCategory: ["digital_products", "saas_services", "ebooks"][Math.floor(Math.random() * 3)],
      recurringInterval: ["daily", "weekly", "monthly", "3months", "6months"][Math.floor(Math.random() * 5)],
      trialDays: [0, 1, 7][Math.floor(Math.random() * 3)]
    };

    // Create the product
    const product = await client.createProduct(productRequest);

    console.log(`✅ Product created successfully!`);
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Billing Type: ${product.billingType}`);
    console.log(`   Name: ${product.name}`);
    if (product.recurringInterval) {
      console.log(`   Price: $${product.price}/${product.recurringInterval} ${product.currency}`);
    } else {
      console.log(`   Price: $${product.price} ${product.currency}`);
    }
    console.log(`   URL: ${product.productUrl}`);

    return product.productId!;

  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`❌ Validation error: ${error}`);
      console.log("   Please check your product data and try again.");
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ API error: ${error}`);
      console.log(`   Status code: ${error.statusCode}`);
    } else {
      console.log(`❌ Unexpected error: ${error}`);
    }
    throw error;
  }
}

/**
 * List all products with pagination.
 */
async function listProducts(client: BagelPayClient): Promise<void> {
  console.log("\n📋 Listing products...");

  try {
    // List products with pagination
    const productsResponse = await client.listProducts(1, 10);

    console.log(`✅ Found ${productsResponse.total} total products`);
    console.log(`   Showing ${productsResponse.items.length} products on this page`);

    productsResponse.items.forEach((product, i) => {
      const status = product.isArchive ? "🗄️ Archived" : "✅ Active";
      if (product.recurringInterval) {
        console.log(`   ${i + 1}. ${product.name} (${product.productId}) - $${product.price}/${product.recurringInterval} ${product.currency} ${status}`);
      } else {
        console.log(`   ${i + 1}. ${product.name} (${product.productId}) - $${product.price} ${product.currency} ${status}`);
      }
    });

    // If there are more pages, show pagination info
    if (productsResponse.total > productsResponse.items.length) {
      const totalPages = Math.ceil(productsResponse.total / 10);
      console.log(`   📄 Page 1 of ${totalPages} (use pagination to see more)`);
    }

  } catch (error) {
    if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to list products: ${error}`);
    }
    throw error;
  }
}

/**
 * Get detailed information about a specific product.
 */
async function getProductDetails(client: BagelPayClient, productId: string): Promise<void> {
  console.log(`\n🔍 Getting details for product ${productId}...`);

  try {
    const product = await client.getProduct(productId);

    console.log(`✅ Product details:`);
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Description: ${product.description}`);
    if (product.recurringInterval) {
      console.log(`   Price: $${product.price} ${product.currency}/${product.recurringInterval}`);
    } else {
      console.log(`   Price: $${product.price} ${product.currency}`);
    }
    console.log(`   Billing: ${product.billingType}`);
    console.log(`   Tax Inclusive: ${product.taxInclusive}`);
    console.log(`   Tax Category: ${product.taxCategory}`);
    console.log(`   Status: ${product.isArchive ? 'Archived' : 'Active'}`);
    console.log(`   Created: ${product.createdAt}`);
    console.log(`   Updated: ${product.updatedAt}`);
    console.log(`   Product URL: ${product.productUrl}`);

  } catch (error) {
    if (error instanceof BagelPayNotFoundError) {
      console.log(`❌ Product not found: ${error}`);
      console.log(`   The product ${productId} does not exist or has been deleted.`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to get product details: ${error}`);
    }
    throw error;
  }
}

/**
 * Update a product's information.
 */
async function updateProduct(client: BagelPayClient, productId: string): Promise<void> {
  console.log(`\n✏️ Updating product ${productId}...`);

  try {
    // Create update request
    const updateRequest: UpdateProductRequest = {
      productId,
      name: "New_Product_TS_" + Math.floor(Math.random() * 9000 + 1000),
      description: "New_Description_of_product_" + Math.floor(Math.random() * 9000 + 1000),
      price: Math.random() * (1024.5 - 50.5) + 50.5,
      currency: "USD",
      billingType: ["subscription", "subscription", "single_payment"][Math.floor(Math.random() * 3)],
      taxInclusive: false,
      taxCategory: ["digital_products", "saas_services", "ebooks"][Math.floor(Math.random() * 3)],
      recurringInterval: ["daily", "weekly", "monthly", "3months", "6months"][Math.floor(Math.random() * 5)],
      trialDays: [0, 1, 7][Math.floor(Math.random() * 3)]
    };

    // Update the product
    const updatedProduct = await client.updateProduct(updateRequest);

    console.log(`✅ Product updated successfully!`);
    console.log(`   New name: ${updatedProduct.name}`);
    console.log(`   New price: $${updatedProduct.price} ${updatedProduct.currency}`);
    console.log(`   Updated at: ${updatedProduct.updatedAt}`);

  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`❌ Validation error during update: ${error}`);
    } else if (error instanceof BagelPayNotFoundError) {
      console.log(`❌ Product not found for update: ${error}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to update product: ${error}`);
    }
    throw error;
  }
}

/**
 * Create a checkout session for a product.
 */
async function createCheckoutSession(client: BagelPayClient, productId: string): Promise<string> {
  console.log(`\n💳 Creating checkout session for product ${productId}...`);

  try {
    // Create customer information
    const customer: Customer = { email: "andrew@gettrust.ai" };

    // Create checkout request
    const checkoutRequest: CheckoutRequest = {
      productId,
      requestId: `req_${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}`,
      units: ["1", "2", "3", "4"][Math.floor(Math.random() * 4)],
      customer,
      successUrl: Math.random() > 0.5 ? "https://yourapp.com/success" : undefined,
      metadata: {
        orderId: `req_${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}`,
        campaign: "summer_sale",
        source: "website"
      }
    };

    // Create the checkout session
    const checkout = await client.createCheckout(checkoutRequest);

    console.log(`✅ Checkout session created successfully!`);
    console.log(`   Payment ID: ${checkout.paymentId}`);
    console.log(`   Status: ${checkout.status}`);
    console.log(`   Checkout URL: ${checkout.checkoutUrl}`);
    console.log(`   Expires on: ${checkout.expiresOn}`);
    console.log(`   Success URL: ${checkout.successUrl}`);

    return checkout.paymentId!;

  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`❌ Validation error during checkout creation: ${error}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to create checkout session: ${error}`);
    }
    throw error;
  }
}

/**
 * List recent transactions.
 */
async function listTransactions(client: BagelPayClient): Promise<void> {
  console.log("\n💰 Listing recent transactions...");

  try {
    // List transactions with pagination
    const transactionsResponse = await client.listTransactions(1, 5);

    console.log(`✅ Found ${transactionsResponse.total} total transactions`);
    console.log(`   Showing ${transactionsResponse.items.length} transactions on this page`);

    transactionsResponse.items.forEach((transaction, i) => {
      console.log(`   ${i + 1}. Transaction ${transaction.transactionId}`);
      console.log(`      Amount: $${(transaction.amount! / 100).toFixed(2)} ${transaction.currency}`);
      console.log(`      Type: ${transaction.type}`);
      console.log(`      Customer: ${transaction.customer?.email || 'N/A'}`);
      console.log(`      Created: ${transaction.createdAt}`);
      if (transaction.remark) {
        console.log(`      Remark: ${transaction.remark}`);
      }
      console.log();
    });

  } catch (error) {
    if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to list transactions: ${error}`);
    }
    throw error;
  }
}

/**
 * Demonstrate archiving and unarchiving a product.
 */
async function archiveAndUnarchiveProduct(client: BagelPayClient, productId: string): Promise<void> {
  console.log(`\n🗄️ Archiving product ${productId}...`);

  try {
    // Archive the product
    const archiveResult = await client.archiveProduct(productId);
    console.log(`✅ Product archived successfully!`);
    console.log(`   Product ID: ${archiveResult.productId}`);
    console.log(`   Status: ${archiveResult.isArchive ? 'Archived' : 'Active'}`);

    // Unarchive the product
    console.log(`\n📤 Unarchiving product ${productId}...`);
    const unarchiveResult = await client.unarchiveProduct(productId);
    console.log(`✅ Product unarchived successfully!`);
    console.log(`   Product ID: ${unarchiveResult.productId}`);
    console.log(`   Status: ${unarchiveResult.isArchive ? 'Archived' : 'Active'}`);

  } catch (error) {
    if (error instanceof BagelPayNotFoundError) {
      console.log(`❌ Product not found for archive/unarchive: ${error}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to archive/unarchive product: ${error}`);
    }
    throw error;
  }
}

/**
 * Demonstrate basic subscription listing.
 */
async function listSubscriptionsBasic(client: BagelPayClient): Promise<void> {
  console.log("\n🔄 Subscription Management");
  console.log("=" .repeat(30));

  try {
    console.log("\n📋 Listing subscriptions...");
    const subscriptionsResponse = await client.listSubscriptions(1, 5);

    console.log(`Total subscriptions: ${subscriptionsResponse.total}`);

    if (subscriptionsResponse.items.length > 0) {
      console.log("\nRecent subscriptions:");
      subscriptionsResponse.items.slice(0, 3).forEach(subscription => {
        console.log(`  📦 ${subscription.subscriptionId}`);
        console.log(`     Status: ${subscription.status}`);
        console.log(`     Product: ${subscription.productName}`);
        console.log(`     Customer: ${subscription.customer?.email}`);
        console.log(`     Amount: $${subscription.nextBillingAmount}/${subscription.recurringInterval}`);
        console.log(`     Payment method: ${subscription.paymentMethod}`);
        console.log(`     Subscription Started: ${subscription.createdAt}`);
        if (subscription.trialEnd) {
          console.log(`     Trial Start: ${subscription.trialStart}`);
          console.log(`     Trial End: ${subscription.trialEnd}`);
          console.log(`     Next Billing Amount: ${subscription.nextBillingAmount}/${subscription.recurringInterval}`);
          console.log(`     Next Billing Date: ${subscription.trialEnd}`);
        } else {
          console.log(`     Next Billing Amount: ${subscription.nextBillingAmount}/${subscription.recurringInterval}`);
          console.log(`     Next Billing Date: ${subscription.billingPeriodEnd}`);
        }
        console.log();
      });
    } else {
      console.log("   No subscriptions found.");
      console.log("   💡 Create subscription products and checkout sessions to see subscriptions here.");
    }

  } catch (error) {
    if (error instanceof BagelPayAPIError) {
      console.log(`❌ API Error: ${error.message} (Code: ${error.errorCode})`);
    } else {
      console.log(`❌ Error: ${error}`);
    }
  }
}

/**
 * Demonstrate basic customer listing.
 */
async function listCustomersBasic(client: BagelPayClient): Promise<void> {
  console.log("\n👥 Customer Management");
  console.log("=" .repeat(30));

  try {
    console.log("\n📋 Listing customers...");
    const customersResponse = await client.listCustomers(1, 5);

    console.log(`Total customers: ${customersResponse.total}`);

    if (customersResponse.items.length > 0) {
      console.log("\nRecent customers:");
      let totalRevenue = 0;
      customersResponse.items.slice(0, 3).forEach(customer => {
        console.log(`  👤 ${customer.name} (${customer.email})`);
        console.log(`     Subscriptions: ${customer.subscriptions}`);
        console.log(`     Total Spend: $${(customer.totalSpend!)}`);
        totalRevenue += customer.totalSpend!;
        console.log();
      });

      console.log(`Revenue from shown customers: $${(totalRevenue)}`);
    } else {
      console.log("   No customers found.");
      console.log("   💡 Create checkout sessions to see customers here.");
    }

  } catch (error) {
    if (error instanceof BagelPayAPIError) {
      console.log(`❌ API Error: ${error.message} (Code: ${error.errorCode})`);
    } else {
      console.log(`❌ Error: ${error}`);
    }
  }
}

/**
 * Demonstrate getting detailed information about a specific subscription.
 */
async function getSubscriptionDetails(client: BagelPayClient): Promise<void> {
  console.log("\n🔍 Getting subscription details example...");

  try {
    // Get subscription details example
    const subscriptionsResponse = await client.listSubscriptions();
    const activeSubscriptions = subscriptionsResponse.items.filter(sub => 
      ['active', 'trialing'].includes(sub.status!)
    );

    if (activeSubscriptions.length === 0) {
      console.log("   No active subscriptions found to demonstrate details.");
      return;
    }

    const subscriptionId = activeSubscriptions[0].subscriptionId!;
    console.log(`   Using subscription ${subscriptionId} for demonstration...`);

    const subscription = await client.getSubscription(subscriptionId);

    console.log(`✅ Subscription details:`);
    console.log(`   Subscription ID: ${subscription.subscriptionId}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Product: ${subscription.productName} (ID: ${subscription.productId})`);
    console.log(`   Customer: ${subscription.customer?.email}`);
    console.log(`   Payment Method: ${subscription.paymentMethod}`);
    console.log(`   Amount: $${subscription.nextBillingAmount}/${subscription.recurringInterval}`);
    console.log(`   Created: ${subscription.createdAt}`);
    console.log(`   Updated: ${subscription.updatedAt}`);

    if (subscription.trialStart && subscription.trialEnd) {
      console.log(`   Trial Period: ${subscription.trialStart} to ${subscription.trialEnd}`);
    }

    if (subscription.billingPeriodStart && subscription.billingPeriodEnd) {
      console.log(`   Current Billing Period: ${subscription.billingPeriodStart} to ${subscription.billingPeriodEnd}`);
    }

    if (subscription.cancelAt) {
      console.log(`   Scheduled Cancellation: ${subscription.cancelAt}`);
    }

    if (subscription.remark) {
      console.log(`   Remark: ${subscription.remark}`);
    }

  } catch (error) {
    if (error instanceof BagelPayNotFoundError) {
      console.log(`❌ Subscription not found: ${error}`);
      console.log(`   The subscription does not exist or has been deleted.`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to get subscription details: ${error}`);
    }
    throw error;
  }
}

/**
 * Demonstrate canceling a subscription.
 */
async function cancelSubscriptionExample(client: BagelPayClient): Promise<void> {
  console.log("\n❌ Cancel subscription example...");

  try {
    // Cancel subscription example
    const subscriptionsResponse = await client.listSubscriptions();
    const activeSubscriptions = subscriptionsResponse.items.filter(sub => 
      ['active', 'trialing'].includes(sub.status!)
    );

    if (activeSubscriptions.length === 0) {
      console.log("   No active subscriptions found to demonstrate cancellation.");
      console.log("   💡 Skipping cancellation example for safety.");
      return;
    }

    const subscriptionId = activeSubscriptions[0].subscriptionId!;

    const canceledSubscription = await client.cancelSubscription(subscriptionId);
    console.log(`✅ Subscription canceled successfully!`);
    console.log(`   Subscription ID: ${canceledSubscription.subscriptionId}`);
    console.log(`   Status: ${canceledSubscription.status}`);
    console.log(`   Product: ${canceledSubscription.productName}`);
    console.log(`   Customer: ${canceledSubscription.customer?.email}`);

  } catch (error) {
    if (error instanceof BagelPayNotFoundError) {
      console.log(`❌ Subscription not found for cancellation: ${error}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to cancel subscription: ${error}`);
    }
    throw error;
  }
}

/**
 * Demonstrate error handling scenarios.
 */
async function demonstrateErrorHandling(client: BagelPayClient): Promise<void> {
  console.log("\n🚨 Error Handling Examples");
  console.log("=" .repeat(30));

  // Test 1: Invalid product ID
  console.log("\n1. Testing invalid product ID...");
  try {
    await client.getProduct("invalid_product_id");
  } catch (error) {
    if (error instanceof BagelPayNotFoundError) {
      console.log(`   ✅ Correctly caught NotFoundError: ${error.message}`);
    } else {
      console.log(`   ❌ Unexpected error type: ${error}`);
    }
  }

  // Test 2: Invalid checkout request
  console.log("\n2. Testing invalid checkout request...");
  try {
    const invalidCheckout: CheckoutRequest = {
      productId: "", // Empty product ID
      customer: { email: "invalid-email" } // Invalid email format
    };
    await client.createCheckout(invalidCheckout);
  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`   ✅ Correctly caught ValidationError: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`   ✅ Correctly caught API Error: ${error.message}`);
    } else {
      console.log(`   ❌ Unexpected error type: ${error}`);
    }
  }

  console.log("\n✅ Error handling demonstration completed.");
}

/**
 * Main function to run all examples
 */
export async function main(): Promise<void> {
  console.log("🥯 BagelPay TypeScript SDK - Basic Usage Examples");
  console.log("=" .repeat(50));

  try {
    // Initialize client
    const client = getClient(
    );

    // Run examples
    const productId = await createSampleProduct(client);
    await listProducts(client);
    await getProductDetails(client, productId);
    await updateProduct(client, productId);
    await createCheckoutSession(client, productId);
    await listTransactions(client);
    await archiveAndUnarchiveProduct(client, productId);
    await listSubscriptionsBasic(client);
    await listCustomersBasic(client);
    await getSubscriptionDetails(client);
    // await cancelSubscriptionExample(client); // Commented out for safety
    await demonstrateErrorHandling(client);

    console.log("\n🎉 All examples completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("   - Explore the product management examples");
    console.log("   - Try the checkout and payment examples");
    console.log("   - Check out subscription management examples");
    console.log("   - Review the API documentation for more features");

  } catch (error) {
    console.error("\n💥 Example failed:", error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
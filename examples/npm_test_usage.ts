/**
 * BagelPay TypeScript SDK - NPM Package Usage Examples
 * 
 * This file demonstrates how to use the BagelPay SDK installed from npm.
 * Install the package first: npm install bagelpay
 */

// Import the BagelPay SDK from npm package
import { 
  BagelPayClient,
  BagelPayAPIError,
  BagelPayError
} from 'bagelpay';

// Define types locally since they're not exported from the npm package
interface Customer {
  email: string;
}

interface CheckoutRequest {
  productId: string;
  requestId: string;
  units: string;
  customer: Customer;
  successUrl?: string;
  metadata?: Record<string, any>;
}

interface CreateProductRequest {
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

interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingType: string;
  createdAt: string;
  isArchive: boolean;
}

/**
 * Example 1: Initialize the BagelPay client
 */
function initializeClient() {
  const client = new BagelPayClient({
    apiKey: 'your-api-key',
    testMode: true, // Use test environment
    timeout: 30000 // 30 seconds timeout
  });
  
  console.log('✅ BagelPay client initialized');
  return client;
}

/**
 * Example 2: Create a checkout session
 */
async function createCheckoutExample(productId?: string) {
  const client = initializeClient();
  
  try {
    // Use provided productId or get the first available product
    let targetProductId: string;
    if (productId) {
      targetProductId = productId;
    } else {
      const productsResponse = await client.listProducts(1, 1);
      if (productsResponse.items.length === 0) {
        throw new Error('No products available for checkout');
      }
      targetProductId = productsResponse.items[0].productId!;
    }
    
    // Create customer information
    const customer: Customer = { email: "andrew@gettrust.ai" };
    
    const checkoutRequest: CheckoutRequest = {
      productId: targetProductId,
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
    
    const response = await client.createCheckout(checkoutRequest);
    console.log('✅ Checkout session created:');
    console.log(`   Payment URL: ${response.checkoutUrl}`);
    console.log(`   Payment ID: ${response.paymentId}`);
    console.log(`   Status: ${response.status}`);
    
    return response;
  } catch (error: unknown) {
    if (error instanceof BagelPayAPIError) {
      console.error('❌ API Error:', (error as Error).toString());
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  }
}

/**
 * Example 3: Create a new product
 */
async function createProductExample() {
  const client = initializeClient();
  
  try {
    const billingType = ["subscription", "subscription", "subscription", "single_payment"][Math.floor(Math.random() * 4)];
    
    const productRequest: CreateProductRequest = {
      name: "Product_TS_" + Math.floor(Math.random() * 9000 + 1000),
      description: "Description_of_product_" + Math.floor(Math.random() * 9000 + 1000),
      price: Math.random() * (1024.5 - 50.5) + 50.5,
      currency: "USD",
      billingType,
      taxInclusive: false,
      taxCategory: ["digital_products", "saas_services", "ebooks"][Math.floor(Math.random() * 3)],
      recurringInterval: billingType === "single_payment" ? "monthly" : ["daily", "weekly", "monthly", "3months", "6months"][Math.floor(Math.random() * 5)],
      trialDays: [0, 1, 7][Math.floor(Math.random() * 3)]
    };
    
    const product = await client.createProduct(productRequest);
    console.log('✅ Product created:');
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Price: ${product.price} ${product.currency}`);
    console.log(`   Billing Type: ${product.billingType}`);
    
    return product;
  } catch (error: unknown) {
    if (error instanceof BagelPayAPIError) {
      console.error('❌ API Error:', (error as Error).toString());
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  }
}

/**
 * Example 4: List products with pagination
 */
async function listProductsExample() {
  const client = initializeClient();
  
  try {
    const response = await client.listProducts(1, 10); // Page 1, 10 items per page
    console.log('✅ Products retrieved:');
    console.log(`   Total products: ${response.total}`);
    console.log(`   Products on this page: ${response.items.length}`);
    
    response.items.forEach((product: any, index: number) => {
      console.log(`   ${index + 1}. ${product.name} (${product.productId}) - ${product.price} ${product.currency}`);
    });
    
    return response;
  } catch (error: unknown) {
    if (error instanceof BagelPayAPIError) {
      console.error('❌ API Error:', (error as Error).toString());
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  }
}

/**
 * Example 5: Get product details
 */
async function getProductExample(productId: string) {
  const client = initializeClient();
  
  try {
    const product = await client.getProduct(productId);
    console.log('✅ Product details:');
    console.log(`   ID: ${product.productId}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Description: ${product.description}`);
    console.log(`   Price: ${product.price} ${product.currency}`);
    console.log(`   Created: ${product.createdAt}`);
    console.log(`   Archived: ${product.isArchive}`);
    
    return product;
  } catch (error: unknown) {
    if (error instanceof BagelPayAPIError) {
      console.error('❌ API Error:', error.toString());
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  }
}

/**
 * Example 6: Update a product
 */
async function updateProductExample(productId: string) {
  const client = initializeClient();
  
  try {
    // Note: Update functionality would use the same CreateProductRequest structure
    // with additional productId field when the API supports it
    const updateRequest = {
      productId: productId,
      name: 'Premium Subscription Pro',
      description: 'Enhanced premium subscription with all features',
      price: 39.99,
      currency: 'USD',
      billingType: 'recurring',
      taxInclusive: false,
      taxCategory: 'digital_services',
      recurringInterval: 'month',
      trialDays: 14
    };
    
    // Note: This is a placeholder - actual update method may vary
    console.log('✅ Product update request prepared:');
    console.log(`   ID: ${updateRequest.productId}`);
    console.log(`   New Name: ${updateRequest.name}`);
    console.log(`   New Price: ${updateRequest.price} ${updateRequest.currency}`);
    
    return updateRequest;
  } catch (error: unknown) {
    if (error instanceof BagelPayAPIError) {
      console.error('❌ API Error:', (error as Error).toString());
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  }
}

/**
 * Example 7: List transactions
 */
async function listTransactionsExample() {
  const client = initializeClient();
  
  try {
    const response = await client.listTransactions(1, 10);
    console.log('✅ Transactions retrieved:');
    console.log(`   Total transactions: ${response.total}`);
    console.log(`   Transactions on this page: ${response.items.length}`);
    
    response.items.forEach((transaction: any, index: number) => {
      console.log(`   ${index + 1}. ${transaction.transactionId} - ${transaction.amount} ${transaction.currency} (${transaction.type})`);
    });
    
    return response;
  } catch (error: unknown) {
    if (error instanceof BagelPayAPIError) {
      console.error('❌ API Error:', (error as Error).toString());
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  }
}

/**
 * Example 8: List subscriptions
 */
async function listSubscriptionsExample() {
  const client = initializeClient();
  
  try {
    const response = await client.listSubscriptions(1, 10);
    console.log('✅ Subscriptions retrieved:');
    console.log(`   Total subscriptions: ${response.total}`);
    console.log(`   Subscriptions on this page: ${response.items.length}`);
    
    response.items.forEach((subscription: any, index: number) => {
      console.log(`   ${index + 1}. ${subscription.subscriptionId} - ${subscription.status} (${subscription.customer?.email})`);
    });
    
    return response;
  } catch (error: unknown) {
    if (error instanceof BagelPayAPIError) {
      console.error('❌ API Error:', (error as Error).toString());
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  }
}

/**
 * Example 9: List customers
 */
async function listCustomersExample() {
  const client = initializeClient();
  
  try {
    const response = await client.listCustomers(1, 10);
    console.log('✅ Customers retrieved:');
    console.log(`   Total customers: ${response.total}`);
    console.log(`   Customers on this page: ${response.items.length}`);
    
    response.items.forEach((customer: any, index: number) => {
      console.log(`   ${index + 1}. ${customer.email} - ${customer.subscriptions} subscriptions, ${customer.payments} payments`);
    });
    
    return response;
  } catch (error: unknown) {
    if (error instanceof BagelPayAPIError) {
      console.error('❌ API Error:', (error as Error).toString());
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  }
}

/**
 * Example 10: Complete workflow demonstration
 */
async function completeWorkflowExample() {
  console.log('🚀 Starting BagelPay SDK workflow example...');
  
  try {
    // 1. Create a product
    console.log('\n📦 Step 1: Creating a product...');
    const product = await createProductExample();
    
    // 2. List products
    console.log('\n📋 Step 2: Listing products...');
    await listProductsExample();
    
    // 3. Create a checkout session
    console.log('\n💳 Step 3: Creating checkout session...');
    const checkout = await createCheckoutExample(product.productId);
    
    // 4. List transactions
    console.log('\n💰 Step 4: Listing transactions...');
    await listTransactionsExample();
    
    // 5. List subscriptions
    console.log('\n🔄 Step 5: Listing subscriptions...');
    await listSubscriptionsExample();
    
    // 6. List customers
    console.log('\n👥 Step 6: Listing customers...');
    await listCustomersExample();
    
    console.log('\n🎉 Workflow completed successfully!');
    
  } catch (error: unknown) {
    console.error('\n❌ Workflow failed:', error);
  }
}

/**
 * Main function to run examples
 */
async function main() {
  console.log('BagelPay TypeScript SDK - NPM Package Usage Examples');
  console.log('====================================================');
  
  // Uncomment the example you want to run:
  
  // await createCheckoutExample();
  // await createProductExample();
  // await listProductsExample();
  // await listTransactionsExample();
  // await listSubscriptionsExample();
  // await listCustomersExample();
  
  // Run complete workflow
  await completeWorkflowExample();
}

// Export functions for use in other modules
export {
  initializeClient,
  createCheckoutExample,
  createProductExample,
  listProductsExample,
  getProductExample,
  updateProductExample,
  listTransactionsExample,
  listSubscriptionsExample,
  listCustomersExample,
  completeWorkflowExample
};

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
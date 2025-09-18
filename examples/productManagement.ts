#!/usr/bin/env node
/**
 * BagelPay SDK - Product Management Examples
 *
 * This example demonstrates comprehensive product management using the BagelPay SDK:
 * - Creating different types of products (digital, subscription, physical)
 * - Listing and filtering products
 * - Getting detailed product information
 * - Updating product properties
 * - Archiving and unarchiving products
 * - Product validation and error handling
 *
 * Before running this example:
 * 1. Install the SDK: npm install bagelpay
 * 2. Set your API key as an environment variable: export BAGELPAY_API_KEY="your_api_key_here"
 * 3. Optionally set test mode: export BAGELPAY_TEST_MODE="false" (defaults to true)
 */

import { BagelPayClient } from '../src/bagelpay/client.js';
import {
  CreateProductRequest,
  UpdateProductRequest,
  Product,
  ProductListResponse
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
    apiKey = process.env.BAGELPAY_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      "API key is required. Set BAGELPAY_API_KEY environment variable with: export BAGELPAY_API_KEY='your_api_key_here'"
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
 * Create a digital product (e.g., software, ebook, course).
 */
async function createDigitalProduct(client: BagelPayClient): Promise<string> {
  console.log("\n📱 Creating a digital product...");

  try {
    const productRequest: CreateProductRequest = {
      name: "Premium_Software_License_" + Math.floor(Math.random() * 9000 + 1000),
      description: "A premium software license with advanced features and priority support.",
      price: 99.99,
      currency: "USD",
      billingType: "single_payment",
      taxInclusive: false,
      taxCategory: "digital_products",
      recurringInterval: "",
      trialDays: 0
    };

    const product = await client.createProduct(productRequest);

    console.log(`✅ Digital product created successfully!`);
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Price: $${product.price} ${product.currency}`);
    console.log(`   Type: ${product.billingType}`);
    console.log(`   Tax Category: ${product.taxCategory}`);
    console.log(`   Product URL: ${product.productUrl}`);

    return product.productId!;

  } catch (error) {
    if (error instanceof BagelPayValidationError) {
      console.log(`❌ Validation error: ${error.message}`);
      console.log("   Please check your product data and try again.");
    } else if (error instanceof BagelPayAPIError) {
      console.log(`❌ API error: ${error.message}`);
      console.log(`   Status code: ${error.statusCode}`);
    } else {
      console.log(`❌ Unexpected error: ${error}`);
    }
    throw error;
  }
}

/**
 * Create a subscription product (e.g., SaaS, membership).
 */
async function createSubscriptionProduct(client: BagelPayClient): Promise<string> {
  console.log("\n🔄 Creating a subscription product...");

  try {
    const productRequest: CreateProductRequest = {
      name: "Pro_SaaS_Plan_" + Math.floor(Math.random() * 9000 + 1000),
      description: "Professional SaaS plan with unlimited features and premium support.",
      price: 29.99,
      currency: "USD",
      billingType: "subscription",
      taxInclusive: false,
      taxCategory: "saas_services",
      recurringInterval: "monthly",
      trialDays: 14
    };

    const product = await client.createProduct(productRequest);

    console.log(`✅ Subscription product created successfully!`);
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Price: $${product.price}/${product.recurringInterval} ${product.currency}`);
    console.log(`   Type: ${product.billingType}`);
    console.log(`   Trial Days: ${product.trialDays}`);
    console.log(`   Tax Category: ${product.taxCategory}`);
    console.log(`   Product URL: ${product.productUrl}`);

    return product.productId!;

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
 * Create a physical product (e.g., merchandise, books).
 */
async function createPhysicalProduct(client: BagelPayClient): Promise<string> {
  console.log("\n📦 Creating a physical product...");

  try {
    const productRequest: CreateProductRequest = {
      name: "Premium_T_Shirt_" + Math.floor(Math.random() * 9000 + 1000),
      description: "High-quality cotton t-shirt with custom design. Available in multiple sizes.",
      price: 24.99,
      currency: "USD",
      billingType: "single_payment",
      taxInclusive: true,
      taxCategory: "physical_goods",
      recurringInterval: "",
      trialDays: 0
    };

    const product = await client.createProduct(productRequest);

    console.log(`✅ Physical product created successfully!`);
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Price: $${product.price} ${product.currency} (tax inclusive)`);
    console.log(`   Type: ${product.billingType}`);
    console.log(`   Tax Category: ${product.taxCategory}`);
    console.log(`   Product URL: ${product.productUrl}`);

    return product.productId!;

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
 * List all products with detailed information.
 */
async function listAllProducts(client: BagelPayClient): Promise<Product[]> {
  console.log("\n📋 Listing all products...");

  try {
    const allProducts: Product[] = [];
    let page = 1;
    const pageSize = 10;

    while (true) {
      const productsResponse = await client.listProducts(page, pageSize);
      allProducts.push(...productsResponse.items);

      console.log(`   Page ${page}: Found ${productsResponse.items.length} products`);

      // Break if we've retrieved all products
      if (productsResponse.items.length < pageSize || allProducts.length >= productsResponse.total) {
        break;
      }
      page++;
    }

    console.log(`\n✅ Total products retrieved: ${allProducts.length}`);

    // Group products by type
    const digitalProducts = allProducts.filter(p => p.billingType === 'single_payment' && p.taxCategory === 'digital_products');
    const subscriptionProducts = allProducts.filter(p => p.billingType === 'subscription');
    const physicalProducts = allProducts.filter(p => p.taxCategory === 'physical_goods');
    const archivedProducts = allProducts.filter(p => p.isArchive);

    console.log(`\n📊 Product breakdown:`);
    console.log(`   Digital products: ${digitalProducts.length}`);
    console.log(`   Subscription products: ${subscriptionProducts.length}`);
    console.log(`   Physical products: ${physicalProducts.length}`);
    console.log(`   Archived products: ${archivedProducts.length}`);

    // Show recent products
    if (allProducts.length > 0) {
      console.log(`\n🆕 Recent products:`);
      allProducts.slice(0, 5).forEach((product, i) => {
        const status = product.isArchive ? "🗄️ Archived" : "✅ Active";
        const priceDisplay = product.recurringInterval 
          ? `$${product.price}/${product.recurringInterval} ${product.currency}`
          : `$${product.price} ${product.currency}`;
        console.log(`   ${i + 1}. ${product.name} (${product.productId})`);
        console.log(`      Price: ${priceDisplay} ${status}`);
        console.log(`      Type: ${product.billingType}`);
        console.log(`      Created: ${product.createdAt}`);
      });
    }

    return allProducts;

  } catch (error) {
    if (error instanceof BagelPayAPIError) {
      console.log(`❌ Failed to list products: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get detailed information about specific products.
 */
async function getProductDetails(client: BagelPayClient, productIds: string[]): Promise<void> {
  console.log(`\n🔍 Getting detailed information for ${productIds.length} products...`);

  for (const productId of productIds) {
    try {
      const product = await client.getProduct(productId);

      console.log(`\n📦 Product: ${product.name}`);
      console.log(`   ID: ${product.productId}`);
      console.log(`   Description: ${product.description}`);
      
      if (product.recurringInterval) {
        console.log(`   Price: $${product.price} ${product.currency}/${product.recurringInterval}`);
        if (product.trialDays && product.trialDays > 0) {
          console.log(`   Trial: ${product.trialDays} days`);
        }
      } else {
        console.log(`   Price: $${product.price} ${product.currency}`);
      }
      
      console.log(`   Billing: ${product.billingType}`);
      console.log(`   Tax: ${product.taxInclusive ? 'Inclusive' : 'Exclusive'} (${product.taxCategory})`);
      console.log(`   Status: ${product.isArchive ? 'Archived' : 'Active'}`);
      console.log(`   Created: ${product.createdAt}`);
      console.log(`   Updated: ${product.updatedAt}`);
      console.log(`   URL: ${product.productUrl}`);

    } catch (error) {
      if (error instanceof BagelPayNotFoundError) {
        console.log(`\n❌ Product ${productId} not found`);
      } else if (error instanceof BagelPayAPIError) {
        console.log(`\n❌ Failed to get product ${productId}: ${error.message}`);
      }
    }
  }
}

/**
 * Update product information with different scenarios.
 */
async function updateProductExamples(client: BagelPayClient, productIds: string[]): Promise<void> {
  console.log(`\n✏️ Updating products with different scenarios...`);

  if (productIds.length === 0) {
    console.log("   No products available for update examples.");
    return;
  }

  // Example 1: Update price and description
  if (productIds.length > 0) {
    const productId = productIds[0];
    console.log(`\n1. Updating price and description for ${productId}...`);
    
    try {
      const updateRequest: UpdateProductRequest = {
        productId,
        name: "Updated_Product_" + Math.floor(Math.random() * 9000 + 1000),
        description: "This product has been updated with new features and improved functionality.",
        price: 39.99,
        currency: "USD",
        billingType: "single_payment",
        taxInclusive: false,
        taxCategory: "digital_products",
        recurringInterval: "",
        trialDays: 0
      };

      const updatedProduct = await client.updateProduct(updateRequest);
      console.log(`   ✅ Product updated successfully!`);
      console.log(`   New name: ${updatedProduct.name}`);
      console.log(`   New price: $${updatedProduct.price} ${updatedProduct.currency}`);
      console.log(`   Updated at: ${updatedProduct.updatedAt}`);

    } catch (error) {
      if (error instanceof BagelPayValidationError) {
        console.log(`   ❌ Validation error: ${error.message}`);
      } else if (error instanceof BagelPayAPIError) {
        console.log(`   ❌ API error: ${error.message}`);
      }
    }
  }

  // Example 2: Update subscription product settings
  if (productIds.length > 1) {
    const productId = productIds[1];
    console.log(`\n2. Updating subscription settings for ${productId}...`);
    
    try {
      const updateRequest: UpdateProductRequest = {
        productId,
        name: "Updated_Subscription_" + Math.floor(Math.random() * 9000 + 1000),
        description: "Updated subscription product with new features.",
        price: 299.99,
        currency: "USD",
        billingType: "subscription",
        taxInclusive: false,
        taxCategory: "saas_services",
        recurringInterval: "yearly",
        trialDays: 30
      };

      const updatedProduct = await client.updateProduct(updateRequest);
      console.log(`   ✅ Subscription product updated successfully!`);
      console.log(`   New interval: ${updatedProduct.recurringInterval}`);
      console.log(`   New trial days: ${updatedProduct.trialDays}`);
      console.log(`   New price: $${updatedProduct.price}/${updatedProduct.recurringInterval}`);

    } catch (error) {
      if (error instanceof BagelPayValidationError) {
        console.log(`   ❌ Validation error: ${error.message}`);
      } else if (error instanceof BagelPayAPIError) {
        console.log(`   ❌ API error: ${error.message}`);
      }
    }
  }

  // Example 3: Update tax settings
  if (productIds.length > 2) {
    const productId = productIds[2];
    console.log(`\n3. Updating tax settings for ${productId}...`);
    
    try {
      const updateRequest: UpdateProductRequest = {
        productId,
        name: "Updated_Tax_Product_" + Math.floor(Math.random() * 9000 + 1000),
        description: "Product with updated tax settings.",
        price: 19.99,
        currency: "USD",
        billingType: "single_payment",
        taxInclusive: true,
        taxCategory: "ebooks",
        recurringInterval: "",
        trialDays: 0
      };

      const updatedProduct = await client.updateProduct(updateRequest);
      console.log(`   ✅ Tax settings updated successfully!`);
      console.log(`   Tax inclusive: ${updatedProduct.taxInclusive}`);
      console.log(`   Tax category: ${updatedProduct.taxCategory}`);

    } catch (error) {
      if (error instanceof BagelPayValidationError) {
        console.log(`   ❌ Validation error: ${error.message}`);
      } else if (error instanceof BagelPayAPIError) {
        console.log(`   ❌ API error: ${error.message}`);
      }
    }
  }
}

/**
 * Demonstrate archiving and unarchiving products.
 */
async function archiveUnarchiveExamples(client: BagelPayClient, productIds: string[]): Promise<void> {
  console.log(`\n🗄️ Archive and unarchive examples...`);

  if (productIds.length === 0) {
    console.log("   No products available for archive examples.");
    return;
  }

  const productId = productIds[0];

  try {
    // Archive the product
    console.log(`\n1. Archiving product ${productId}...`);
    const archivedProduct = await client.archiveProduct(productId);
    console.log(`   ✅ Product archived successfully!`);
    console.log(`   Product ID: ${archivedProduct.productId}`);
    console.log(`   Status: ${archivedProduct.isArchive ? 'Archived' : 'Active'}`);
    console.log(`   Updated at: ${archivedProduct.updatedAt}`);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Unarchive the product
    console.log(`\n2. Unarchiving product ${productId}...`);
    const unarchivedProduct = await client.unarchiveProduct(productId);
    console.log(`   ✅ Product unarchived successfully!`);
    console.log(`   Product ID: ${unarchivedProduct.productId}`);
    console.log(`   Status: ${unarchivedProduct.isArchive ? 'Archived' : 'Active'}`);
    console.log(`   Updated at: ${unarchivedProduct.updatedAt}`);

  } catch (error) {
    if (error instanceof BagelPayNotFoundError) {
      console.log(`   ❌ Product not found: ${error.message}`);
    } else if (error instanceof BagelPayAPIError) {
      console.log(`   ❌ API error: ${error.message}`);
    }
  }
}

/**
 * Demonstrate product validation and error handling.
 */
async function productValidationExamples(client: BagelPayClient): Promise<void> {
  console.log(`\n🚨 Product validation and error handling examples...`);

  // Test 1: Invalid product data
  console.log(`\n1. Testing invalid product creation...`);
  try {
    const invalidProduct: CreateProductRequest = {
      name: "", // Empty name
      description: "Test product",
      price: -10, // Negative price
      currency: "INVALID", // Invalid currency
      billingType: "invalid_type" as any, // Invalid billing type
      taxInclusive: false,
      taxCategory: "invalid_category" as any, // Invalid tax category
      recurringInterval: "",
      trialDays: 0
    };

    await client.createProduct(invalidProduct);
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

  // Test 2: Non-existent product
  console.log(`\n2. Testing non-existent product retrieval...`);
  try {
    await client.getProduct("non_existent_product_id");
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

  // Test 3: Invalid update data
  console.log(`\n3. Testing invalid product update...`);
  try {
    const invalidUpdate: UpdateProductRequest = {
      productId: "some_product_id",
      name: "Invalid Product",
      description: "Invalid product for testing",
      price: -100, // Negative price
      currency: "XYZ", // Invalid currency
      billingType: "single_payment",
      taxInclusive: false,
      taxCategory: "digital_products",
      recurringInterval: "",
      trialDays: 0
    };

    await client.updateProduct(invalidUpdate);
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

  console.log(`\n✅ Validation examples completed.`);
}

/**
 * Main function to run all product management examples.
 */
export async function main(): Promise<void> {
  console.log("🥯 BagelPay TypeScript SDK - Product Management Examples");
  console.log("=" .repeat(60));

  try {
    // Initialize client
    const client = getClient(
    );

    // Create different types of products
    const digitalProductId = await createDigitalProduct(client);
    const subscriptionProductId = await createSubscriptionProduct(client);

    const createdProductIds = [digitalProductId, subscriptionProductId];

    // List all products
    const allProducts = await listAllProducts(client);

    // Get detailed information
    await getProductDetails(client, createdProductIds);

    // Update products
    await updateProductExamples(client, createdProductIds);

    // Archive and unarchive examples
    await archiveUnarchiveExamples(client, createdProductIds);

    // Validation and error handling
    await productValidationExamples(client);

    console.log("\n🎉 All product management examples completed successfully!");
    console.log("\n💡 Key takeaways:");
    console.log("   - Different product types require different configurations");
    console.log("   - Always handle validation and API errors appropriately");
    console.log("   - Use pagination when listing large numbers of products");
    console.log("   - Archive products instead of deleting them for better data integrity");
    console.log("   - Test your product configurations in test mode before going live");

  } catch (error) {
    console.error("\n💥 Product management examples failed:", error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
#!/usr/bin/env node
/**
 * BagelPay SDK - Subscription and Customer Management Examples
 *
 * This example demonstrates subscription and customer management:
 * - Listing and filtering subscriptions
 * - Getting subscription details
 * - Canceling subscriptions
 * - Managing customers
 * - Customer analytics and insights
 * - Error handling for subscription operations
 *
 * Before running this example:
 * 1. Install the SDK: npm install bagelpay
 * 2. Set your API key as an environment variable: export BAGELPAY_API_KEY="your_api_key_here"
 * 3. Optionally set test mode: export BAGELPAY_TEST_MODE="false" (defaults to true)
 */

import { BagelPayClient } from '../src/bagelpay/client.js';
import {
  Subscription,
  SubscriptionListResponse,
  Customer,
  CustomerData,
  CustomerListResponse
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
 * List all subscriptions with detailed analysis.
 */
async function listAndAnalyzeSubscriptions(client: BagelPayClient): Promise<Subscription[]> {
  console.log("\n🔄 Subscription Management");
  console.log("=" .repeat(30));

  try {
    console.log("\n📋 Listing all subscriptions...");
    
    const allSubscriptions: Subscription[] = [];
    let page = 1;
    const pageSize = 20;

    while (true) {
      const subscriptionsResponse = await client.listSubscriptions(page, pageSize);
      allSubscriptions.push(...subscriptionsResponse.items);

      console.log(`   Page ${page}: Found ${subscriptionsResponse.items.length} subscriptions`);

      // Break if we've retrieved all subscriptions
      if (subscriptionsResponse.items.length < pageSize || allSubscriptions.length >= subscriptionsResponse.total) {
        break;
      }
      page++;
    }

    console.log(`\n✅ Total subscriptions retrieved: ${allSubscriptions.length}`);

    if (allSubscriptions.length === 0) {
      console.log("   No subscriptions found.");
      console.log("   💡 Create subscription products and checkout sessions to see subscriptions here.");
      return allSubscriptions;
    }

    // Analyze subscription data
    const activeSubscriptions = allSubscriptions.filter(sub => sub.status === 'active');
    const trialingSubscriptions = allSubscriptions.filter(sub => sub.status === 'trialing');
    const canceledSubscriptions = allSubscriptions.filter(sub => sub.status === 'canceled');
    const PausedSubscriptions = allSubscriptions.filter(sub => sub.status === 'paused');

    console.log(`\n📊 Subscription breakdown:`);
    console.log(`   Active: ${activeSubscriptions.length}`);
    console.log(`   Trialing: ${trialingSubscriptions.length}`);
    console.log(`   Canceled: ${canceledSubscriptions.length}`);
    console.log(`   Paused: ${PausedSubscriptions.length}`);

    // Revenue analysis
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    const intervalCounts: { [key: string]: number } = {};

    activeSubscriptions.forEach(sub => {
      const amount = parseFloat(sub.nextBillingAmount || '0');
      const interval = sub.recurringInterval || 'unknown';
      
      intervalCounts[interval] = (intervalCounts[interval] || 0) + 1;
      
      switch (interval) {
        case 'monthly':
          monthlyRevenue += amount;
          yearlyRevenue += amount * 12;
          break;
        case 'yearly':
          yearlyRevenue += amount;
          monthlyRevenue += amount / 12;
          break;
        case 'weekly':
          monthlyRevenue += amount * 4.33; // Average weeks per month
          yearlyRevenue += amount * 52;
          break;
        case 'daily':
          monthlyRevenue += amount * 30;
          yearlyRevenue += amount * 365;
          break;
      }
    });

    console.log(`\n💰 Revenue analysis (active subscriptions):`);
    console.log(`   Monthly Recurring Revenue (MRR): $${monthlyRevenue.toFixed(2)}`);
    console.log(`   Annual Recurring Revenue (ARR): $${yearlyRevenue.toFixed(2)}`);
    
    console.log(`\n📈 Subscription intervals:`);
    Object.entries(intervalCounts).forEach(([interval, count]) => {
      console.log(`   ${interval}: ${count} subscriptions`);
    });

    // Show recent subscriptions
    console.log(`\n🆕 Recent subscriptions:`);
    allSubscriptions.slice(0, 5).forEach((subscription, i) => {
      const statusEmoji = {
        'active': '✅',
        'trialing': '🆓',
        'canceled': '❌',
        'paused': '⚠️'
      }[subscription.status!] || '❓';
      
      console.log(`   ${i + 1}. ${statusEmoji} ${subscription.subscriptionId}`);
      console.log(`      Product: ${subscription.productName}`);
      console.log(`      Customer: ${subscription.customer?.email}`);
      console.log(`      Amount: $${subscription.nextBillingAmount}/${subscription.recurringInterval}`);
      console.log(`      Status: ${subscription.status}`);
      console.log(`      Created: ${subscription.createdAt}`);
      
      if (subscription.trialEnd) {
        console.log(`      Trial ends: ${subscription.trialEnd}`);
      }
      
      if (subscription.billingPeriodEnd) {
        console.log(`      Next billing: ${subscription.billingPeriodEnd}`);
      }
      
      console.log();
    });

    return allSubscriptions;

  } catch (error) {
    if (error instanceof BagelPayAPIError) {
      console.log(`❌ API Error: ${error.message} (Code: ${error.errorCode})`);
    } else {
      console.log(`❌ Error: ${error}`);
    }
    throw error;
  }
}

/**
 * Get detailed information about specific subscriptions.
 */
async function getSubscriptionDetails(client: BagelPayClient, subscriptions: Subscription[]): Promise<void> {
  console.log(`\n🔍 Getting detailed subscription information...`);

  if (subscriptions.length === 0) {
    console.log("   No subscriptions available for detailed analysis.");
    return;
  }

  // Get details for up to 3 subscriptions
  const subscriptionsToAnalyze = subscriptions.slice(0, 3);

  for (const subscription of subscriptionsToAnalyze) {
    try {
      console.log(`\n📦 Subscription: ${subscription.subscriptionId}`);
      
      const detailedSubscription = await client.getSubscription(subscription.subscriptionId!);
      
      console.log(`   Product: ${detailedSubscription.productName} (ID: ${detailedSubscription.productId})`);
      console.log(`   Customer: ${detailedSubscription.customer?.email}`);
      console.log(`   Status: ${detailedSubscription.status}`);
      console.log(`   Payment Method: ${detailedSubscription.paymentMethod}`);
      console.log(`   Amount: $${detailedSubscription.nextBillingAmount}/${detailedSubscription.recurringInterval}`);
      console.log(`   Created: ${detailedSubscription.createdAt}`);
      console.log(`   Updated: ${detailedSubscription.updatedAt}`);
      
      if (detailedSubscription.trialStart && detailedSubscription.trialEnd) {
        console.log(`   Trial Period: ${detailedSubscription.trialStart} to ${detailedSubscription.trialEnd}`);
      }
      
      if (detailedSubscription.billingPeriodStart && detailedSubscription.billingPeriodEnd) {
        console.log(`   Current Billing Period: ${detailedSubscription.billingPeriodStart} to ${detailedSubscription.billingPeriodEnd}`);
      }
      
      if (detailedSubscription.cancelAt) {
        console.log(`   Scheduled Cancellation: ${detailedSubscription.cancelAt}`);
      }
      
      if (detailedSubscription.remark) {
        console.log(`   Remark: ${detailedSubscription.remark}`);
      }

    } catch (error) {
      if (error instanceof BagelPayNotFoundError) {
        console.log(`   ❌ Subscription ${subscription.subscriptionId} not found`);
      } else if (error instanceof BagelPayAPIError) {
        console.log(`   ❌ Failed to get subscription details: ${error.message}`);
      }
    }
  }
}

/**
 * Demonstrate subscription cancellation (with safety checks).
 */
async function demonstrateSubscriptionCancellation(client: BagelPayClient, subscriptions: Subscription[]): Promise<void> {
  console.log(`\n❌ Subscription Cancellation Examples`);
  console.log("=" .repeat(40));

  const activeSubscriptions = subscriptions.filter(sub => 
    ['active', 'trialing'].includes(sub.status!)
  );

  if (activeSubscriptions.length === 0) {
    console.log("   No active subscriptions found to demonstrate cancellation.");
    console.log("   💡 This is actually good - we won't accidentally cancel real subscriptions!");
    return;
  }

  console.log(`\n⚠️  Found ${activeSubscriptions.length} active subscriptions.`);
  console.log("   For safety, we'll demonstrate cancellation logic without actually canceling.");
  console.log("   In a real scenario, you would:");
  console.log();

  const subscriptionToCancel = activeSubscriptions[0];
  console.log(`   1. Select subscription to cancel: ${subscriptionToCancel.subscriptionId}`);
  console.log(`      Product: ${subscriptionToCancel.productName}`);
  console.log(`      Customer: ${subscriptionToCancel.customer?.email}`);
  console.log(`      Amount: $${subscriptionToCancel.nextBillingAmount}/${subscriptionToCancel.recurringInterval}`);
  console.log();
  console.log(`   2. Call: await client.cancelSubscription('${subscriptionToCancel.subscriptionId}')`);
  console.log(`   3. Handle the response and update your UI`);
  console.log(`   4. Optionally send confirmation email to customer`);
  console.log();
  console.log(`   💡 Uncomment the code below to actually perform cancellation:`);
  console.log(`   /*`);
  console.log(`   try {`);
  console.log(`     const canceledSubscription = await client.cancelSubscription('${subscriptionToCancel.subscriptionId}');`);
  console.log(`     console.log('Subscription canceled:', canceledSubscription.subscriptionId);`);
  console.log(`   } catch (error) {`);
  console.log(`     console.error('Cancellation failed:', error);`);
  console.log(`   }`);
  console.log(`   */`);
}

/**
 * List and analyze customers.
 */
async function listAndAnalyzeCustomers(client: BagelPayClient): Promise<CustomerData[]> {
  console.log("\n👥 Customer Management");
  console.log("=" .repeat(25));

  try {
    console.log("\n📋 Listing all customers...");
    
    const allCustomers: CustomerData[] = [];
    let page = 1;
    const pageSize = 20;

    while (true) {
      const customersResponse = await client.listCustomers(page, pageSize);
      allCustomers.push(...customersResponse.items);

      console.log(`   Page ${page}: Found ${customersResponse.items.length} customers`);

      // Break if we've retrieved all customers
      if (customersResponse.items.length < pageSize || allCustomers.length >= customersResponse.total) {
        break;
      }
      page++;
    }

    console.log(`\n✅ Total customers retrieved: ${allCustomers.length}`);

    if (allCustomers.length === 0) {
      console.log("   No customers found.");
      console.log("   💡 Create checkout sessions to see customers here.");
      return allCustomers;
    }

    // Analyze customer data
    let totalRevenue = 0;
    let totalSubscriptions = 0;
    const customersBySubscriptionCount: { [key: number]: number } = {};

    allCustomers.forEach(customer => {
      const revenue = customer.totalSpend || 0;
      const subscriptions = customer.subscriptions || 0;
      
      totalRevenue += revenue;
      totalSubscriptions += subscriptions;
      
      customersBySubscriptionCount[subscriptions] = (customersBySubscriptionCount[subscriptions] || 0) + 1;
    });

    console.log(`\n📊 Customer analytics:`);
    console.log(`   Total Revenue: $${(totalRevenue / 100).toFixed(2)}`);
    console.log(`   Average Revenue per Customer: $${(totalRevenue / allCustomers.length / 100).toFixed(2)}`);
    console.log(`   Total Subscriptions: ${totalSubscriptions}`);
    console.log(`   Average Subscriptions per Customer: ${(totalSubscriptions / allCustomers.length).toFixed(2)}`);

    // Customer segmentation
    const highValueCustomers = allCustomers.filter(c => (c.totalSpend || 0) > 10000); // $100+
    const activeSubscribers = allCustomers.filter(c => (c.subscriptions || 0) > 0);
    const oneTimeCustomers = allCustomers.filter(c => (c.subscriptions || 0) === 0);

    console.log(`\n🎯 Customer segmentation:`);
    console.log(`   High-value customers (>$100): ${highValueCustomers.length}`);
    console.log(`   Active subscribers: ${activeSubscribers.length}`);
    console.log(`   One-time customers: ${oneTimeCustomers.length}`);

    // Show top customers by revenue
    console.log(`\n💰 Top customers by revenue:`);
    const topCustomers = allCustomers
      .sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0))
      .slice(0, 5);

    topCustomers.forEach((customer, i) => {
      console.log(`   ${i + 1}. ${customer.email}`);
      console.log(`      Revenue: $${((customer.totalSpend || 0) / 100).toFixed(2)}`);
      console.log(`      Subscriptions: ${customer.subscriptions || 0}`);
      console.log();
    });

    return allCustomers;

  } catch (error) {
    if (error instanceof BagelPayAPIError) {
      console.log(`❌ API Error: ${error.message} (Code: ${error.errorCode})`);
    } else {
      console.log(`❌ Error: ${error}`);
    }
    throw error;
  }
}

/**
 * Demonstrate error handling for subscription and customer operations.
 */
async function demonstrateErrorHandling(client: BagelPayClient): Promise<void> {
  console.log(`\n🚨 Error Handling Examples`);
  console.log("=" .repeat(30));

  // Test 1: Invalid subscription ID
  console.log(`\n1. Testing invalid subscription ID...`);
  try {
    await client.getSubscription("invalid_subscription_id");
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

  // Test 2: Cancel non-existent subscription
  console.log(`\n2. Testing cancellation of non-existent subscription...`);
  try {
    await client.cancelSubscription("non_existent_subscription_id");
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

  console.log(`\n✅ Error handling demonstration completed.`);
}

/**
 * Generate insights and recommendations based on subscription and customer data.
 */
function generateInsights(subscriptions: Subscription[], customers: CustomerData[]): void {
  console.log(`\n💡 Business Insights and Recommendations`);
  console.log("=" .repeat(45));

  if (subscriptions.length === 0 && customers.length === 0) {
    console.log(`\n   No data available for insights.`);
    console.log(`   💡 Start by creating products and checkout sessions to gather data.`);
    return;
  }

  console.log(`\n📈 Growth opportunities:`);
  
  // Subscription insights
  if (subscriptions.length > 0) {
    const trialConversionRate = subscriptions.filter(s => s.status === 'active').length / 
                               Math.max(subscriptions.filter(s => s.status === 'trialing').length, 1);
    
    console.log(`   - Trial conversion rate: ${(trialConversionRate * 100).toFixed(1)}%`);
    
    const churnRate = subscriptions.filter(s => s.status === 'canceled').length / subscriptions.length;
    console.log(`   - Churn rate: ${(churnRate * 100).toFixed(1)}%`);
    
    if (churnRate > 0.1) {
      console.log(`     ⚠️  High churn rate detected. Consider improving customer retention.`);
    }
  }

  // Customer insights
  if (customers.length > 0) {
    const averageRevenue = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0) / customers.length / 100;
    console.log(`   - Average customer lifetime value: $${averageRevenue.toFixed(2)}`);
    
    const subscriberRate = customers.filter(c => (c.subscriptions || 0) > 0).length / customers.length;
    console.log(`   - Subscription adoption rate: ${(subscriberRate * 100).toFixed(1)}%`);
    
    if (subscriberRate < 0.3) {
      console.log(`     💡 Consider promoting subscription products to increase recurring revenue.`);
    }
  }

  console.log(`\n🎯 Recommended actions:`);
  console.log(`   1. Monitor subscription health metrics regularly`);
  console.log(`   2. Implement customer retention strategies for high-value customers`);
  console.log(`   3. Analyze trial-to-paid conversion patterns`);
  console.log(`   4. Set up automated billing failure recovery`);
  console.log(`   5. Create customer success programs for long-term subscribers`);
}

/**
 * Main function to run all subscription and customer management examples.
 */
export async function main(): Promise<void> {
  console.log("🥯 BagelPay TypeScript SDK - Subscription and Customer Management");
  console.log("=" .repeat(70));

  try {
    // Initialize client
    const client = getClient(
    );

    // List and analyze subscriptions
    const subscriptions = await listAndAnalyzeSubscriptions(client);

    // Get detailed subscription information
    await getSubscriptionDetails(client, subscriptions);

    // Demonstrate subscription cancellation (safely)
    await demonstrateSubscriptionCancellation(client, subscriptions);

    // List and analyze customers
    const customers = await listAndAnalyzeCustomers(client);

    // Error handling examples
    await demonstrateErrorHandling(client);

    // Generate business insights
    generateInsights(subscriptions, customers);

    console.log("\n🎉 All subscription and customer management examples completed!");
    console.log("\n💡 Key takeaways:");
    console.log("   - Monitor subscription metrics regularly for business health");
    console.log("   - Implement proper error handling for all subscription operations");
    console.log("   - Use customer analytics to drive business decisions");
    console.log("   - Set up automated processes for subscription lifecycle management");
    console.log("   - Focus on customer retention and lifetime value optimization");

  } catch (error) {
    console.error("\n💥 Subscription and customer management examples failed:", error);
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
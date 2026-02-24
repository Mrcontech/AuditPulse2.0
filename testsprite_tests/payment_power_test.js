import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

console.log('🔍 Debug: Script started');
console.log('🔍 Debug: SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'NOT Set');
console.log('🔍 Debug: SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'NOT Set');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

// Configuration - UPDATE THESE FOR YOUR ENVIRONMENT
const TEST_USER_ID = '4bd75155-98a3-4aee-bfdf-d2afe9e1c99c'; // Use a real user ID from your profiles table
const DODO_WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_KEY || 'test_secret';
const TEST_PRODUCT_ID = 'prod_pro_test_id';

async function generateSignature(payload, secret, webhookId, timestamp) {
    const signedMessage = `${webhookId}.${timestamp}.${payload}`;
    return crypto
        .createHmac('sha256', secret)
        .update(signedMessage)
        .digest('hex');
}

async function runPaymentPowerTest() {
    console.log('⚡ Starting Payment Power Test...');

    try {
        // --- 1. Test Dodo Checkout ---
        console.log('\n--- Step 1: Testing Checkout Creation ---');
        const checkoutResponse = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/dodo-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                productId: TEST_PRODUCT_ID,
                customerEmail: 'test@example.com',
                userId: TEST_USER_ID,
                returnUrl: 'http://localhost:3000/dashboard'
            })
        });

        const checkoutResult = await checkoutResponse.json();
        if (!checkoutResponse.ok) throw new Error(`Checkout failed: ${JSON.stringify(checkoutResult)}`);

        console.log('✅ Checkout session created successfully!');
        console.log('🔗 URL:', checkoutResult.url);

        // --- 2. Test Dodo Webhook ---
        console.log('\n--- Step 2: Testing Webhook Processing (Simulation) ---');
        const webhookId = `wh_${Math.random().toString(36).substring(7)}`;
        const timestamp = Math.floor(Date.now() / 1000).toString();

        const payload = JSON.stringify({
            type: 'payment.succeeded',
            data: {
                product_id: TEST_PRODUCT_ID,
                metadata: {
                    userId: TEST_USER_ID
                }
            }
        });

        const signature = await generateSignature(payload, DODO_WEBHOOK_SECRET, webhookId, timestamp);

        const webhookResponse = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/dodo-webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'webhook-id': webhookId,
                'webhook-timestamp': timestamp,
                'webhook-signature': signature
            },
            body: payload
        });

        const webhookResult = await webhookResponse.json();
        if (!webhookResponse.ok) throw new Error(`Webhook failed: ${JSON.stringify(webhookResult)}`);

        console.log('✅ Webhook processed successfully!');

        // --- 3. Verify Database Update ---
        console.log('\n--- Step 3: Verifying Database Update ---');
        // Wait a small bit for DB to catch up if needed
        await new Promise(r => setTimeout(r, 2000));

        const { data: profile, error: dbError } = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_status')
            .eq('id', TEST_USER_ID)
            .single();

        if (dbError) throw dbError;

        console.log(`📊 User Tier: ${profile.subscription_tier}`);
        console.log(`📊 Status: ${profile.subscription_status}`);

        if (profile.subscription_tier === 'pro' && profile.subscription_status === 'active') {
            console.log('\n✨ POWER TEST PASSED!');
        } else {
            console.error('\n❌ Verification Failed: Database values do not match expected results.');
        }

    } catch (error) {
        console.error('\n💥 TEST FAILED:', error.message);
        process.exit(1);
    }
}

runPaymentPowerTest();

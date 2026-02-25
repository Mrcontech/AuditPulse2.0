import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Webhook } from "https://esm.sh/standardwebhooks"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Standard Webhooks verification logic moved to library use below

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const signature = req.headers.get('webhook-signature')
    const webhookId = req.headers.get('webhook-id')
    const webhookTimestamp = req.headers.get('webhook-timestamp')
    const secret = Deno.env.get('DODO_PAYMENTS_WEBHOOK_KEY')

    console.log('[DEBUG] Webhook Initialization:', {
        hasSignature: !!signature,
        hasId: !!webhookId,
        hasTimestamp: !!webhookTimestamp,
        hasSecret: !!secret,
        secretPrefix: secret ? `${secret.substring(0, 4)}...` : 'none'
    })

    if (!signature || !webhookId || !webhookTimestamp || !secret) {
        console.error('[ERROR] Missing required headers or secret')
        return new Response(JSON.stringify({ error: 'Missing headers or secret' }), { status: 400 })
    }

    const body = await req.text()

    try {
        const wh = new Webhook(secret)
        wh.verify(body, {
            "webhook-id": webhookId,
            "webhook-timestamp": webhookTimestamp,
            "webhook-signature": signature,
        })
        console.log('[DEBUG] Signature verification successful')
    } catch (err) {
        console.error('[ERROR] Signature verification failed:', err.message)
        // Return 401 with details for easier debugging in the short term
        return new Response(JSON.stringify({
            error: 'Invalid signature',
            message: err.message,
            timestamp: new Date().toISOString()
        }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const event = JSON.parse(body)
    console.log('[DEBUG] Received Dodo Event:', event.type)

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
        if (event.type === 'payment.succeeded' || event.type === 'subscription.created') {
            const data = event.data
            const userId = data.metadata?.userId
            const productId = data.product_id || data.product_cart?.[0]?.product_id

            if (userId) {
                console.log(`[DEBUG] Processing userId: ${userId}, productId: ${productId}`)

                let tier = 'free'
                let productName = 'Free Plan'

                const rawAmount = data.total_amount || data.amount || 0
                const amount = Number(rawAmount) / 100 // Convert from minor units (cents/kobo) to major units
                const currency = data.currency || 'USD'

                // Robust matching: ID-based OR Amount-based fallback for localized currencies
                const isProPrice =
                    (currency === 'USD' && amount >= 18) ||
                    (currency === 'NGN' && amount >= 25000) ||
                    (currency === 'GBP' && amount >= 14) ||
                    (currency === 'EUR' && amount >= 17);

                const isMaxPrice =
                    (currency === 'USD' && amount >= 45) ||
                    (currency === 'NGN' && amount >= 60000) ||
                    (currency === 'GBP' && amount >= 39) ||
                    (currency === 'EUR' && amount >= 44);

                if (productId === 'pdt_0NYUy3n4rUmePuUR2J0eF' || productId?.toLowerCase().includes('pro') || (isProPrice && !isMaxPrice)) {
                    tier = 'pro'
                    productName = 'Pro Plan'
                } else if (productId === 'pdt_0NYUyObQDb5CrAtOTzZiJ' || productId?.toLowerCase().includes('max') || isMaxPrice) {
                    tier = 'max'
                    productName = 'Max Plan'
                }

                // 1. Update Profile Subscription
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: tier,
                        subscription_status: 'active',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId)

                if (profileError) throw profileError
                console.log(`[SUCCESS] Updated user ${userId} to ${tier} tier.`)

                // 2. Log Payment in Billing History
                const paymentId = data.payment_id || data.subscription_id || event.id

                const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                        user_id: userId,
                        dodo_payment_id: paymentId,
                        amount: amount,
                        currency: currency,
                        status: 'succeeded',
                        product_name: productName,
                        product_id: productId
                    })

                if (paymentError) console.error('[ERROR] Failed to log payment:', paymentError.message)
            }
        }
        return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } catch (error) {
        console.error('[ERROR] Webhook processing failed:', error.message)
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})

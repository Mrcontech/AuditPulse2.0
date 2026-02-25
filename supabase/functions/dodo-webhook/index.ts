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

    console.log('Webhook Headers:', {
        'webhook-signature': signature ? 'present' : 'missing',
        'webhook-id': webhookId,
        'webhook-timestamp': webhookTimestamp
    })

    if (!signature || !webhookId || !webhookTimestamp || !secret) {
        console.error('Missing required headers or secret')
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
        console.log('Signature verification successful')
    } catch (err) {
        console.error('Signature verification failed:', err.message)
        return new Response(JSON.stringify({
            error: 'Invalid signature',
            details: err.message
        }), { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('Dodo Webhook Event:', event.type)

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
                // Map Product ID to Tier
                console.log(`Received Webhook for User ${userId}. Product ID: ${productId}`)

                let tier = 'free'
                let productName = 'Free Plan'

                // Flexible matching for Pro and Max plans
                if (productId === 'pdt_0NYUy3n4rUmePuUR2J0eF' || productId?.includes('pro')) {
                    tier = 'pro'
                    productName = 'Pro Plan'
                } else if (productId === 'pdt_0NYUyObQDb5CrAtOTzZiJ' || productId?.includes('max')) {
                    tier = 'max'
                    productName = 'Max Plan'
                } else {
                    console.warn(`Unrecognized Product ID: ${productId}. Defaulting to Free Plan.`)
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
                console.log(`Updated subscription for user ${userId} to ${tier}`)

                // 2. Log Payment in Billing History
                const rawAmount = data.total_amount || data.amount || 0
                const amount = Number(rawAmount) / 100 // Convert from minor units (cents/kobo) to major units
                const currency = data.currency || 'USD'
                const paymentId = data.payment_id || data.subscription_id || event.id

                console.log(`Processing payment: ${paymentId}, Amount: ${amount} ${currency}, Product ID: ${productId}`)

                const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                        user_id: userId,
                        dodo_payment_id: paymentId,
                        amount: amount,
                        currency: currency,
                        status: 'succeeded',
                        product_name: productName,
                    })

                if (paymentError) {
                    console.error('Failed to log payment to history:', paymentError.message)
                } else {
                    console.log(`Logged payment ${paymentId} for user ${userId}`)
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } catch (error) {
        console.error('Webhook Error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})

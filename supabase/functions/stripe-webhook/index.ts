import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.16.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

        console.log(`Received event: ${event.type}`)

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase environment variables')
            return new Response('Internal Server Error', { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.userId

                console.log(`Processing checkout.session.completed for user: ${userId}`)

                if (userId) {
                    const { error } = await supabase
                        .from('profiles')
                        .update({
                            subscription_tier: 'pro',
                            subscription_status: 'active',
                            stripe_customer_id: session.customer as string
                        })
                        .eq('id', userId)

                    if (error) {
                        console.error(`Error updating profile: ${error.message}`)
                        throw error
                    }
                }
                break
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                console.log(`Processing customer.subscription.deleted for customer: ${customerId}`)

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: 'free',
                        subscription_status: 'cancelled'
                    })
                    .eq('stripe_customer_id', customerId)

                if (error) {
                    console.error(`Error updating profile: ${error.message}`)
                    throw error
                }
                break
            }
            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})

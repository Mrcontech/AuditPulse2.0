const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Log Request Method
        console.log(`Incoming request: ${req.method}`)

        // 3. Parse JSON Body
        let body;
        try {
            body = await req.json();
        } catch (jsonErr) {
            console.error('JSON Parsing Error:', jsonErr.message);
            return new Response(
                JSON.stringify({ error: `Invalid JSON body: ${jsonErr.message}` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { productId, customerEmail, userId, returnUrl } = body;
        console.log('Request parameters:', { productId, customerEmail, userId, returnUrl });

        // 4. Validate Required Fields
        if (!productId || !customerEmail || !userId) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: productId, customerEmail, or userId' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 5. Get API Key
        const apiKey = Deno.env.get('DODO_PAYMENTS_API_KEY')
        if (!apiKey) {
            console.error('DODO_PAYMENTS_API_KEY is not set in project secrets')
            return new Response(
                JSON.stringify({ error: 'Payment service configuration error (API Key missing)' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 6. Call Dodo Payments API
        console.log('Calling Dodo Payments API with Product ID:', productId);

        const dodoRequestBody = {
            product_cart: [
                {
                    product_id: productId,
                    quantity: 1,
                },
            ],
            customer: {
                email: customerEmail,
            },
            return_url: returnUrl || `${req.headers.get('origin') || 'http://localhost:5173'}/dashboard`,
            metadata: {
                userId: userId,
            },
        };

        console.log('Dodo Request Body:', JSON.stringify(dodoRequestBody, null, 2));

        const dodoResponse = await fetch('https://test.dodopayments.com/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dodoRequestBody),
        })

        const dodoRawText = await dodoResponse.text();
        console.log('Dodo API Raw Response:', dodoRawText);
        console.log('Dodo API Status:', dodoResponse.status);

        let dodoData;
        try {
            dodoData = dodoRawText ? JSON.parse(dodoRawText) : {};
        } catch (e) {
            console.error('Failed to parse Dodo JSON:', e.message);
            throw new Error(`Dodo API returned invalid JSON: ${dodoRawText}`);
        }

        if (!dodoResponse.ok) {
            console.error('Dodo API Error Response:', dodoData);
            return new Response(
                JSON.stringify({
                    error: 'Dodo Payments API error',
                    details: dodoData,
                    status: dodoResponse.status,
                    sent_body: dodoRequestBody
                }),
                { status: dodoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 7. Return Success
        return new Response(
            JSON.stringify({ url: dodoData.checkout_url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Unexpected Edge Function Error:', error.message);
        return new Response(
            JSON.stringify({
                error: `Internal Server Error`,
                message: error.message,
                stack: error.stack
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

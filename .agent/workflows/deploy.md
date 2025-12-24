---
description: How to deploy AuditPulse Edge Functions and Frontend
---

# Deployment Guide

Follow these steps to deploy the AuditPulse application to Supabase and production.

## 1. Environment Secrets

You must set the following secrets in your Supabase project using the CLI:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
supabase secrets set FIRECRAWL_API_KEY=your_key
supabase secrets set PAGESPEED_API_KEY=your_key
supabase secrets set SERP_API_KEY=your_key
supabase secrets set TAVILY_API_KEY=your_key
supabase secrets set GEMINI_API_KEY=your_key
supabase secrets set STRIPE_SECRET_KEY=your_key
supabase secrets set STRIPE_WEBHOOK_SECRET=your_key
```

## 2. Deploy Edge Functions

Deploy all functions to your Supabase project:

// turbo
```bash
supabase functions deploy run-audit
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

## 3. Database Schema

Ensure you have run the migrations located in the `supabase/migrations` folder or use the Supabase Dashboard to create the `profiles`, `audits`, and `audit_results` tables with the appropriate RLS policies.

## 4. Frontend Deployment

Update your `.env` file with production values and run:

```bash
npm run build
```

Then deploy the `dist` folder to your favorite hosting provider (Vercel, Netlify, or Supabase Hosting).

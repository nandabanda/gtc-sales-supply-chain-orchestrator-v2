# GTC Sales & Supply Chain Orchestrator

A Cursor-ready and Vercel-ready Next.js demo for Olayan/GTC.

## What this demo includes

- Premium enterprise UI
- Command Center
- Demand Intelligence
- Replenishment Orchestrator
- Route Intelligence
- Execution Intelligence
- AI Action Board
- Synthetic GTC demo data
- KPI cards, charts, tables and AI-style recommendation panels

## Local setup

```bash
cd gtc-sales-supply-chain-orchestrator
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

For production:

```bash
vercel --prod
```

## Suggested demo story

1. Start at the landing page.
2. Open Command Center to show executive value leakage.
3. Open Demand Intelligence to show SKU/customer/route forecasting.
4. Open Replenishment Orchestrator to show customer-level supply recommendations.
5. Open Route Intelligence to show optimized route sequence.
6. Open Execution Intelligence to show supervisor actions.
7. End at AI Action Board to show governance and recommendation adoption.

## Future enhancements

- Add OpenAI/Vercel AI SDK API route for real conversational insights.
- Add Supabase/Postgres database.
- Add authentication.
- Add CSV upload for Olayan sample data.
- Add route map visualization using Google Maps or Mapbox.

# Trader Discipline System (TDS)

Stop revenge trading. Build real discipline.

## Stack
- **Frontend**: Next.js 14 + TypeScript
- **Backend**: Next.js API Routes
- **Database + Auth**: Supabase (free tier)
- **AI Analysis**: Claude Sonnet (Anthropic)
- **Hosting**: Vercel (free tier)

## Setup — 4 steps

### 1. Supabase Setup
1. Dir compte f [supabase.com](https://supabase.com) (free)
2. Create new project
3. F SQL Editor, run kolchi f `/supabase/schema.sql`
4. Copy URL + anon key mn Settings > API

### 2. Anthropic API Key
1. Dir compte f [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Free tier: $5 credit — kafi l bzaf dyal trades

### 3. Local Setup
```bash
git clone <your-repo>
cd trader-discipline-system
npm install

# Copy env file
cp .env.example .env.local
# Edit .env.local — zid Supabase URL + keys + Anthropic key

npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel (free)
```bash
npm install -g vercel
vercel
# Follow prompts — zid env variables f Vercel dashboard
```

## Features

### Pre-Trade Gate
- Pair + direction selection
- Lot size calculator (auto 7sab balance + risk %)
- 5-point checklist — machi permission bla checklist
- Mental state tracker
- Revenge trade timer (30 min cooldown ba3d loss)
- Overtrading detection (5+ trades/day)

### Trade Journal
- Calendar view m3a dots (win/loss/revenge)
- Full trade details (entry/SL/TP/RR)
- Screenshots upload
- AI feedback per trade (Claude AI)
- Monthly summary stats

### Weekly Report
- Win rate + PnL
- Discipline score
- Behavior flags (revenge, strategy breaks)
- AI coaching report (Darija/French)
- Pair + strategy win rates

## Project Structure
```
src/
  app/
    auth/page.tsx          — Login/Register
    dashboard/page.tsx     — Main app
    api/
      trades/route.ts      — CRUD trades
      ai-analysis/route.ts — Post-trade AI feedback
      weekly-report/route.ts — Weekly AI report
  components/
    trade/PreTradeGate.tsx — Pre-trade checklist + calculator
    journal/TradeJournal.tsx — Calendar journal
    dashboard/WeeklyReport.tsx — Weekly stats + AI
  lib/
    supabase.ts  — DB client
    trading.ts   — Calculators + helpers
  types/index.ts — TypeScript types
supabase/
  schema.sql     — Run this in Supabase SQL editor
```

## Cost Estimation
- Supabase: Free (up to 500MB, 50k requests/month)
- Vercel: Free (hobby plan)
- Anthropic: ~$0.003 per trade feedback, ~$0.015 per weekly report
  → 100 trades/month ≈ $0.30-0.50/month

## Next Features (v0.3)
- [ ] Multi-user leaderboard (discipline score ranking)
- [ ] MT4/MT5 trade import (CSV)
- [ ] Push notifications (revenge alert)
- [ ] Mobile app (React Native)
- [ ] Prop firm rules integration (FTMO, The5ers...)

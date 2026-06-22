# Family CFO — Expense Intelligence Agent

Personal finance tracker for the family. Add expenses by uploading receipt photos or pasting bank SMS messages — Claude AI extracts everything automatically.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your Anthropic API key** to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Initialize database:**
   ```bash
   npm run db:migrate
   ```

4. **Run:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Features

- **Receipt Photos** — Take a photo of any receipt; AI extracts merchant, amount, items
- **Bank SMS** — Paste Emirates NBD, FAB, ADCB, or any bank SMS; auto-classified
- **Manual Entry** — Type "Paid 120 AED at Starbucks" in plain English
- **Dashboard** — Monthly totals, category breakdown, per-person spending, forecasts
- **AI Insights** — Financial health score, savings opportunities, spending alerts
- **Family Tracking** — Separate tracking for Faisal, Wife, Children, Shared expenses

## Family Members

- Faisal
- Wife
- Child
- Shared (household expenses)

## Expense Categories

Housing · Transportation · Food & Dining · Family · Health · Entertainment · Travel · Technology · Investments · Miscellaneous

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma database GUI
```

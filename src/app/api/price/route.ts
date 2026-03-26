import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY

// Forex + Crypto + Commodities → TwelveData
const TD_MAP: Record<string, string> = {
  'EURUSD': 'EUR/USD', 'GBPUSD': 'GBP/USD', 'USDJPY': 'USD/JPY',
  'USDCHF': 'USD/CHF', 'AUDUSD': 'AUD/USD', 'USDCAD': 'USD/CAD',
  'NZDUSD': 'NZD/USD', 'EURGBP': 'EUR/GBP', 'EURJPY': 'EUR/JPY',
  'GBPJPY': 'GBP/JPY', 'EURCHF': 'EUR/CHF', 'EURCAD': 'EUR/CAD',
  'GBPCAD': 'GBP/CAD', 'GBPCHF': 'GBP/CHF', 'CADJPY': 'CAD/JPY',
  'AUDCAD': 'AUD/CAD', 'AUDNZD': 'AUD/NZD', 'CHFJPY': 'CHF/JPY',
  'XAUUSD': 'XAU/USD', 'XAGUSD': 'XAG/USD',
  'BTCUSD': 'BTC/USD', 'ETHUSD': 'ETH/USD', 'BNBUSD': 'BNB/USD',
  'XRPUSD': 'XRP/USD', 'SOLUSD': 'SOL/USD', 'ADAUSD': 'ADA/USD',
  'USOIL': 'WTI/USD', 'UKOIL': 'BRENT/USD', 'NATGAS': 'NATGAS/USD',
}

// Indices → Yahoo Finance symbols
const YAHOO_MAP: Record<string, string> = {
  'SP500': '%5EGSPC', 'US100': '%5EIXIC', 'US30': '%5EDJI',
  'DAX': '%5EGDAXI', 'FTSE': '%5EFTSE', 'CAC40': '%5EFCHI',
  'NI225': '%5EN225', 'ASX200': '%5EAXJO',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })

  try {
    // Yahoo Finance for indices
    if (YAHOO_MAP[symbol]) {
      const yahooSym = YAHOO_MAP[symbol]
      const res = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/' + yahooSym + '?interval=1m&range=1d',
        { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 10 } }
      )
      const data = await res.json()
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (price) return NextResponse.json({ price: parseFloat(price), symbol })
    }

    // TwelveData for forex/crypto/commodities
    const tdSymbol = TD_MAP[symbol] || symbol
    const res = await fetch(
      'https://api.twelvedata.com/price?symbol=' + tdSymbol + '&apikey=' + API_KEY,
      { next: { revalidate: 10 } }
    )
    const data = await res.json()
    if (data.price) return NextResponse.json({ price: parseFloat(data.price), symbol })

    return NextResponse.json({ error: 'Price not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'API error' }, { status: 500 })
  }
}

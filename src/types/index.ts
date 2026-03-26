export type Direction = 'BUY' | 'SELL'
export type TradeResult = 'win' | 'loss' | 'breakeven'

export interface Trade {
  id: string
  user_id: string
  date: string
  pair: string
  direction: Direction
  entry?: number
  stop_loss?: number
  take_profit?: number
  result: TradeResult
  pnl: number
  actual_rr?: number
  planned_rr?: number
  lot_size?: number
  strategy?: string
  is_revenge: boolean
  is_strategy_break: boolean
  is_overtrading: boolean
  mood?: number
  notes?: string
  screenshot_url?: string
  ai_feedback?: string
  discipline_score: number
  created_at: string
  exit_price?: number
  duration_minutes?: number
  gains_percent?: number
}

export interface DailyStats {
  date: string
  total_trades: number
  wins: number
  losses: number
  total_pnl: number
  revenge_count: number
  strategy_breaks: number
  discipline_score: number
}

export interface Profile {
  id: string
  email: string
  username?: string
  full_name?: string
  account_balance: number
  risk_percent: number
  max_daily_trades: number
  trial_start_date?: string | null
  is_pro?: boolean
  country?: string
}

export interface PreTradeData {
  pair: string
  direction: Direction
  entry?: number
  stop_loss?: number
  take_profit?: number
  lot_size?: number
  strategy?: string
  mood: number
  checklist: {
    sl_on_structure: boolean
    rr_minimum: boolean
    htf_trend: boolean
    has_setup: boolean
    no_big_loss: boolean
  }
}

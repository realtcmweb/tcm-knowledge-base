import { NextRequest, NextResponse } from 'next/server'

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN_TCMFRONT || '8297993818:AAGqQqvQl92hR57IQTIQHMzxtXMHFZOS_ps'
const TG_CHAT_ID = '8217693055'

export async function POST(req: NextRequest) {
  try {
    const { step, issue, detail } = await req.json()
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })

    // Save to backend (best-effort)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, issue, detail, timestamp }),
        signal: AbortSignal.timeout(4000),
      })
    } catch {
      // backend unreachable is OK
    }

    // Send Telegram notification directly
    const msg = `🔔 收到網站回報\n━━━━━━━━━━━━\n📄 頁面：${step}\n🐛 問題：${issue}\n💬 補充：${detail || '（無）'}\n━━━━━━━━━━━━\n🕐 ${timestamp}`

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: msg,
          parse_mode: 'HTML',
        }),
        signal: AbortSignal.timeout(8000),
      })
      if (!tgRes.ok) {
        console.warn('[FEEDBACK] Telegram send failed:', await tgRes.text())
      }
    } catch (e) {
      console.warn('[FEEDBACK] Telegram notify error:', e)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to log feedback' }, { status: 500 })
  }
}

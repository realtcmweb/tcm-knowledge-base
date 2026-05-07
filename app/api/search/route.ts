import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ results: [] })

  try {
    const r = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000),
    })
    const data = await r.json()
    return NextResponse.json(data)
  } catch (e) {
    console.error('Backend error:', e)
    return NextResponse.json({ error: '搜尋服務暫時無法使用' }, { status: 503 })
  }
}

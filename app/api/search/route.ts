import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://152.53.240.253:8000'

// 代理到後端 /api/search/diagnosis（綜合問診搜尋）
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  const k = req.nextUrl.searchParams.get('k') || '10'
  if (!q) return NextResponse.json({ results: [] })

  try {
    const r = await fetch(
      `${API_BASE}/api/search/diagnosis?q=${encodeURIComponent(q)}&k=${k}`,
      {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
      }
    )
    const data = await r.json()
    return NextResponse.json(data)
  } catch (e) {
    console.error('Backend search error:', e)
    return NextResponse.json({ error: '搜尋服務暫時無法使用' }, { status: 503 })
  }
}
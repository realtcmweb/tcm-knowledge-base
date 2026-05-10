import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, context } = body
    
    if (!question?.trim()) {
      return NextResponse.json({ ok: false, error: '請輸入您的症狀或問題' })
    }
    
    const res = await fetch(`${API_URL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    })
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ ok: false, error: '後端服務目前無法使用，請稍後再試' }, { status: 503 })
  }
}
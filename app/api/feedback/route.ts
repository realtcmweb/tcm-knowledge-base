import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth'

const API_URL = process.env.API_BACKEND_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const { step, issue, detail } = await req.json()

    
    // Save to backend via proxy so backend can notify the agent
    const timestamp = new Date().toLocaleString('zh-TW')
    try {
      await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, issue, detail, timestamp }),
        signal: AbortSignal.timeout(5000),
      })
    } catch (e) {
      // Backend unreachable — log locally, don't fail the user
      console.warn(`[FEEDBACK] backend unreachable, logging locally: ${e}`)
    }
    
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to log feedback' }, { status: 500 })
  }
}
import { auth } from '../../../auth'
import { NextRequest, NextResponse } from 'next/server'

const AUTH_API_URL = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL?.replace(':8000', ':8001') || 'https://coinss.noip.me:8001'

// GET /api/diagnoses — 取得會員所有歷史
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = (session as any).accessToken || session.user?.id
  const res = await fetch(`${AUTH_API_URL}/api/diagnoses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch' }))
    return NextResponse.json({ error: err.error || 'Failed to fetch' }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}

// POST /api/diagnoses — 儲存新分析
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const token = (session as any).accessToken || session.user?.id

  const res = await fetch(`${AUTH_API_URL}/api/diagnoses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to save' }))
    return NextResponse.json({ error: err.error || 'Failed to save' }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data, { status: 201 })
}

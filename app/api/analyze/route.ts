import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Frontend sends all answer fields at top level.
    // Merge them into answers for the backend API which expects data['answers'].
    const { answers: nestedAnswers, ...rest } = body
    const answers = nestedAnswers || rest   // use whatever the frontend sent
    const payload = { ...rest, answers }   // backend expects: { ...fields, answers: {...} }
    const res = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Backend unavailable' }, { status: 503 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image')

    if (!image || typeof image === 'string') {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const backendFormData = new FormData()
    backendFormData.append('image', image)

    const res = await fetch(`${apiUrl}/api/tongue`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Tongue analysis failed' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
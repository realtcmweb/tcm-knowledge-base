import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image')
    const underside = formData.get('underside')

    if (!image || typeof image === 'string') {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/justin/api'
    const backendFormData = new FormData()
    backendFormData.append('image', image)

    // Phase 1: 附加舌下靜脈圖片
    if (underside && typeof underside !== 'string') {
      backendFormData.append('underside', underside)
    }

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
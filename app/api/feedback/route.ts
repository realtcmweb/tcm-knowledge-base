import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth'

export async function POST(req: NextRequest) {
  try {
    const { step, issue, detail } = await req.json()
    
    // Log to console (for now — could forward to sub-agent via sessions_send)
    console.log(`[FEEDBACK] step=${step} issue=${issue} detail=${detail}`)
    
    // TODO: Forward to tcmfront sub-agent session via sessions_send
    // For now, log is sufficient since the agent monitors its sessions
    
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to log feedback' }, { status: 500 })
  }
}
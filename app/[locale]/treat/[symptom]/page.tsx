'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const navItems = [
  { href: '/acu', label: '針灸大全', emoji: '💉' },
  { href: '/db', label: '方劑大全', emoji: '🍵' },
  { href: '/treat', label: '針灸治療', emoji: '💊', active: true },
  { href: '/symptoms', label: '症狀大全', emoji: '🩺' },
]

interface Treatment {
  name: string
  nameTc: string
  mainPoints: { name: string; code: string }[]
  paired: Record<string, string>
  zhifa: string
  fangyi: string
  caozuo: string
}

let treatmentsData: Treatment[] | null = null
async function loadTreatments(): Promise<Treatment[]> {
  if (treatmentsData) return treatmentsData
  const r = await fetch('/data/treatments.json')
  treatmentsData = await r.json()
  return treatmentsData!
}

function AcupointLink({ name, code }: { name: string; code: string }) {
  return (
    <Link href={`/acu?q=${encodeURIComponent(name)}`} style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '5px 10px', backgroundColor: '#FDF3E7', borderRadius: '20px',
      border: '1px solid #E8C99A', textDecoration: 'none', fontSize: '12px',
      color: '#8B4513', fontWeight: 700,
    }}>
      {name}
      {code && <span style={{ fontSize: '10px', opacity: 0.7 }}>{code}</span>}
    </Link>
  )
}

export default function TreatDetailPage() {
  const params = useParams()
  const symptom = typeof params.symptom === 'string' ? decodeURIComponent(params.symptom) : ''
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTreatments().then(data => {
      const t = data.find(d => d.name === symptom)
      setTreatment(t || null)
      setLoading(false)
    })
  }, [symptom])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7A7A6A', fontSize: '14px' }}>載入中...</div>
      </div>
    )
  }

  if (!treatment) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0' }}>
        <div style={{ background: '#1a3A2C', padding: '20px', borderRadius: '0 0 20px 20px', textAlign: 'center', color: '#FFFEF9' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>找不到這個症狀的針灸處方</div>
          <Link href="/treat" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', backgroundColor: '#FFFEF9', color: '#1a3A2C', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
            返回治療頁面
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F7F5F0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#1a3A2C', color: '#FFFEF9', padding: '0 0 16px',
        borderRadius: '0 0 20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: '50px' }}>
          <Link href="/treat" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
            <span style={{ fontSize: '15px' }}>←</span><span>返回</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700 }}>針灸治療</div>
          <div style={{ width: 60 }} />
        </div>

        {/* 3-Tab Nav */}
        <div style={{ display: 'flex', padding: '0 14px 0', gap: '7px' }}>
          {navItems.map(tab => (
            <Link key={tab.href} href={tab.href} style={{
              flex: 1, padding: '10px 4px',
              backgroundColor: tab.active ? '#FFFEF9' : 'rgba(255,254,249,0.12)',
              color: tab.active ? '#1a3A2C' : 'rgba(255,254,249,0.8)',
              borderRadius: '12px', textDecoration: 'none', fontSize: '11px', fontWeight: 700, textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.emoji}</div>
              <div>{tab.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Symptom Title */}
      <div style={{ padding: '20px 16px 16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1a2C24', marginBottom: '4px' }}>
          {treatment.name}
        </h1>
        <div style={{ fontSize: '12px', color: '#8A8A7A' }}>針灸治療處方</div>
      </div>

      {/* Main Points */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px', border: '1.5px solid #E8E4DC', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px' }}>💉</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>主穴</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E4DC' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {treatment.mainPoints.length > 0 ? (
              treatment.mainPoints.map(p => (
                <AcupointLink key={p.name} name={p.name} code={p.code} />
              ))
            ) : (
              <span style={{ fontSize: '13px', color: '#8A8A7A' }}>處方資料整理中</span>
            )}
          </div>
        </div>
      </div>

      {/* Paired Points by Syndrome */}
      {Object.keys(treatment.paired).length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px', border: '1.5px solid #E8E4DC', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <span style={{ fontSize: '15px' }}>🔗</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>配穴（按證型）</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E4DC' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(treatment.paired).map(([syndrome, desc]) => (
                <div key={syndrome} style={{ backgroundColor: '#F7F5F0', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#8B4513', marginBottom: '6px' }}>▎ {syndrome}</div>
                  <div style={{ fontSize: '13px', color: '#2C3428', lineHeight: 1.7 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zhifa */}
      {treatment.zhifa && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px', border: '1.5px solid #E8E4DC', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px' }}>⚕️</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>治法</span>
            </div>
            <div style={{ fontSize: '14px', color: '#2C3428', lineHeight: 1.7 }}>{treatment.zhifa}</div>
          </div>
        </div>
      )}

      {/* Fangyi */}
      {treatment.fangyi && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px', border: '1.5px solid #E8E4DC', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px' }}>📖</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>方義</span>
            </div>
            <div style={{ fontSize: '14px', color: '#2C3428', lineHeight: 1.7 }}>{treatment.fangyi}</div>
          </div>
        </div>
      )}

      {/* Caozuo */}
      {treatment.caozuo && (
        <div style={{ padding: '0 16px 100px' }}>
          <div style={{ backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px', border: '1.5px solid #E8E4DC', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px' }}>🪡</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>操作</span>
            </div>
            <div style={{ fontSize: '14px', color: '#2C3428', lineHeight: 1.7 }}>{treatment.caozuo}</div>
          </div>
        </div>
      )}
    </div>
  )
}
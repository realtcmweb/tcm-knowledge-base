'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'

interface Acupoint {
  id: number
  code: string
  name: string
  meridian: string
  meridianName: string
  location: string
  indications: string
}

interface Formula {
  id: number
  name: string
  source: string
  effects: string
  indications: string
}

const MERIDIANS = [
  { code: 'LU', name: '肺經' }, { code: 'LI', name: '大腸經' },
  { code: 'ST', name: '胃經' }, { code: 'SP', name: '脾經' },
  { code: 'HT', name: '心經' }, { code: 'SI', name: '小腸經' },
  { code: 'BL', name: '膀胱經' }, { code: 'KI', name: '腎經' },
  { code: 'PC', name: '心包經' }, { code: 'SJ', name: '三焦經' },
  { code: 'GB', name: '膽經' }, { code: 'LV', name: '肝經' },
]

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'acupoints' | 'formulas'>('all')
  const [results, setResults] = useState<Array<{ type: string; name: string; sub: string; id: string }>>([])
  const [searched, setSearched] = useState(false)
  const [acupoints, setAcupoints] = useState<Acupoint[]>([])
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/data/acupoints.json').then(r => r.json()),
      fetch('/data/formulas.json').then(r => r.json()),
    ]).then(([a, f]) => {
      setAcupoints(a)
      setFormulas(f)
      setLoading(false)
    })
  }, [])

  const handleSearch = () => {
    if (!search.trim()) return
    const q = search.toLowerCase()
    const found: Array<{ type: string; name: string; sub: string; id: string }> = []

    if (searchType === 'all' || searchType === 'acupoints') {
      acupoints.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.meridianName.includes(q)
      ).slice(0, 5).forEach(a => {
        found.push({ type: '穴位', name: a.name, sub: `${a.code} · ${a.meridianName}`, id: a.code })
      })
    }

    if (searchType === 'all' || searchType === 'formulas') {
      formulas.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.source.toLowerCase().includes(q)
      ).slice(0, 5).forEach(f => {
        found.push({ type: '方劑', name: f.name, sub: `出自《${f.source}》`, id: String(f.id) })
      })
    }

    setResults(found)
    setSearched(true)
  }

  const accentColor = '#2C4A3E'
  const bgColor = '#FAFAF7'
  const cardBg = '#FFFFFF'
  const borderColor = '#E5E2DA'
  const textColor = '#1C2C24'
  const mutedColor = '#7A7A6A'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(160deg, ${accentColor} 0%, #3D5A4E 100%)`,
        color: '#FAFAF7',
        padding: '48px 24px 56px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          中醫資料庫
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '28px', lineHeight: 1.6 }}>
          收錄針灸穴位、經典方劑，免費查閱
        </p>

        {/* Search Box */}
        <div style={{
          maxWidth: '520px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <span style={{ fontSize: '18px', opacity: 0.7 }}>🔍</span>
            <input
              type="text"
              placeholder={loading ? '載入中...' : '搜尋穴位或方劑...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              disabled={loading}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '16px',
                color: '#FAFAF7'
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '14px 24px',
              backgroundColor: '#FAFAF7',
              color: accentColor,
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            搜尋
          </button>
        </div>

        {/* Type Toggle */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '14px' }}>
          {(['all', 'acupoints', 'formulas'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              style={{
                padding: '6px 16px',
                backgroundColor: searchType === type ? '#FAFAF7' : 'transparent',
                color: searchType === type ? accentColor : 'rgba(255,255,255,0.85)',
                border: `1px solid ${searchType === type ? '#FAFAF7' : 'rgba(255,255,255,0.3)'}`,
                borderRadius: '20px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {type === 'all' ? '全部' : type === 'acupoints' ? '穴位' : '方劑'}
            </button>
          ))}
        </div>

        {/* Search Results */}
        {searched && (
          <div style={{
            maxWidth: '520px',
            margin: '16px auto 0',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}>
            {results.length === 0 ? (
              <div style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                找不到「{search}」，試試其他關鍵字
              </div>
            ) : (
              results.map((r, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <span style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', marginRight: '8px' }}>{r.type}</span>
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '8px' }}>{r.sub}</span>
                  </div>
                  <Link href="/db" style={{ color: '#FAFAF7', fontSize: '12px', textDecoration: 'none', opacity: 0.7 }}>查看 →</Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        backgroundColor: borderColor,
        borderTop: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`
      }}>
        {[
          { emoji: '💉', count: '390', label: '針灸穴位' },
          { emoji: '🍵', count: '205', label: '經典方劑' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '24px 16px',
            backgroundColor: cardBg,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{stat.emoji}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: textColor }}>{stat.count}</div>
            <div style={{ fontSize: '13px', color: mutedColor }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginBottom: '16px' }}>
          資料庫
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/db" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px',
            backgroundColor: cardBg,
            borderRadius: '14px',
            border: `1px solid ${borderColor}`,
            textDecoration: 'none',
          }}>
            <div style={{ fontSize: '36px' }}>💉</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '2px' }}>針灸庫</div>
              <div style={{ fontSize: '13px', color: mutedColor }}>390 個穴位，按十二經絡分類</div>
            </div>
            <div style={{ fontSize: '20px', color: mutedColor }}>→</div>
          </Link>

          <Link href="/db" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px',
            backgroundColor: cardBg,
            borderRadius: '14px',
            border: `1px solid ${borderColor}`,
            textDecoration: 'none',
          }}>
            <div style={{ fontSize: '36px' }}>🍵</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '2px' }}>方劑庫</div>
              <div style={{ fontSize: '13px', color: mutedColor }}>205 首經典方劑，出自《傷寒論》《金匱》等</div>
            </div>
            <div style={{ fontSize: '20px', color: mutedColor }}>→</div>
          </Link>
        </div>
      </div>

      {/* Meridian Grid */}
      <div style={{ padding: '0 24px 24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginBottom: '16px' }}>
          十二經絡
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {MERIDIANS.map(m => (
            <Link
              key={m.code}
              href={`/db`}
              style={{
                padding: '14px 8px',
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 700, color: accentColor, marginBottom: '2px' }}>{m.code}</div>
              <div style={{ fontSize: '12px', color: mutedColor }}>{m.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 24px',
        borderTop: `1px solid ${borderColor}`,
        textAlign: 'center',
        fontSize: '12px',
        color: mutedColor
      }}>
        本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。
      </div>
    </div>
  )
}
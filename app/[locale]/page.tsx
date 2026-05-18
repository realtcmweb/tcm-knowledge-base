'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [acupointsCount, setAcupointsCount] = useState(0)
  const [formulasCount, setFormulasCount] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/data/acupoints.json').then(r => r.json()),
      fetch('/data/formulas.json').then(r => r.json()),
    ]).then(([a, f]) => {
      setAcupointsCount(a.length)
      setFormulasCount(f.length)
      setLoading(false)
    })
  }, [])

  const handleSearch = () => {
    if (!search.trim()) return
    router.push(`/db?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F7F5F0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif'
    }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #1a3A2C 0%, #2C4A3E 60%, #3D6B54 100%)',
        color: '#FFFEF9',
        padding: '36px 20px 44px',
        borderRadius: '0 0 28px 28px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px', letterSpacing: '0.03em', textAlign: 'center' }}>
          📖 中醫資料庫
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.75, marginBottom: '24px', textAlign: 'center' }}>
          針灸 · 方劑 · 中藥　三合一
        </p>

        {/* Search Box */}
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: 'rgba(255,254,249,0.15)',
            borderRadius: '16px', padding: '14px 16px',
            border: '1.5px solid rgba(255,254,249,0.25)',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ fontSize: '18px', opacity: 0.8 }}>🔍</span>
            <input
              type="text"
              placeholder={loading ? '載入中...' : '搜尋穴位、方劑...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              disabled={loading}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                outline: 'none', fontSize: '15px', color: '#FFFEF9',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: '50%',
                width: '22px', height: '22px', cursor: 'pointer',
                fontSize: '11px', color: '#FFFEF9', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            )}
            <button
              onClick={handleSearch}
              disabled={loading || !search.trim()}
              style={{
                padding: '8px 18px',
                backgroundColor: search.trim() ? '#FFFEF9' : 'rgba(255,254,249,0.3)',
                color: '#1a3A2C',
                border: 'none', borderRadius: '20px',
                fontSize: '13px', fontWeight: 700,
                cursor: search.trim() ? 'pointer' : 'default',
              }}
            >
              搜尋
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '20px' }}>
          {[
            { emoji: '💉', count: loading ? '...' : acupointsCount, label: '針灸穴位' },
            { emoji: '🍵', count: loading ? '...' : formulasCount, label: '經典方劑' },
            { emoji: '🌿', count: '?', label: '中藥材' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '2px' }}>{s.emoji}</div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>{s.count}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
        }}>
          {[
            { href: '/', label: '首頁', emoji: '🏠', active: true },
            { href: '/db', label: '針灸庫', emoji: '💉', active: false },
            { href: '/db', label: '方劑庫', emoji: '🍵', active: false },
          ].map(tab => (
            <Link
              key={tab.label}
              href={tab.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '14px 8px',
                backgroundColor: tab.active ? '#1a3A2C' : '#FFFEF9',
                color: tab.active ? '#FFFEF9' : '#1a2C24',
                borderRadius: '16px', textDecoration: 'none',
                border: `1.5px solid ${tab.active ? '#1a3A2C' : '#E8E4DC'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{tab.emoji}</div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{tab.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2C24', marginBottom: '12px', paddingLeft: '4px' }}>
          中藥庫即將上線
        </h2>

        {[
          {
            emoji: '💉', title: '針灸庫', sub: '針灸穴位',
            desc: `${loading ? '...' : acupointsCount} 個穴位，WHO 國際標準編碼`,
            tags: ['十二經絡', '奇經八脈', '經外奇穴'],
            color: '#2C4A3E', bg: '#EEF4F0',
          },
          {
            emoji: '🍵', title: '方劑庫', sub: '經典方劑',
            desc: `${loading ? '...' : formulasCount} 首方劑，出自《傷寒論》《金匱》`,
            tags: ['解表劑', '清熱劑', '補益劑', '更多'],
            color: '#8B4513', bg: '#FDF3E7',
          },
          {
            emoji: '🌿', title: '中藥庫', sub: '中藥材',
            desc: '三百餘味中藥，藥性、歸經、功效',
            tags: ['性味', '歸經', '主治'],
            color: '#5A6A1A', bg: '#F0F4E0',
            upcoming: true,
          },
        ].map((card, i) => (
          <Link
            key={i}
            href={card.upcoming ? '#' : '/db'}
            style={{
              display: 'block', marginBottom: '10px',
              padding: '18px 18px 14px',
              backgroundColor: card.bg,
              borderRadius: '18px',
              border: `1.5px solid ${card.upcoming ? 'transparent' : '#E0DDD5'}`,
              textDecoration: 'none',
              opacity: card.upcoming ? 0.75 : 1,
              cursor: card.upcoming ? 'default' : 'pointer',
            }}
            onClick={e => card.upcoming && e.preventDefault()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
              <div style={{ fontSize: '36px', lineHeight: 1 }}>{card.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '17px', fontWeight: 800, color: '#1a2C24' }}>{card.title}</span>
                  <span style={{ fontSize: '11px', color: card.color, backgroundColor: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    {card.sub}
                  </span>
                  {card.upcoming && (
                    <span style={{ fontSize: '10px', color: '#7A7A6A', backgroundColor: 'rgba(0,0,0,0.08)', padding: '2px 8px', borderRadius: '10px' }}>
                      即將上線
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#5A5A4A', lineHeight: 1.5 }}>{card.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {card.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', color: card.color,
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  padding: '3px 10px', borderRadius: '12px', fontWeight: 600,
                }}>{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* 12 Meridian Quick Access */}
      <div style={{ padding: '0 16px 16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2C24', marginBottom: '12px', paddingLeft: '4px' }}>
          十二經絡快速查詢
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { code: 'LU', name: '肺經', emoji: '🌬️' }, { code: 'LI', name: '大腸經', emoji: '💨' },
            { code: 'ST', name: '胃經', emoji: '🍚' }, { code: 'SP', name: '脾經', emoji: '🟤' },
            { code: 'HT', name: '心經', emoji: '❤️' }, { code: 'SI', name: '小腸經', emoji: '🔥' },
            { code: 'BL', name: '膀胱經', emoji: '💧' }, { code: 'KI', name: '腎經', emoji: '🌙' },
            { code: 'PC', name: '心包經', emoji: '🫀' }, { code: 'SJ', name: '三焦經', emoji: '🔥' },
            { code: 'GB', name: '膽經', emoji: '💚' }, { code: 'LV', name: '肝經', emoji: '🌳' },
          ].map(m => (
            <Link
              key={m.code}
              href="/db"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '12px 4px',
                backgroundColor: '#FFFEF9',
                border: '1.5px solid #E8E4DC',
                borderRadius: '14px', textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: '16px', marginBottom: '3px' }}>{m.emoji}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a3A2C' }}>{m.code}</span>
              <span style={{ fontSize: '10px', color: '#8A8A7A' }}>{m.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 24px',
        borderTop: '1px solid #E8E4DC',
        textAlign: 'center', fontSize: '11px', color: '#8A8A7A',
        backgroundColor: '#FFFEF9',
      }}>
        ⚠️ 本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。
      </div>
    </div>
  )
}
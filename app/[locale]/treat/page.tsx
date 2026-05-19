'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import treatments from '../../../public/data/treatments.json'

const navItems = [
  { href: '/acu', label: '針灸大全', emoji: '💉' },
  { href: '/db', label: '方劑大全', emoji: '🍵' },
  { href: '/treat', label: '針灸治療', emoji: '💊', active: true },
  { href: '/symptoms', label: '症狀大全', emoji: '🩺' },
]

// Categorize symptoms
const CATEGORIES = [
  { key: 'all', label: '全部', emoji: '✨' },
  { key: 'nei', label: '內科', emoji: '🫀' },
  { key: 'fu', label: '婦科', emoji: '🤰' },
  { key: 'waike', label: '外科', emoji: '🩹' },
  { key: 'erm', label: '耳口鼻', emoji: '👂' },
  { key: 'shenjing', label: '神經精神', emoji: '🧠' },
  { key: 'guanjie', label: '骨關節', emoji: '🦴' },
]

const SYMPTOM_MAP: Record<string, string[]> = {
  nei: ['头痛', '腰痛', '感冒', '咳嗽', '胃痛', '呃逆', '泄泻', '胁痛', '淋证', '不寐', '郁证', '高血压病', '肥胖症'],
  fu: ['月经不调', '崩漏', '带下病', '胎位不正', '阴挺', '遗尿', '早泄', '消渴'],
  waike: ['中风', '外伤性截瘫', '肠痈', '脱肛', '痔疮', '乳癖', '瘙痒症'],
  erm: ['牙痛', '口疮', '戒断综合征', '婷耳'],
  shenjing: ['震颤麻痹', '痴呆', '孤独症', '抽搐', '出血证'],
  guanjie: ['膝骨性关节炎', '视神经萎缩'],
}

function getCategory(symptomName: string): string {
  for (const [cat, names] of Object.entries(SYMPTOM_MAP)) {
    if (names.includes(symptomName)) return cat
  }
  return 'nei'
}

export default function TreatPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')

  const filtered = treatments.filter(t => {
    if (cat !== 'all' && getCategory(t.name) !== cat) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return t.name.toLowerCase().includes(q)
    }
    return true
  })

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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
            <span style={{ fontSize: '15px' }}>🏠</span><span>首頁</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700 }}>針灸治療</div>
          <div style={{ width: 60 }} />
        </div>

        {/* Search */}
        <div style={{ padding: '0 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,254,249,0.15)', borderRadius: '14px', padding: '11px 14px', border: '1.5px solid rgba(255,254,249,0.25)' }}>
            <span style={{ fontSize: '16px', opacity: 0.8 }}>🔍</span>
            <input type="text" placeholder="搜尋症狀..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#FFFEF9' }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            )}
          </div>
        </div>

        {/* 3-Tab Nav */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: '7px' }}>
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

      {/* Category tabs */}
      <div style={{ padding: '12px 14px 0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '12px',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 700,
            backgroundColor: cat === c.key ? '#1a3A2C' : '#E8E4DC',
            color: cat === c.key ? '#FFFEF9' : '#4A3A2C',
          }}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div style={{ padding: '8px 16px 4px', fontSize: '11px', color: '#8A8A7A' }}>
        {filtered.length} 個治療處方
      </div>

      {/* Grid */}
      <div style={{ padding: '0 14px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {filtered.map(t => (
          <Link key={t.name} href={`/treat/${encodeURIComponent(t.name)}`} style={{
            backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
            textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1.5px solid #E8E4DC', display: 'block',
          }}>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#1a2C24', marginBottom: '6px' }}>
              {t.name}
            </div>
            <div style={{ fontSize: '11px', color: '#8B4513', marginBottom: '4px' }}>
              主穴：{t.mainPoints.slice(0, 3).map(p => p.name).join('、')}{t.mainPoints.length > 3 ? '...' : ''}
            </div>
            <div style={{ fontSize: '10px', color: '#8A8A7A' }}>
              {Object.keys(t.paired).length > 0 ? Object.keys(t.paired).slice(0, 2).join('、') : '綜合處方'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
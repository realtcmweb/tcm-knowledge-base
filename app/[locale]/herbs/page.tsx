'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Herb {
  name: string
  pinyin: string
  chapter: string
  nature: string
  efficacy: string
  applications: string
  usage: string
  contraindication: string
  identification: string
}

const CATEGORIES = [
  { key: '', label: '全部', emoji: '✨' },
  { key: '解表药', label: '解表藥', emoji: '🌬️' },
  { key: '清热药', label: '清熱藥', emoji: '🔥' },
  { key: '泻下药', label: '瀉下藥', emoji: '💩' },
  { key: '祛风湿药', label: '祛風濕', emoji: '🌪️' },
  { key: '利水渗湿药', label: '利水滲濕', emoji: '💧' },
  { key: '温里药', label: '溫里藥', emoji: '🤝' },
  { key: '理气药', label: '理氣藥', emoji: '😤' },
  { key: '补虚药', label: '補虛藥', emoji: '💪' },
  { key: '安神药', label: '安神藥', emoji: '😴' },
  { key: '活血化瘀药', label: '活血化瘀', emoji: '❤️' },
  { key: '化痰止咳平喘药', label: '化痰止咳', emoji: '😷' },
  { key: '平肝息风药', label: '平肝息風', emoji: '🌀' },
  { key: '化湿药', label: '化濕藥', emoji: '🌿' },
  { key: '驱虫药', label: '驅蟲藥', emoji: '🐛' },
  { key: '消食药', label: '消食藥', emoji: '🍽️' },
  { key: '止血药', label: '止血藥', emoji: '🩸' },
  { key: '收涩药', label: '收澀藥', emoji: '🔒' },
  { key: '开窍药', label: '開竅藥', emoji: '🌸' },
  { key: '攻毒杀虫止痒药', label: '攻毒殺蟲', emoji: '⚔️' },
  { key: '拔毒化腐生肌药', label: '拔毒生肌', emoji: '🩹' },
  { key: '涌吐药', label: '湧吐藥', emoji: '🤮' },
]

const MENU_ITEMS = [
  { label: '📋 使用說明', href: '#', action: 'guide' },
  { label: '⚠️ 免責聲明', href: '#', action: 'disclaimer' },
  { label: 'ℹ️ 關於本站', href: '#', action: 'about' },
  { label: '📩 聯絡我們', href: '#', action: 'contact' },
]

function getCategory(chapter: string): string {
  if (!chapter) return '其他'
  const parts = chapter.split('　')
  return parts[1] || chapter
}

function formatSection(title: string, content: string): JSX.Element | null {
  if (!content || content === '（未收錄）') return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#2C4A3E', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ fontSize: 14, color: '#2C3428', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{content}</div>
    </div>
  )
}

export default function HerbsPage() {
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/data/herbs.json')
      .then(r => r.json())
      .then(d => { setHerbs(d); setLoading(false) })
  }, [])

  const filtered = herbs.filter(h => {
    if (selectedCat && getCategory(h.chapter) !== selectedCat) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return h.name.includes(q) || h.pinyin.toLowerCase().includes(q)
    }
    return true
  })

  const activeCat = CATEGORIES.find(c => c.key === selectedCat) || CATEGORIES[0]

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'disclaimer') setModalContent({ title: '⚠️ 免責聲明', body: '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。' })
    else if (action === 'about') setModalContent({ title: 'ℹ️ 關於本站', body: `📖 醫道中醫大全是一個開源的中醫藥知識庫。

🎯 目標：讓中醫藥知識更容易被查詢和學習。

📊 目前收錄：
• 374 個針灸穴位
• 205 首經典方劑
• ${herbs.length} 味中藥（持續更新）

❤️ 製作給所有中醫藥愛好者。` })
    else if (action === 'contact') setModalContent({ title: '📩 聯絡我們', body: '📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base\n\n我們會盡快回覆您。' })
    else if (action === 'guide') setModalContent({ title: '📋 使用說明', body: '🔍 搜尋：輸入中藥名稱或拼音\n\n📂 分類：按功效22大類篩選\n\n💡 點擊任意中藥卡片查看完整資料，包括：药性、功效、应用、用量、禁忌等。\n\n⚠️ 資料僅供學術參考，非醫囑。' })
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F7F5F0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#1a3A2C', color: '#FFFEF9',
        padding: '0 0 18px', borderRadius: '0 0 20px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: 50 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <span style={{ fontSize: 15 }}>🏠</span><span>首頁</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700 }}>🌿 中藥大全</div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', color: '#FFFEF9', backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              ☰ <span style={{ fontSize: 11 }}>選單</span>
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, backgroundColor: '#FFFEF9', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC' }}>
                {MENU_ITEMS.map((item, i) => (
                  <a key={i} href="#" onClick={e => { e.preventDefault(); if (item.action) handleMenuAction(item.action) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', color: '#1a2C24', textDecoration: 'none', fontSize: 13, fontWeight: 600, borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid #F0EDE5' : 'none' }}>
                    <span style={{ fontSize: 15 }}>{item.label.split(' ')[0]}</span>
                    <span style={{ flex: 1 }}>{item.label.split(' ').slice(1).join(' ')}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,254,249,0.15)', borderRadius: 14, padding: '11px 14px', border: '1.5px solid rgba(255,254,249,0.25)' }}>
            <span style={{ fontSize: 16, opacity: 0.8 }}>🔍</span>
            <input ref={searchRef} type="text" placeholder={loading ? '載入中...' : '搜尋中藥名稱、拼音...'} value={search} onChange={e => setSearch(e.target.value)}
              disabled={loading}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#FFFEF9' }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 10, color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            )}
          </div>
        </div>

        {/* 3-Tab Navigation */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: 7 }}>
          {[
            { href: '/acu', label: '針灸大全', emoji: '💉' },
            { href: '/db', label: '方劑大全', emoji: '🍵' },
            { href: '/symptoms', label: '症狀', emoji: '🩺' },
          ].map(tab => (
            <Link key={tab.label} href={tab.href} style={{ flex: 1, padding: '10px 4px', backgroundColor: tab.href === '/herbs' ? '#FFFEF9' : 'rgba(255,254,249,0.12)', color: tab.href === '/herbs' ? '#1a3A2C' : 'rgba(255,254,249,0.8)', border: 'none', borderRadius: 12, textDecoration: 'none', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{tab.emoji}</div>
              <div>{tab.label}</div>
            </Link>
          ))}
        </div>

        {/* Category pills */}
        <div style={{ padding: '10px 14px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: 6, minWidth: 'max-content' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setSelectedCat(cat.key)} style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                backgroundColor: selectedCat === cat.key ? '#FFFEF9' : 'rgba(255,254,249,0.15)',
                color: selectedCat === cat.key ? '#1a3A2C' : 'rgba(255,254,249,0.85)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ padding: '8px 16px 0', fontSize: 12, color: 'rgba(255,254,249,0.65)' }}>
          {loading ? '載入中...' : `${filtered.length} 味中藥`}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 100px' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A', fontSize: 14 }}>載入中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>找不到符合的中藥</div>
            <div style={{ fontSize: 12 }}>試試其他關鍵字或分類</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(h => (
              <button key={h.name} onClick={() => setSelectedHerb(h)} style={{
                backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC', borderRadius: 16, padding: '14px 16px',
                cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', width: '100%',
                transition: 'all 0.15s ease',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.borderColor = '#3A6A4A'
                  el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                  el.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.borderColor = '#E8E4DC'
                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                  el.style.transform = 'translateY(0)'
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#1a2C24', lineHeight: 1.3 }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: '#7A9A6A', marginTop: 2 }}>{h.pinyin}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#5A8A5A', backgroundColor: '#EEF4EE', padding: '3px 8px', borderRadius: 8, fontWeight: 600 }}>
                      {getCategory(h.chapter)}
                    </span>
                    <span style={{ fontSize: 14, color: '#CCC' }}>›</span>
                  </div>
                </div>
                {h.nature && h.nature !== '（未收錄）' && (
                  <div style={{ marginTop: 6, fontSize: 13, color: '#5A6A4A', lineHeight: 1.5 }}>
                    {h.nature.replace(/\n/g, ' ').substring(0, 80)}
                  </div>
                )}
                {h.efficacy && h.efficacy !== '（未收錄）' && (
                  <div style={{ marginTop: 3, fontSize: 12, color: '#8A7A5A' }}>
                    💡 {h.efficacy.replace(/\n/g, ' ').substring(0, 60)}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      {selectedHerb && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSelectedHerb(null)}>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88vh',
            backgroundColor: '#FFFEF9', borderRadius: '20px 20px 0 0', padding: '0 0 40px',
            overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 8px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D4D0C8' }} />
            </div>
            <div style={{ padding: '0 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a2C24', marginBottom: 4, lineHeight: 1.2 }}>{selectedHerb.name}</h2>
                  <div style={{ fontSize: 13, color: '#7A9A6A' }}>{selectedHerb.pinyin}</div>
                </div>
                <span style={{ fontSize: 11, color: '#5A8A5A', backgroundColor: '#EEF4EE', padding: '4px 10px', borderRadius: 8, fontWeight: 700, marginTop: 4 }}>
                  {getCategory(selectedHerb.chapter)}
                </span>
              </div>

              {formatSection('💊 药性', selectedHerb.nature)}
              {formatSection('✨ 功效', selectedHerb.efficacy)}
              {formatSection('📋 应用', selectedHerb.applications)}
              {formatSection('📖 用法用量', selectedHerb.usage)}
              {formatSection('⚠️ 使用注意', selectedHerb.contraindication)}
              {formatSection('🔍 辨藥特徵', selectedHerb.identification)}

              <div style={{ marginTop: 20, padding: '12px 14px', backgroundColor: '#F5F2EB', borderRadius: 12, fontSize: 12, color: '#7A7A6A', lineHeight: 1.6, border: '1px solid #E8E4DC' }}>
                ⚠️ 本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalContent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModalContent(null)}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '90vw', maxWidth: 380, backgroundColor: '#FFFEF9', borderRadius: 20, padding: '24px 20px 28px', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a2C24', marginBottom: 14, textAlign: 'center' }}>{modalContent.title}</h2>
            <div style={{ fontSize: 13, color: '#3A3A2A', lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'center' }}>{modalContent.body}</div>
            <button onClick={() => setModalContent(null)} style={{ display: 'block', width: '100%', marginTop: 20, padding: 12, backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>關閉</button>
          </div>
        </div>
      )}

      {showMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />}
    </div>
  )
}
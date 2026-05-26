'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

interface SearchResult {
  _type: '方劑' | '中藥' | '穴位'
  _score: number
  id?: number
  name: string
  code?: string
  categoryLabel?: string
  effects?: string
  indications?: string
  composition?: string
  properties?: string
  dosage?: string
  location?: string
  specialType?: string
  [key: string]: unknown
}

function SearchContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'zh-TW'
  const isCN = locale === 'zh-CN'
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState<{ formulas: SearchResult[]; herbs: SearchResult[]; acupoints: SearchResult[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | '方劑' | '中藥' | '穴位'>('all')
  const [showMenu, setShowMenu] = useState(false)

  const T = {
    backHome: isCN ? '首页' : '首頁',
    title: isCN ? '搜索结果' : '搜尋結果',
    noResults: isCN ? '没有找到相关结果' : '沒有找到相關結果',
    tryOther: isCN ? '试试其他关键词，或浏览各分类' : '試試其他關鍵字，或瀏覽各分類',
    searching: isCN ? '搜索中...' : '搜尋中...',
    enterKeyword: isCN ? '请输入搜索关键词' : '請輸入搜尋關鍵字',
    found: isCN ? '找到' : '找到',
    results: isCN ? '笔结果' : '筆結果',
    keyword: isCN ? '关键词' : '關鍵字',
    all: '全部',
    formula: '方劑',
    herb: '中藥',
    acupoint: '穴位',
    effects: isCN ? '功效' : '功效',
    composition: isCN ? '组成' : '組成',
    indications: isCN ? '主治' : '主治',
    browse: isCN ? '浏览分类' : '瀏覽分類',
  }

  const MENU_ITEMS = [
    { label: isCN ? '繁體 / 简体' : '繁體 / 簡體', icon: '🌐', action: 'lang' },
    { label: '📋 使用說明', icon: '📋', action: 'guide' },
    { label: '⚠️ 免責聲明', icon: '⚠️', action: 'disclaimer' },
    { label: 'ℹ️ 關於本站', icon: 'ℹ️', action: 'about' },
    { label: '📩 聯絡我們', icon: '📩', action: 'contact' },
  ]

  useEffect(() => {
    if (!q) { setLoading(false); return }
    setLoading(true)
    setError('')
    fetch(`/api/search-all?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setResults(d); setLoading(false) })
      .catch(() => { setError('搜尋失敗，請稍後再試'); setLoading(false) })
  }, [q])

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'lang') window.location.href = locale === 'zh-TW' ? '/zh-CN/search' : '/zh-TW/search'
  }

  const { formulas = [], herbs = [], acupoints = [] } = results || {}
  const total = formulas.length + herbs.length + acupoints.length

  const tabs: { key: typeof activeTab; label: string; count: number }[] = [
    { key: 'all', label: T.all, count: total },
    { key: '方劑', label: T.formula, count: formulas.length },
    { key: '中藥', label: T.herb, count: herbs.length },
    { key: '穴位', label: T.acupoint, count: acupoints.length },
  ]

  const TYPE_COLORS: Record<string, string> = { '方劑': '#8B4513', '中藥': '#2C6B3A', '穴位': '#1E5A8A' }
  const TYPE_BG: Record<string, string> = { '方劑': '#FDF3E7', '中藥': '#E8F5E9', '穴位': '#E3F2FD' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a3A2C', color: '#FFFEF9', padding: '0 0 16px', borderRadius: '0 0 20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: '50px' }}>
          <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
            <span style={{ fontSize: '15px' }}>🏠</span><span>{T.backHome}</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700 }}>{T.title}</div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', color: '#FFFEF9', backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              ☰ <span style={{ fontSize: '11px' }}>{isCN ? '菜单' : '選單'}</span>
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', backgroundColor: '#FFFEF9', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC' }}>
                {MENU_ITEMS.map((item, i) => (
                  <a key={i} href="#" onClick={e => { e.preventDefault(); handleMenuAction(item.action) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', color: '#1a2C24', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid #F0EDE5' : 'none' }}>
                    <span style={{ fontSize: '15px' }}>{item.icon}</span><span style={{ flex: 1 }}>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* 4-Tab Nav */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: '7px' }}>
          {[
            { href: `/${locale}/acu`, label: isCN ? '針灸大全' : '針灸大全', emoji: '💉' },
            { href: `/${locale}/db`, label: isCN ? '方剂大全' : '方劑大全', emoji: '🍵' },
            { href: `/${locale}/herbs`, label: isCN ? '中药大全' : '中藥大全', emoji: '🌿' },
            { href: `/${locale}/symptoms`, label: isCN ? '症狀大全' : '症狀大全', emoji: '🩺' },
          ].map(tab => (
            <Link key={tab.href} href={tab.href} style={{ flex: 1, padding: '10px 4px', backgroundColor: 'rgba(255,254,249,0.12)', color: 'rgba(255,254,249,0.8)', borderRadius: '12px', textDecoration: 'none', fontSize: '11px', fontWeight: 700, textAlign: 'center' }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.emoji}</div>
              <div>{tab.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 0 40px' }}>
        {!q && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8B6E5A' }}>
            <p style={{ fontSize: '16px' }}>{T.enterKeyword}</p>
          </div>
        )}

        {q && loading && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E8E4DC', borderTopColor: '#2C4A3E', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ marginTop: '16px', color: '#8B6E5A', fontSize: '14px' }}>{T.searching}</p>
          </div>
        )}

        {error && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#C0392B' }}><p>{error}</p></div>
        )}

        {q && !loading && !error && total === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8B6E5A' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>{T.noResults}</p>
            <p style={{ fontSize: '13px' }}>{T.tryOther}</p>
            <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['方劑大全', `/${locale}/db`], ['中藥大全', `/${locale}/herbs`], ['針灸大全', `/${locale}/acu`]].map(([label, href]) => (
                <Link key={href} href={href} style={{ padding: '8px 16px', background: '#2C4A3E', color: '#FFFEF9', borderRadius: '20px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
        )}

        {q && !loading && total > 0 && (
          <>
            {/* Result count + tabs */}
            <div style={{ padding: '14px 14px 0' }}>
              <span style={{ fontSize: '14px', color: '#8B6E5A' }}>
                {T.found} <strong style={{ color: '#2C4A3E' }}>{total}</strong> {T.results}，「<strong style={{ color: '#2C4A3E' }}>{q}</strong>」
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '12px 14px 0', borderBottom: '1px solid #E8E4DC' }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', border: '1.5px solid',
                    borderColor: activeTab === tab.key ? '#2C4A3E' : '#E0DCD4',
                    background: activeTab === tab.key ? '#2C4A3E' : '#FFFEF9',
                    color: activeTab === tab.key ? '#FFFEF9' : '#2C4A3E',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>

            {/* Formulas */}
            {(activeTab === 'all' || activeTab === '方劑') && formulas.length > 0 && (
              <div style={{ padding: '16px 14px 0' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#2C4A3E', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🍵 {T.formula} <span style={{ fontWeight: 400, color: '#8B6E5A', fontSize: '12px' }}>({formulas.length})</span>
                </h3>
                {formulas.map((f, i) => (
                  <Link key={i} href={`/${locale}/db/${encodeURIComponent(f.name)}`}
                    style={{ display: 'block', background: '#FFFEF9', border: '1.5px solid #E8E4DC', borderRadius: '14px', padding: '14px 16px', marginBottom: '8px', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24', marginBottom: '4px' }}>{f.name}</div>
                        <div style={{ fontSize: '12px', color: '#8B6E5A', marginBottom: '4px' }}>{f.categoryLabel}</div>
                        {f.effects && <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.6 }}>{T.effects}：{f.effects.slice(0, 80)}{f.effects.length > 80 ? '...' : ''}</div>}
                        {f.composition && <div style={{ fontSize: '12px', color: '#6B6B5A', marginTop: '4px' }}>{T.composition}：{f.composition.slice(0, 60)}{f.composition.length > 60 ? '...' : ''}</div>}
                      </div>
                      <span style={{ background: TYPE_BG['方劑'], color: TYPE_COLORS['方劑'], padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>🍵</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Herbs */}
            {(activeTab === 'all' || activeTab === '中藥') && herbs.length > 0 && (
              <div style={{ padding: '16px 14px 0' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#2C4A3E', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🌿 {T.herb} <span style={{ fontWeight: 400, color: '#8B6E5A', fontSize: '12px' }}>({herbs.length})</span>
                </h3>
                {herbs.map((h, i) => (
                  <Link key={i} href={`/${locale}/herbs?herb=${encodeURIComponent(h.name)}`}
                    style={{ display: 'block', background: '#FFFEF9', border: '1.5px solid #E8E4DC', borderRadius: '14px', padding: '14px 16px', marginBottom: '8px', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24', marginBottom: '4px' }}>{h.name}{h.alias ? `（{h.alias}）` : ''}</div>
                        <div style={{ fontSize: '12px', color: '#8B6E5A', marginBottom: '4px' }}>{h.categoryLabel}</div>
                        {h.effects && <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.6 }}>{T.effects}：{h.effects.slice(0, 80)}{h.effects.length > 80 ? '...' : ''}</div>}
                      </div>
                      <span style={{ background: TYPE_BG['中藥'], color: TYPE_COLORS['中藥'], padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>🌿</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Acupoints */}
            {(activeTab === 'all' || activeTab === '穴位') && acupoints.length > 0 && (
              <div style={{ padding: '16px 14px 0' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#2C4A3E', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💉 {T.acupoint} <span style={{ fontWeight: 400, color: '#8B6E5A', fontSize: '12px' }}>({acupoints.length})</span>
                </h3>
                {acupoints.map((a, i) => (
                  <Link key={i} href={`/${locale}/acu?code=${a.code}`}
                    style={{ display: 'block', background: '#FFFEF9', border: '1.5px solid #E8E4DC', borderRadius: '14px', padding: '14px 16px', marginBottom: '8px', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24', marginBottom: '4px' }}>{a.name} <span style={{ fontSize: '12px', color: '#8B6E5A', fontWeight: 400 }}>{a.code}</span></div>
                        {a.specialType && <span style={{ fontSize: '11px', background: '#FDF3E7', color: '#8B4513', padding: '2px 6px', borderRadius: '8px', fontWeight: 700, marginRight: '6px' }}>{a.specialType}</span>}
                        {a.indications && <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.6, marginTop: '4px' }}>{T.indications}：{a.indications.slice(0, 80)}{a.indications.length > 80 ? '...' : ''}</div>}
                      </div>
                      <span style={{ background: TYPE_BG['穴位'], color: TYPE_COLORS['穴位'], padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>💉</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center', color: '#8B6E5A' }}>載入中...</div>}>
      <SearchContent />
    </Suspense>
  )
}
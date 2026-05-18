'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Formula {
  id: number
  name: string
  source: string
  composition: string
  usage: string
  effects: string
  indications: string
  category: string
  categoryLabel: string
  formulaSong: string
}

const FORMULA_CATEGORIES = [
  { key: '', label: '全部', emoji: '✨' },
  { key: '解表劑', label: '感冒發汗', emoji: '🌬️' },
  { key: '清熱劑', label: '清熱降火', emoji: '🔥' },
  { key: '瀉下劑', label: '潤腸通便', emoji: '💩' },
  { key: '和解劑', label: '和解疏肝', emoji: '🔄' },
  { key: '溫裡劑', label: '溫裡驅寒', emoji: '🤝' },
  { key: '補益劑', label: '補氣養血', emoji: '💪' },
  { key: '理氣劑', label: '行氣理氣', emoji: '😤' },
  { key: '理血劑', label: '活血化瘀', emoji: '❤️' },
  { key: '祛痰劑', label: '止咳化痰', emoji: '😷' },
  { key: '安神劑', label: '鎮心安神', emoji: '😴' },
  { key: '祛濕劑', label: '祛風除濕', emoji: '💧' },
  { key: '治風劑', label: '治風息風', emoji: '🌪️' },
  { key: '消導劑', label: '和胃消食', emoji: '🍽️' },
  { key: '固澀劑', label: '固澀止遺', emoji: '🔒' },
  { key: '治燥劑', label: '潤燥生津', emoji: '🏜️' },
  { key: '驅蟲劑', label: '驅蟲殺蟲', emoji: '🐛' },
  { key: '涌吐劑', label: '涌吐痰食', emoji: '🤮' },
  { key: '治瘡劑', label: '治瘡消癰', emoji: '🩹' },
]

const MENU_ITEMS = [
  { label: '📋 使用說明', href: '#' },
  { label: '🔗 醫砭 yibian.hopto.org', href: 'https://yibian.hopto.org/db/', external: true },
  { label: '⚠️ 免責聲明', href: '#', action: 'disclaimer' },
  { label: 'ℹ️ 關於本站', href: '#', action: 'about' },
  { label: '📩 聯絡我們', href: '#', action: 'contact' },
]

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState<'acupoints' | 'formulas' | 'herbs'>('formulas')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [loading, setLoading] = useState(true)
  const [showCatSidebar, setShowCatSidebar] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)

  useEffect(() => {
    fetch('/data/formulas.json').then(r => r.json()).then(d => {
      setFormulas(d)
      setLoading(false)
    })
  }, [])

  const filteredFormulas = formulas.filter(f => {
    if (selectedCat && f.category !== selectedCat) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return f.name.toLowerCase().includes(q) ||
        f.source.toLowerCase().includes(q) ||
        f.effects.toLowerCase().includes(q) ||
        f.categoryLabel.includes(q)
    }
    return true
  })

  const activeCat = FORMULA_CATEGORIES.find(c => c.key === selectedCat) || FORMULA_CATEGORIES[0]

  const handleMenuAction = (item: typeof MENU_ITEMS[0]) => {
    setShowMenu(false)
    if (item.action === 'disclaimer') {
      setModalContent({
        title: '⚠️ 免責聲明',
        body: '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。\n\n本站所收录的中医药知识来源于公开文献整理，编者在编辑过程中已尽可能核实内容准确性，但不保证所有信息完全正确、及时或完整。读者依此行事需自行承担风险。',
      })
    } else if (item.action === 'about') {
      setModalContent({
        title: 'ℹ️ 關於本站',
        body: '📖 中醫大全是一個開源的中醫藥知識庫，收錄了針灸穴位、經典方劑等中醫藥資料。\n\n🎯 目標：讓中醫藥知識更容易被查詢和學習。\n\n📊 目前收錄：\n• 374 個針灸穴位（WHO 國際標準）\n• 205 首經典方劑\n• 更多內容持續更新中\n\n❤️ 製作給所有中醫藥愛好者。',
      })
    } else if (item.action === 'contact') {
      setModalContent({
        title: '📩 聯絡我們',
        body: '如有問題或建議，歡迎透過以下方式聯絡：\n\n📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base\n\n我們會盡快回覆您。',
      })
    }
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
      }}>
        {/* Nav Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: '50px' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none',
            fontSize: '13px', fontWeight: 600, opacity: 0.9,
          }}>
            <span style={{ fontSize: '15px' }}>🏠</span>
            <span>首頁</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700, letterSpacing: '0.03em' }}>
            📖 中醫大全
          </div>

          {/* Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '7px 12px', color: '#FFFEF9', textDecoration: 'none',
                fontSize: '13px', fontWeight: 600,
                backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)',
                border: 'none', borderRadius: '20px', cursor: 'pointer',
              }}
            >
              ☰ <span style={{ fontSize: '11px' }}>選單</span>
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: '220px',
                backgroundColor: '#FFFEF9',
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                zIndex: 300,
                border: '1px solid #E8E4DC',
              }}>
                {MENU_ITEMS.map((item, i) => (
                  <a
                    key={i}
                    href={item.external ? item.href : item.action ? '#' : item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={e => {
                      if (item.action) { e.preventDefault(); handleMenuAction(item) }
                      else setShowMenu(false)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '13px 16px',
                      color: '#1a2C24', textDecoration: 'none',
                      fontSize: '13px', fontWeight: 600,
                      borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid #F0EDE5' : 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F2EB')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ fontSize: '15px' }}>{item.label.split(' ')[0]}</span>
                    <span style={{ flex: 1 }}>{item.label.split(' ').slice(1).join(' ')}</span>
                    {item.external && <span style={{ fontSize: '11px', color: '#8A8A7A' }}>↗</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,254,249,0.15)',
            borderRadius: '14px', padding: '12px 14px',
            border: '1.5px solid rgba(255,254,249,0.25)',
          }}>
            <span style={{ fontSize: '16px', opacity: 0.8 }}>🔍</span>
            <input
              type="text"
              placeholder={loading ? '載入中...' : '搜尋方劑名稱、功效、分類...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              disabled={loading}
              style={{
                flex: 1, border: 'none', backgroundColor: 'transparent',
                outline: 'none', fontSize: '14px', color: '#FFFEF9'
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: '50%',
                width: '20px', height: '20px', cursor: 'pointer',
                fontSize: '10px', color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            )}
          </div>
        </div>

        {/* 3-Tab */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: '7px' }}>
          {[
            { key: 'acupoints', label: '針灸大全', emoji: '💉', count: '374' },
            { key: 'formulas', label: '方劑大全', emoji: '🍵', count: '205' },
            { key: 'herbs', label: '中藥大全', emoji: '🌿', count: '?', upcoming: true },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as 'acupoints' | 'formulas' | 'herbs'); setSelectedFormula(null) }}
              disabled={tab.upcoming}
              style={{
                flex: 1, padding: '10px 4px',
                backgroundColor: activeTab === tab.key ? '#FFFEF9' : 'rgba(255,254,249,0.12)',
                color: activeTab === tab.key ? '#1a3A2C' : 'rgba(255,254,249,0.8)',
                border: 'none', borderRadius: '12px', cursor: tab.upcoming ? 'default' : 'pointer',
                fontSize: '11px', fontWeight: 700, opacity: tab.upcoming ? 0.5 : 1,
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.emoji}</div>
              <div>{tab.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>{tab.count}筆</div>
            </button>
          ))}
        </div>

        {/* Category Pills */}
        {activeTab === 'formulas' && (
          <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowCatSidebar(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 13px', borderRadius: '20px',
                backgroundColor: 'rgba(255,254,249,0.15)',
                color: '#FFFEF9', border: '1.5px solid rgba(255,254,249,0.25)',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '15px' }}>{activeCat.emoji}</span>
              <span>{activeCat.label}</span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>▾</span>
            </button>
            <div style={{ fontSize: '11px', color: 'rgba(255,254,249,0.65)', whiteSpace: 'nowrap' }}>
              {loading ? '...' : `${filteredFormulas.length} 個方劑`}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'formulas' && (
        <div style={{ padding: '12px 14px 100px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A', fontSize: '14px' }}>載入中...</div>
          ) : filteredFormulas.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>找不到符合的方劑</div>
              <div style={{ fontSize: '12px' }}>試試其他關鍵字或分類</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredFormulas.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormula(f)}
                  style={{
                    backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC',
                    borderRadius: '16px', padding: '14px 16px',
                    cursor: 'pointer', textAlign: 'left',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', width: '100%',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2C4A3E'
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E4DC'
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a2C24', lineHeight: 1.3 }}>{f.name}</div>
                    <div style={{
                      flexShrink: 0, padding: '3px 10px', borderRadius: '20px',
                      backgroundColor: '#EEEBE3', fontSize: '11px', color: '#2C4A3E', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '2px',
                    }}>{f.categoryLabel}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8A8A7A', marginBottom: '4px' }}>📚 出自《{f.source}》</div>
                  <div style={{ fontSize: '13px', color: '#5A5A4A', lineHeight: 1.5 }}>
                    {f.effects?.slice(0, 60)}{f.effects && f.effects.length > 60 ? '...' : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'herbs' && (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: '#7A7A6A' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🌿</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#1a2C24', marginBottom: '8px' }}>中藥大全即將上線</div>
          <div style={{ fontSize: '13px', lineHeight: 1.7 }}>三百餘味中藥正在整理中<br />敬請期待</div>
        </div>
      )}

      {activeTab === 'acupoints' && (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: '#7A7A6A' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>💉</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#1a2C24', marginBottom: '8px' }}>針灸大全</div>
          <div style={{ fontSize: '13px', lineHeight: 1.7 }}>374 個針灸穴位 · WHO 國際標準<br />即將上線</div>
        </div>
      )}

      {/* Category Sidebar */}
      {showCatSidebar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowCatSidebar(false)}>
          <div
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: '75vw', maxWidth: '320px',
              backgroundColor: '#FFFEF9', borderRadius: '0 20px 20px 0',
              padding: '24px 16px', overflowY: 'auto',
              boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2C24', margin: 0 }}>選擇功效分類</h2>
              <button onClick={() => setShowCatSidebar(false)} style={{
                background: '#E8E4DC', border: 'none', borderRadius: '50%',
                width: '28px', height: '28px', cursor: 'pointer',
                fontSize: '12px', color: '#7A7A6A', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {FORMULA_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setSelectedCat(cat.key); setShowCatSidebar(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 14px', borderRadius: '12px', border: 'none',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    backgroundColor: selectedCat === cat.key ? '#1a3A2C' : '#F0EDE5',
                    color: selectedCat === cat.key ? '#FFFEF9' : '#1a2C24',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
                  <span style={{ flex: 1 }}>{cat.label}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>
                    {cat.key === '' ? formulas.length : formulas.filter(f => f.category === cat.key).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Bottom Sheet */}
      {selectedFormula && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSelectedFormula(null)}>
          <div
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              maxHeight: '88vh', backgroundColor: '#FFFEF9',
              borderRadius: '24px 24px 0 0', padding: '20px 20px 40px',
              overflowY: 'auto', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#D4D0C8' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a2C24', marginBottom: '8px', lineHeight: 1.3 }}>
                {selectedFormula.name}
              </h2>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 12px', borderRadius: '20px',
                  backgroundColor: '#E8E4DC', fontSize: '12px', color: '#2C4A3E', fontWeight: 700,
                }}>📚 《{selectedFormula.source}》</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 12px', borderRadius: '20px',
                  backgroundColor: '#1a3A2C', fontSize: '12px', color: '#FFFEF9', fontWeight: 700,
                }}>{selectedFormula.categoryLabel}</span>
              </div>
            </div>
            {[
              { label: '💡 功效', value: selectedFormula.effects },
              { label: '📋 主治', value: selectedFormula.indications },
              { label: '🌿 組成', value: selectedFormula.composition },
              { label: '📖 用法', value: selectedFormula.usage },
              { label: '🎵 方歌', value: selectedFormula.formulaSong },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2C4A3E', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: '14px', color: '#2C3428', lineHeight: 1.75 }}>{value}</div>
              </div>
            ) : null)}
            <div style={{
              marginTop: '20px', padding: '12px 14px',
              backgroundColor: '#F5F2EB', borderRadius: '12px',
              fontSize: '12px', color: '#7A7A6A', lineHeight: 1.6,
              border: '1px solid #E8E4DC',
            }}>
              ⚠️ 本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。
            </div>
          </div>
        </div>
      )}

      {/* Modal (disclaimer/about/contact) */}
      {modalContent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModalContent(null)}>
          <div
            style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw', maxWidth: '380px',
              backgroundColor: '#FFFEF9', borderRadius: '20px',
              padding: '24px 20px 28px', overflowY: 'auto',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a2C24', marginBottom: '14px', textAlign: 'center' }}>
              {modalContent.title}
            </h2>
            <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'center' }}>
              {modalContent.body}
            </div>
            <button
              onClick={() => setModalContent(null)}
              style={{
                display: 'block', width: '100%', marginTop: '20px',
                padding: '12px', backgroundColor: '#1a3A2C', color: '#FFFEF9',
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 700,
              }}
            >關閉</button>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}

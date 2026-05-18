'use client'

import React, { useState, useMemo, useEffect } from 'react'

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

export default function DatabasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [loading, setLoading] = useState(true)
  const [showCatSidebar, setShowCatSidebar] = useState(false)

  useEffect(() => {
    fetch('/data/formulas.json').then(r => r.json()).then(d => {
      setFormulas(d)
      setLoading(false)
    })
  }, [])

  const filteredFormulas = useMemo(() => {
    let result = formulas
    if (selectedCat) result = result.filter(f => f.category === selectedCat)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.source.toLowerCase().includes(q) ||
        f.effects.toLowerCase().includes(q) ||
        f.categoryLabel.includes(q)
      )
    }
    return result
  }, [formulas, selectedCat, searchQuery])

  const activeCat = FORMULA_CATEGORIES.find(c => c.key === selectedCat) || FORMULA_CATEGORIES[0]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3A2C 0%, #2C4A3E 60%, #3D6B54 100%)',
        color: '#FFFEF9', padding: '28px 20px 24px',
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '2px', letterSpacing: '0.05em' }}>
          📖 中醫資料庫
        </h1>
        <p style={{ fontSize: '12px', opacity: 0.75, margin: 0 }}>205 首經典方劑 · 374 針灸穴位</p>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          backgroundColor: '#FFFEF9', borderRadius: '16px',
          padding: '14px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1.5px solid #E8E4DC',
        }}>
          <span style={{ fontSize: '18px' }}>🔍</span>
          <input
            type="text"
            placeholder={loading ? '載入中...' : '搜尋方劑名稱、功效、分類...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            disabled={loading}
            style={{
              flex: 1, border: 'none', backgroundColor: 'transparent',
              outline: 'none', fontSize: '14px', color: '#1a2C24'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              background: '#E8E4DC', border: 'none', borderRadius: '50%',
              width: '22px', height: '22px', cursor: 'pointer',
              fontSize: '11px', color: '#7A7A6A', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
          )}
        </div>
      </div>

      {/* Category Pills + Active Filter */}
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mobile Category Button */}
        <button
          onClick={() => setShowCatSidebar(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '20px',
            backgroundColor: '#1a3A2C', color: '#FFFEF9',
            border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '16px' }}>{activeCat.emoji}</span>
          <span>{activeCat.label}</span>
          <span style={{ fontSize: '10px', opacity: 0.8 }}>▾</span>
        </button>

        {/* Stats */}
        <div style={{ fontSize: '12px', color: '#7A7A6A', whiteSpace: 'nowrap' }}>
          {loading ? '...' : `${filteredFormulas.length} 個方劑`}
        </div>
      </div>

      {/* Formula List */}
      <div style={{ padding: '12px 14px 100px' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A', fontSize: '14px' }}>
            載入中...
          </div>
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
                  backgroundColor: '#FFFEF9',
                  border: '1.5px solid #E8E4DC',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#2C4A3E'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E4DC'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a2C24', lineHeight: 1.3 }}>
                    {f.name}
                  </div>
                  <div style={{
                    flexShrink: 0,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: '#EEEBE3',
                    fontSize: '11px',
                    color: '#2C4A3E',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    marginTop: '2px',
                  }}>
                    {f.categoryLabel}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#8A8A7A', marginBottom: '4px' }}>
                  📚 出自《{f.source}》
                </div>
                <div style={{ fontSize: '13px', color: '#5A5A4A', lineHeight: 1.5 }}>
                  {f.effects?.slice(0, 60)}{f.effects && f.effects.length > 60 ? '...' : ''}
                </div>
                {f.indications && (
                  <div style={{ fontSize: '12px', color: '#9A9A8A', marginTop: '4px', lineHeight: 1.4 }}>
                    主治：{f.indications?.slice(0, 50)}{f.indications.length > 50 ? '...' : ''}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Sidebar (mobile drawer) */}
      {showCatSidebar && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setShowCatSidebar(false)}
        >
          <div
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: '75vw', maxWidth: '320px',
              backgroundColor: '#FFFEF9',
              borderRadius: '0 20px 20px 0',
              padding: '24px 16px',
              overflowY: 'auto',
              boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2C24', margin: 0 }}>選擇分類</h2>
              <button
                onClick={() => setShowCatSidebar(false)}
                style={{
                  background: '#E8E4DC', border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px', cursor: 'pointer',
                  fontSize: '12px', color: '#7A7A6A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
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
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setSelectedFormula(null)}
        >
          <div
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              maxHeight: '88vh',
              backgroundColor: '#FFFEF9',
              borderRadius: '24px 24px 0 0',
              padding: '20px 20px 40px',
              overflowY: 'auto',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#D4D0C8' }} />
            </div>

            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a2C24', marginBottom: '8px', lineHeight: 1.3 }}>
                {selectedFormula.name}
              </h2>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 12px', borderRadius: '20px',
                  backgroundColor: '#E8E4DC', fontSize: '12px', color: '#2C4A3E', fontWeight: 700,
                }}>
                  📚 《{selectedFormula.source}》
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 12px', borderRadius: '20px',
                  backgroundColor: '#1a3A2C', fontSize: '12px', color: '#FFFEF9', fontWeight: 700,
                }}>
                  {selectedFormula.categoryLabel}
                </span>
              </div>
            </div>

            {/* Sections */}
            {[
              { label: '💡 功效', value: selectedFormula.effects },
              { label: '📋 主治', value: selectedFormula.indications },
              { label: '🌿 組成', value: selectedFormula.composition },
              { label: '📖 用法', value: selectedFormula.usage },
              { label: '🎵 方歌', value: selectedFormula.formulaSong },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2C4A3E', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </div>
                <div style={{ fontSize: '14px', color: '#2C3428', lineHeight: 1.75 }}>
                  {value}
                </div>
              </div>
            ) : null)}

            {/* Disclaimer */}
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
    </div>
  )
}
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
  effects: string
  method: string
  contraindications: string
}

interface Formula {
  id: number
  name: string
  source: string
  composition: string
  usage: string
  effects: string
  indications: string
  formulaSong: string
}

const MERIDIANS = [
  { code: 'LU', name: '肺經' }, { code: 'LI', name: '大腸經' },
  { code: 'ST', name: '胃經' }, { code: 'SP', name: '脾經' },
  { code: 'HT', name: '心經' }, { code: 'SI', name: '小腸經' },
  { code: 'BL', name: '膀胱經' }, { code: 'KI', name: '腎經' },
  { code: 'PC', name: '心包經' }, { code: 'SJ', name: '三焦經' },
  { code: 'GB', name: '膽經' }, { code: 'LV', name: '肝經' },
]

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState<'acupoints' | 'formulas' | 'herbs'>('acupoints')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeridian, setSelectedMeridian] = useState<string>('')
  const [selectedAcupoint, setSelectedAcupoint] = useState<Acupoint | null>(null)
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
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

  const filteredAcupoints = useMemo(() => {
    let result = acupoints
    if (selectedMeridian) result = result.filter(a => a.meridian === selectedMeridian)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.meridianName.includes(q) ||
        (a.indications && a.indications.toLowerCase().includes(q))
      )
    }
    return result
  }, [acupoints, selectedMeridian, searchQuery])

  const filteredFormulas = useMemo(() => {
    if (!searchQuery.trim()) return formulas
    const q = searchQuery.toLowerCase()
    return formulas.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.source && f.source.toLowerCase().includes(q)) ||
      (f.effects && f.effects.toLowerCase().includes(q))
    )
  }, [formulas, searchQuery])

  const accentColor = '#2C4A3E'
  const bgColor = '#FAFAF7'
  const cardBg = '#FFFFFF'
  const borderColor = '#E5E2DA'
  const textColor = '#1C2C24'
  const mutedColor = '#7A7A6A'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor }}>
      {/* Header */}
      <div style={{ backgroundColor: accentColor, color: '#FAFAF7', padding: '28px 24px 20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>中醫資料庫</h1>
        <p style={{ fontSize: '14px', opacity: 0.85 }}>針灸 · 方劑 · 中藥</p>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 20px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}` }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#F5F3EE',
          borderRadius: '12px',
          padding: '12px 16px',
          border: `1px solid ${borderColor}`
        }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder={loading ? '載入中...' : '搜尋穴位、方劑...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            disabled={loading}
            style={{
              flex: 1, border: 'none', backgroundColor: 'transparent',
              outline: 'none', fontSize: '14px', color: textColor
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: mutedColor
            }}>✕</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}` }}>
        {[
          { key: 'acupoints' as const, label: '針灸庫', emoji: '💉', count: '390' },
          { key: 'formulas' as const, label: '方劑庫', emoji: '🍵', count: '205' },
          { key: 'herbs' as const, label: '中藥庫', emoji: '🌿', count: '?' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedAcupoint(null); setSelectedFormula(null); }}
            style={{
              flex: 1, padding: '12px 4px',
              backgroundColor: activeTab === tab.key ? accentColor : cardBg,
              color: activeTab === tab.key ? '#FAFAF7' : textColor,
              border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.emoji}</div>
            <div>{tab.label}</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>{tab.count}筆</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: mutedColor }}>載入中...</div>
      ) : activeTab === 'acupoints' ? (
        <div style={{ display: 'flex' }}>
          {/* Meridian Filter */}
          <div style={{
            padding: '10px 12px',
            backgroundColor: '#F5F3EE',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            flexWrap: 'nowrap',
            borderBottom: `1px solid ${borderColor}`,
            width: '100%'
          }}>
            <button
              onClick={() => setSelectedMeridian('')}
              style={{
                padding: '5px 12px', borderRadius: '16px', border: 'none',
                fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
                backgroundColor: !selectedMeridian ? accentColor : '#E5E2DA',
                color: !selectedMeridian ? '#FAFAF7' : textColor, fontWeight: 600,
              }}
            >全部</button>
            {MERIDIANS.map(m => (
              <button
                key={m.code}
                onClick={() => setSelectedMeridian(m.code === selectedMeridian ? '' : m.code)}
                style={{
                  padding: '5px 10px', borderRadius: '16px', border: 'none',
                  fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
                  backgroundColor: selectedMeridian === m.code ? accentColor : '#E5E2DA',
                  color: selectedMeridian === m.code ? '#FAFAF7' : textColor, fontWeight: 600,
                }}
              >{m.code}</button>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex' }}>
        {/* List */}
        <div style={{
          flex: selectedAcupoint || selectedFormula ? '0 0 45%' : '1',
          overflowY: 'auto',
          borderRight: (selectedAcupoint || selectedFormula) ? `1px solid ${borderColor}` : 'none',
        }}>
          {activeTab === 'acupoints' ? (
            <div>
              <div style={{ padding: '10px 16px', fontSize: '11px', color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>
                {filteredAcupoints.length} 個穴位
              </div>
              {filteredAcupoints.slice(0, 100).map(a => (
                <button
                  key={a.code}
                  onClick={() => { setSelectedAcupoint(a); setSelectedFormula(null); }}
                  style={{
                    width: '100%', padding: '12px 16px',
                    backgroundColor: selectedAcupoint?.code === a.code ? '#F0EDE6' : cardBg,
                    border: 'none', borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '2px' }}>
                    {a.name} <span style={{ fontSize: '11px', color: mutedColor }}>{a.code}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: mutedColor }}>
                    {a.meridianName} · {a.indications?.slice(0, 40) || ''}...
                  </div>
                </button>
              ))}
              {filteredAcupoints.length > 100 && (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: mutedColor }}>
                  搜尋取得更多結果
                </div>
              )}
            </div>
          ) : activeTab === 'formulas' ? (
            <div>
              <div style={{ padding: '10px 16px', fontSize: '11px', color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>
                {filteredFormulas.length} 個方劑
              </div>
              {filteredFormulas.slice(0, 100).map(f => (
                <button
                  key={f.id}
                  onClick={() => { setSelectedFormula(f); setSelectedAcupoint(null); }}
                  style={{
                    width: '100%', padding: '12px 16px',
                    backgroundColor: selectedFormula?.id === f.id ? '#F0EDE6' : cardBg,
                    border: 'none', borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, marginBottom: '2px' }}>{f.name}</div>
                  <div style={{ fontSize: '12px', color: mutedColor }}>
                    出自{f.source} · {f.effects?.slice(0, 35)}...
                  </div>
                </button>
              ))}
              {filteredFormulas.length > 100 && (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: mutedColor }}>
                  搜尋取得更多結果
                </div>
              )}
            </div>
          ) : activeTab === 'herbs' ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: mutedColor }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌿</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: textColor, marginBottom: '6px' }}>中藥庫即將上線</div>
              <div style={{ fontSize: '13px' }}>正在整理中藥學教材數據，敬請期待</div>
            </div>
          ) : null}
        </div>

        {/* Detail */}
        {selectedAcupoint && (
          <div style={{ flex: '0 0 55%', overflowY: 'auto', padding: '20px', backgroundColor: cardBg }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: textColor, marginBottom: '6px' }}>{selectedAcupoint.name}</h2>
              <span style={{
                display: 'inline-block', padding: '4px 12px',
                backgroundColor: '#F0EDE6', borderRadius: '20px',
                fontSize: '12px', color: accentColor, fontWeight: 600,
              }}>{selectedAcupoint.code} · {selectedAcupoint.meridianName}</span>
            </div>
            {[
              { label: '定位', value: selectedAcupoint.location },
              { label: '主治', value: selectedAcupoint.indications },
              { label: '功效', value: selectedAcupoint.effects },
              { label: '針法', value: selectedAcupoint.method },
              { label: '禁忌', value: selectedAcupoint.contraindications },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: accentColor, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '14px', color: textColor, lineHeight: 1.6 }}>{value}</div>
              </div>
            ) : null)}
            <button
              onClick={() => setSelectedAcupoint(null)}
              style={{
                marginTop: '16px', padding: '8px 16px',
                backgroundColor: accentColor, color: '#FAFAF7',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
              }}
            >關閉</button>
          </div>
        )}

        {selectedFormula && (
          <div style={{ flex: '0 0 55%', overflowY: 'auto', padding: '20px', backgroundColor: cardBg }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: textColor, marginBottom: '6px' }}>{selectedFormula.name}</h2>
              <span style={{
                display: 'inline-block', padding: '4px 12px',
                backgroundColor: '#F0EDE6', borderRadius: '20px',
                fontSize: '12px', color: accentColor, fontWeight: 600,
              }}>出自《{selectedFormula.source}》</span>
            </div>
            {[
              { label: '組成', value: selectedFormula.composition },
              { label: '用法', value: selectedFormula.usage },
              { label: '功用', value: selectedFormula.effects },
              { label: '主治', value: selectedFormula.indications },
              { label: '方歌', value: selectedFormula.formulaSong },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: accentColor, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '14px', color: textColor, lineHeight: 1.6 }}>{value}</div>
              </div>
            ) : null)}
            <button
              onClick={() => setSelectedFormula(null)}
              style={{
                marginTop: '16px', padding: '8px 16px',
                backgroundColor: accentColor, color: '#FAFAF7',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
              }}
            >關閉</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${borderColor}`, textAlign: 'center', fontSize: '11px', color: mutedColor }}>
        本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。
      </div>
    </div>
  )
}
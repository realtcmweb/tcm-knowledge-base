'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'

// Types
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
}

interface Formula {
  id: number
  name: string
  source: string
  composition: string
  usage: string
  effects: string
  indications: string
}

// Static data imported at build time
import acupointsData from '../../../data/acupoints.json'
import formulasData from '../../../data/formulas.json'

type TabType = 'acupoints' | 'formulas' | 'herbs'

const MERIDIANS = [
  { code: 'LU', name: '手太陰肺經', points: 11 },
  { code: 'LI', name: '手陽明大腸經', points: 20 },
  { code: 'ST', name: '足陽明胃經', points: 45 },
  { code: 'SP', name: '足太陰脾經', points: 21 },
  { code: 'HT', name: '手少陰心經', points: 9 },
  { code: 'SI', name: '手太陽小腸經', points: 19 },
  { code: 'BL', name: '足太陽膀胱經', points: 67 },
  { code: 'KI', name: '足少陰腎經', points: 27 },
  { code: 'PC', name: '手厥陰心包經', points: 9 },
  { code: 'SJ', name: '手少陽三焦經', points: 23 },
  { code: 'GB', name: '足少陽膽經', points: 44 },
  { code: 'LV', name: '足厥陰肝經', points: 14 },
]

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState<TabType>('acupoints')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeridian, setSelectedMeridian] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<Acupoint | Formula | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const acupoints = acupointsData as Acupoint[]
  const formulas = formulasData as Formula[]

  const filteredAcupoints = useMemo(() => {
    let result = acupoints
    if (selectedMeridian) {
      result = result.filter(a => a.meridian === selectedMeridian)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.meridianName.includes(q) ||
        a.indications.toLowerCase().includes(q)
      )
    }
    return result
  }, [acupoints, selectedMeridian, searchQuery])

  const filteredFormulas = useMemo(() => {
    if (!searchQuery.trim()) return formulas
    const q = searchQuery.toLowerCase()
    return formulas.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.source.toLowerCase().includes(q) ||
      f.effects.toLowerCase().includes(q) ||
      f.indications?.toLowerCase().includes(q)
    )
  }, [formulas, searchQuery])

  const handleTabChange = (tab: TabType) => {
    setIsLoading(true)
    setActiveTab(tab)
    setSearchQuery('')
    setSelectedMeridian('')
    setSelectedItem(null)
    setTimeout(() => setIsLoading(false), 100)
  }

  const accentColor = '#2C4A3E'
  const bgColor = '#FAFAF7'
  const cardBg = '#FFFFFF'
  const borderColor = '#E5E2DA'
  const textColor = '#1C2C24'
  const mutedColor = '#7A7A6A'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor }}>
      {/* Header */}
      <div style={{
        backgroundColor: accentColor,
        color: '#FAFAF7',
        padding: '32px 24px 24px',
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          中醫資料庫
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.85 }}>
          針灸 · 方劑 · 中藥
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '20px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}` }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#F5F3EE',
            borderRadius: '12px',
            padding: '12px 16px',
            border: `1px solid ${borderColor}`
          }}>
            <span style={{ fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              placeholder="搜尋穴位、方劑..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '15px',
                color: textColor
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: mutedColor
              }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: cardBg,
        borderBottom: `1px solid ${borderColor}`,
        overflowX: 'auto'
      }}>
        {[
          { key: 'acupoints' as TabType, label: '針灸庫', emoji: '💉', count: 390 },
          { key: 'formulas' as TabType, label: '方劑庫', emoji: '🍵', count: 205 },
          { key: 'herbs' as TabType, label: '中藥庫', emoji: '🌿', count: '?' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              flex: 1,
              padding: '14px 8px',
              backgroundColor: activeTab === tab.key ? accentColor : cardBg,
              color: activeTab === tab.key ? '#FAFAF7' : textColor,
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{tab.emoji}</div>
            <div>{tab.label}</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>{tab.count} 筆</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 200px)' }}>
        {/* Left Panel: List */}
        <div style={{
          flex: activeTab === 'herbs' ? 1 : '0 0 100%',
          overflowY: 'auto',
          borderRight: activeTab !== 'herbs' ? `1px solid ${borderColor}` : 'none',
          display: activeTab === 'herbs' ? 'none' : 'block'
        }}>
          {/* Acupoints Filter Bar */}
          {activeTab === 'acupoints' && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#F5F3EE',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              flexWrap: 'nowrap'
            }}>
              <button
                onClick={() => setSelectedMeridian('')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: !selectedMeridian ? accentColor : '#E5E2DA',
                  color: !selectedMeridian ? '#FAFAF7' : textColor,
                  fontWeight: 600,
                }}
              >全部經絡</button>
              {MERIDIANS.map(m => (
                <button
                  key={m.code}
                  onClick={() => setSelectedMeridian(m.code)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    backgroundColor: selectedMeridian === m.code ? accentColor : '#E5E2DA',
                    color: selectedMeridian === m.code ? '#FAFAF7' : textColor,
                    fontWeight: 600,
                  }}
                >
                  {m.code} {m.name.replace('手太陰', '').replace('足太陰', '').replace('手陽明', '').replace('足陽明', '').replace('手少陰', '').replace('手太陽', '').replace('足太陽', '').replace('足少陰', '').replace('手厥陰', '').replace('手少陽', '').replace('足少陽', '').replace('足厥陰', '')}
                </button>
              ))}
            </div>
          )}

          {/* List Items */}
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: mutedColor }}>
              載入中...
            </div>
          ) : activeTab === 'acupoints' ? (
            <div>
              <div style={{ padding: '12px 16px', fontSize: '12px', color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>
                共 {filteredAcupoints.length} 個穴位
              </div>
              {filteredAcupoints.slice(0, 100).map((a) => (
                <button
                  key={a.code}
                  onClick={() => setSelectedItem(a)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: selectedItem && 'code' in selectedItem && selectedItem.code === a.code ? '#F0EDE6' : cardBg,
                    border: 'none',
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { if (!(selectedItem && 'code' in selectedItem && selectedItem.code === a.code)) e.currentTarget.style.backgroundColor = '#F5F3EE' }}
                  onMouseLeave={e => { if (!(selectedItem && 'code' in selectedItem && selectedItem.code === a.code)) e.currentTarget.style.backgroundColor = cardBg }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 600, color: textColor, marginBottom: '4px' }}>
                    {a.name} <span style={{ fontSize: '12px', color: mutedColor }}>{a.code}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: mutedColor }}>
                    {a.meridianName} · {a.indications?.slice(0, 50) || '位置待補'}...
                  </div>
                </button>
              ))}
              {filteredAcupoints.length > 100 && (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: mutedColor }}>
                  只顯示前 100 筆，請使用搜尋...
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ padding: '12px 16px', fontSize: '12px', color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>
                共 {filteredFormulas.length} 個方劑
              </div>
              {filteredFormulas.slice(0, 100).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedItem(f)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: selectedItem && 'source' in selectedItem && selectedItem.id === f.id ? '#F0EDE6' : cardBg,
                    border: 'none',
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { if (!(selectedItem && 'source' in selectedItem && selectedItem.id === f.id)) e.currentTarget.style.backgroundColor = '#F5F3EE' }}
                  onMouseLeave={e => { if (!(selectedItem && 'source' in selectedItem && selectedItem.id === f.id)) e.currentTarget.style.backgroundColor = cardBg }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 600, color: textColor, marginBottom: '4px' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: '12px', color: mutedColor }}>
                    出自{f.source} · {f.effects?.slice(0, 40)}...
                  </div>
                </button>
              ))}
              {filteredFormulas.length > 100 && (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: mutedColor }}>
                  只顯示前 100 筆，請使用搜尋...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Detail */}
        {selectedItem && (
          <div style={{
            flex: '0 0 55%',
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: cardBg,
          }}>
            {'code' in selectedItem ? (
              // Acupoint Detail
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: textColor, marginBottom: '4px' }}>
                    {selectedItem.name}
                  </h2>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#F0EDE6',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: accentColor,
                    fontWeight: 600,
                  }}>
                    {selectedItem.code} · {selectedItem.meridianName}
                  </span>
                </div>

                {[
                  { label: '定位', value: selectedItem.location },
                  { label: '主治', value: selectedItem.indications },
                  { label: '功效', value: selectedItem.effects },
                  { label: '針法', value: selectedItem.method },
                  { label: '禁忌', value: selectedItem.contraindications },
                ].map(({ label, value }) => value ? (
                  <div key={label} style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: accentColor, marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '15px', color: textColor, lineHeight: 1.7 }}>
                      {value}
                    </div>
                  </div>
                ) : null)}
              </div>
            ) : (
              // Formula Detail
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: textColor, marginBottom: '4px' }}>
                    {selectedItem.name}
                  </h2>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#F0EDE6',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: accentColor,
                    fontWeight: 600,
                  }}>
                    出自《{selectedItem.source}》
                  </span>
                </div>

                {[
                  { label: '組成', value: selectedItem.composition },
                  { label: '用法', value: selectedItem.usage },
                  { label: '功用', value: selectedItem.effects },
                  { label: '主治', value: selectedItem.indications },
                  { label: '方歌', value: selectedItem.formulaSong },
                ].map(({ label, value }) => value ? (
                  <div key={label} style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: accentColor, marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '15px', color: textColor, lineHeight: 1.7 }}>
                      {value}
                    </div>
                  </div>
                ) : null)}
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              style={{
                marginTop: '24px',
                padding: '10px 20px',
                backgroundColor: accentColor,
                color: '#FAFAF7',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              關閉
            </button>
          </div>
        )}

        {/* Herbs Placeholder */}
        {activeTab === 'herbs' && (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: mutedColor }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
              中藥庫即將上線
            </div>
            <div style={{ fontSize: '14px' }}>
              正在整理中藥學教材數據，敬請期待
            </div>
          </div>
        )}
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
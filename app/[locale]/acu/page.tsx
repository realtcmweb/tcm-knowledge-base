'use client'

import React, { useState, useEffect } from 'react'
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

const MERIDIANS = [
  { code: 'LU', name: '肺經' }, { code: 'LI', name: '大腸經' },
  { code: 'ST', name: '胃經' }, { code: 'SP', name: '脾經' },
  { code: 'HT', name: '心經' }, { code: 'SI', name: '小腸經' },
  { code: 'BL', name: '膀胱經' }, { code: 'KI', name: '腎經' },
  { code: 'PC', name: '心包經' }, { code: 'SJ', name: '三焦經' },
  { code: 'GB', name: '膽經' }, { code: 'LV', name: '肝經' },
]

const MENU_ITEMS = [
  { label: '📋 使用說明', href: '#' },
  { label: '⚠️ 免責聲明', href: '#', action: 'disclaimer' },
  { label: 'ℹ️ 關於本站', href: '#', action: 'about' },
  { label: '📩 聯絡我們', href: '#', action: 'contact' },
]

export default function AcupointsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeridian, setSelectedMeridian] = useState('')
  const [selectedAcupoint, setSelectedAcupoint] = useState<Acupoint | null>(null)
  const [acupoints, setAcupoints] = useState<Acupoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)

  useEffect(() => {
    fetch('/data/acupoints.json').then(r => r.json()).then(d => {
      setAcupoints(d)
      setLoading(false)
    })
  }, [])

  const filteredAcupoints = acupoints.filter(a => {
    if (selectedMeridian && a.meridian !== selectedMeridian) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.meridianName.includes(q) ||
        (a.indications && a.indications.toLowerCase().includes(q))
    }
    return true
  })

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'disclaimer') {
      setModalContent({ title: '⚠️ 免責聲明', body: '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。\n\n本站所收錄的中醫藥知識來源於公開文獻整理，編者在編輯過程中已盡可能核實內容準確性，但不保證所有資訊完全正確、及時或完整。讀者依此行事需自行承擔風險。' })
    } else if (action === 'about') {
      setModalContent({ title: 'ℹ️ 關於本站', body: '📖 醫道中醫大全是一個開源的中醫藥知識庫，收錄了針灸穴位、經典方劑等中醫藥資料。\n\n🎯 目標：讓中醫藥知識更容易被查詢和學習。\n\n📊 目前收錄：\n• 374 個針灸穴位（WHO 國際標準）\n• 205 首經典方劑\n• 更多內容持續更新中\n\n❤️ 製作給所有中醫藥愛好者。' })
    } else if (action === 'contact') {
      setModalContent({ title: '📩 聯絡我們', body: '如有問題或建議，歡迎透過以下方式聯絡：\n\n📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base\n\n我們會盡快回覆您。' })
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
            醫道中醫大全
          </div>

          {/* Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '7px 12px', color: '#FFFEF9',
                backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)',
                border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}
            >☰ <span style={{ fontSize: '11px' }}>選單</span></button>

            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: '220px', backgroundColor: '#FFFEF9', borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC',
              }}>
                {MENU_ITEMS.map((item, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={e => { e.preventDefault(); if (item.action) handleMenuAction(item.action) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '13px 16px', color: '#1a2C24', textDecoration: 'none',
                      fontSize: '13px', fontWeight: 600,
                      borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid #F0EDE5' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F2EB')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ fontSize: '15px' }}>{item.label.split(' ')[0]}</span>
                    <span style={{ flex: 1 }}>{item.label.split(' ').slice(1).join(' ')}</span>
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
              placeholder={loading ? '載入中...' : '搜尋穴位名稱、編碼...'}
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
                fontSize: '10px', color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            )}
          </div>
        </div>

        {/* 3-Tab */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: '7px' }}>
          {[
            { href: '/acu', label: '針灸大全', emoji: '💉', active: true },
            { href: '/db', label: '方劑大全', emoji: '🍵', active: false },
            { href: '/symptoms', label: '症狀', emoji: '🩺', active: false },
          ].map(tab => (
            <Link
              key={tab.label}
              href={tab.href}
              style={{
                flex: 1, padding: '10px 4px',
                backgroundColor: tab.active ? '#FFFEF9' : 'rgba(255,254,249,0.12)',
                color: tab.active ? '#1a3A2C' : 'rgba(255,254,249,0.8)',
                border: 'none', borderRadius: '12px', textDecoration: 'none',
                fontSize: '11px', fontWeight: 700, textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.emoji}</div>
              <div>{tab.label}</div>
            </Link>
          ))}
        </div>

        {/* Meridian Filter Pills */}
        {loading ? null : (
          <div style={{ padding: '10px 14px 0', display: 'flex', gap: '5px', overflowX: 'auto' }}>
            <button
              onClick={() => setSelectedMeridian('')}
              style={{
                padding: '5px 12px', borderRadius: '16px', border: 'none',
                fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
                backgroundColor: !selectedMeridian ? '#FFFEF9' : 'rgba(255,254,249,0.12)',
                color: !selectedMeridian ? '#1a3A2C' : 'rgba(255,254,249,0.8)', fontWeight: 600,
              }}
            >全部</button>
            {MERIDIANS.map(m => (
              <button
                key={m.code}
                onClick={() => setSelectedMeridian(m.code === selectedMeridian ? '' : m.code)}
                style={{
                  padding: '5px 10px', borderRadius: '16px', border: 'none',
                  fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
                  backgroundColor: selectedMeridian === m.code ? '#FFFEF9' : 'rgba(255,254,249,0.12)',
                  color: selectedMeridian === m.code ? '#1a3A2C' : 'rgba(255,254,249,0.8)', fontWeight: 600,
                }}
              >{m.code}</button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A', fontSize: '14px' }}>載入中...</div>
        ) : filteredAcupoints.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>找不到符合的穴位</div>
          </div>
        ) : (
          filteredAcupoints.slice(0, 200).map(a => (
            <button
              key={a.code}
              onClick={() => setSelectedAcupoint(a)}
              style={{
                width: '100%', padding: '13px 16px',
                backgroundColor: selectedAcupoint?.code === a.code ? '#F0EDE6' : '#FFFEF9',
                border: 'none', borderBottom: '1px solid #E8E4DC',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24' }}>{a.name}</span>
                <span style={{ fontSize: '11px', color: '#8A8A7A', backgroundColor: '#F0EDE5', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{a.code}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#8A8A7A' }}>
                {a.meridianName} · {a.indications?.slice(0, 40) || ''}...
              </div>
            </button>
          ))
        )}
        {!loading && filteredAcupoints.length > 200 && (
          <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#8A8A7A', backgroundColor: '#FFFEF9' }}>
            搜尋取得更多結果
          </div>
        )}
      </div>

      {/* Detail Bottom Sheet */}
      {selectedAcupoint && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSelectedAcupoint(null)}>
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
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a2C24', marginBottom: '8px' }}>
                {selectedAcupoint.name}
              </h2>
              <span style={{
                display: 'inline-block', padding: '4px 12px',
                backgroundColor: '#EEEBE3', borderRadius: '20px',
                fontSize: '12px', color: '#2C4A3E', fontWeight: 600,
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
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2C4A3E', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: '14px', color: '#2C3428', lineHeight: 1.7 }}>{value}</div>
              </div>
            ) : null)}
            <button
              onClick={() => setSelectedAcupoint(null)}
              style={{
                marginTop: '16px', padding: '12px',
                backgroundColor: '#1a3A2C', color: '#FFFEF9',
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 700, width: '100%',
              }}
            >關閉</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalContent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModalContent(null)}>
          <div
            style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw', maxWidth: '380px',
              backgroundColor: '#FFFEF9', borderRadius: '20px',
              padding: '24px 20px 28px', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
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
              style={{ display: 'block', width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}
            >關閉</button>
          </div>
        </div>
      )}

      {showMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import treatmentsData from '../../../public/data/treatments.json'

interface Acupoint {
  code: string
  name: string
  engName: string
  specialType: string
  location: string
  indications: string
  method: string
  anatomy: string
}

interface Treatment {
  name: string
  mainPoints: { name: string; code: string }[]
  paired: Record<string, string>
  zhifa: string
  fangyi: string
  caozuo: string
}

const MERIDIANS = [
  { code: 'LU', name: '肺經' }, { code: 'LI', name: '大腸經' },
  { code: 'ST', name: '胃經' }, { code: 'SP', name: '脾經' },
  { code: 'HT', name: '心經' }, { code: 'SI', name: '小腸經' },
  { code: 'BL', name: '膀胱經' }, { code: 'KI', name: '腎經' },
  { code: 'PC', name: '心包經' }, { code: 'TE', name: '三焦經' },
  { code: 'GB', name: '膽經' }, { code: 'LR', name: '肝經' },
]

const CATEGORIES = [
  { key: 'all', label: '全部穴位', emoji: '✨' },
  { key: 'regular', label: '十二經絡', emoji: '🫁' },
  { key: 'GV', label: '督脈', emoji: '⚡' },
  { key: 'CV', label: '任脈', emoji: '🌊' },
  { key: 'EX', label: '經外奇穴', emoji: '⭐' },
]

const POINT_TYPES = [
  { key: '井穴', label: '井穴' }, { key: '滎穴', label: '滎穴' },
  { key: '輸穴', label: '輸穴' }, { key: '經穴', label: '經穴' },
  { key: '合穴', label: '合穴' }, { key: '絡穴', label: '絡穴' },
  { key: '郄穴', label: '郄穴' }, { key: '原穴', label: '原穴' },
  { key: '募穴', label: '募穴' }, { key: '下合穴', label: '下合穴' },
]

const TREAT_CATEGORIES = [
  { key: 'all', label: '全部', emoji: '✨' },
  { key: 'nei', label: '內科', emoji: '🫀' },
  { key: 'fu', label: '婦科', emoji: '🤰' },
  { key: 'waike', label: '外科', emoji: '🩹' },
  { key: 'erm', label: '耳口鼻', emoji: '👂' },
  { key: 'shenjing', label: '神經精神', emoji: '🧠' },
  { key: 'guanjie', label: '骨關節', emoji: '🦴' },
]

const SYMPTOM_MAP: Record<string, string[]> = {
  nei: ['頭痛', '腰痛', '感冒', '咳嗽', '胃痛', '呃逆', '泄瀉', '脅痛', '淋證', '不寐', '鬱證', '高血壓病', '肥胖症'],
  fu: ['月經不調', '崩漏', '帶下病', '胎位不正', '陰挺', '遺尿', '早泄', '消渴'],
  waike: ['中風', '外傷性截癱', '腸癰', '脫肛', '痔瘡', '乳癖', '瘙癢症'],
  erm: ['牙痛', '口瘡', '戒斷綜合徵', '婷耳'],
  shenjing: ['震顫麻痺', '癡呆', '孤獨症', '抽搐', '出血證'],
  guanjie: ['膝骨性關節炎', '視神經萎縮'],
}

function getTreatCat(name: string): string {
  for (const [cat, names] of Object.entries(SYMPTOM_MAP)) {
    if (names.includes(name)) return cat
  }
  return 'nei'
}

function getMeridianName(code: string): string {
  const m = MERIDIANS.find(m => code.startsWith(m.code))
  return m ? m.name : ''
}

export default function AcupointsPage() {
  const [acupoints, setAcupoints] = useState<Acupoint[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'points' | 'treatment'>('points')
  const [acuView, setAcuView] = useState<'home' | 'category' | 'list'>('home')

  // Points view state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeridian, setSelectedMeridian] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPointType, setSelectedPointType] = useState('')
  const [selectedAcupoint, setSelectedAcupoint] = useState<Acupoint | null>(null)

  // Treatment view state
  const [treatSearch, setTreatSearch] = useState('')
  const [treatCat, setTreatCat] = useState('all')
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)

  // Shared
  const [showMenu, setShowMenu] = useState(false)
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)

  useEffect(() => {
    fetch('/data/acupoints.json').then(r => r.json()).then(d => {
      setAcupoints(d)
      setLoading(false)
    })
  }, [])

  const filteredAcupoints = acupoints.filter(a => {
    if (selectedCategory === 'regular' && !MERIDIANS.some(m => a.code.startsWith(m.code))) return false
    if (selectedCategory === 'GV' && !a.code.startsWith('GV')) return false
    if (selectedCategory === 'CV' && !a.code.startsWith('CV')) return false
    if (selectedCategory === 'EX' && !a.code.startsWith('EX')) return false
    if (selectedMeridian && !a.code.startsWith(selectedMeridian)) return false
    if (selectedPointType && !a.specialType.includes(selectedPointType)) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        (a.indications && a.indications.toLowerCase().includes(q))
    }
    return true
  })

  const filteredTreatments = (treatmentsData as Treatment[]).filter(t => {
    if (treatCat !== 'all' && getTreatCat(t.name) !== treatCat) return false
    if (treatSearch.trim()) {
      return t.name.includes(treatSearch.trim())
    }
    return true
  })

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'disclaimer') setModalContent({ title: '⚠️ 免責聲明', body: '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。' })
    else if (action === 'about') setModalContent({ title: 'ℹ️ 關於本站', body: '📖 醫道中醫大全是一個開源的中醫藥知識庫，收錄了針灸穴位、經典方劑等中醫藥資料。\n\n🎯 目標：讓中醫藥知識更容易被查詢和學習。\n\n📊 目前收錄：\n• 374 個針灸穴位（WHO 國際標準）\n• 205 首經典方劑\n• 39 個針灸治療處方\n• 更多內容持續更新中' })
    else if (action === 'contact') setModalContent({ title: '📩 聯絡我們', body: '📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base' })
    else if (action === 'guide') setModalContent({ title: '📋 使用說明', body: '📖 本資料庫收錄WHO國際標準針灸穴位374個。\n\n🔍 搜尋：輸入穴位名稱或編碼\n\n🏷️ 篩選方式：\n• 按經絡：點上方經絡代碼篩選\n• 按分類：督脈/任脈/經外奇穴\n• 按穴性：井穴/滎穴/輸穴/經穴/合穴/絡穴/郄穴/原穴/募穴\n\n💊 切換至「治療」模式可按症狀查詢針灸處方' })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a3A2C', color: '#FFFEF9', padding: '0 0 16px', borderRadius: '0 0 20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: '50px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
            <span style={{ fontSize: '15px' }}>🏠</span><span>首頁</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700 }}>針灸大全</div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', color: '#FFFEF9', backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              ☰ <span style={{ fontSize: '11px' }}>選單</span>
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', backgroundColor: '#FFFEF9', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC' }}>
                {[{ label: '📋 使用說明', action: 'guide' }, { label: '⚠️ 免責聲明', action: 'disclaimer' }, { label: 'ℹ️ 關於本站', action: 'about' }, { label: '📩 聯絡我們', action: 'contact' }].map((item, i) => (
                  <a key={i} href="#" onClick={e => { e.preventDefault(); if (item.action) handleMenuAction(item.action) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', color: '#1a2C24', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderBottom: i < 3 ? '1px solid #F0EDE5' : 'none' }}>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,254,249,0.15)', borderRadius: '14px', padding: '11px 14px', border: '1.5px solid rgba(255,254,249,0.25)' }}>
            <span style={{ fontSize: '16px', opacity: 0.8 }}>🔍</span>
            <input
              type="text"
              placeholder={loading ? '載入中...' : view === 'points' ? '搜尋穴位名稱、編碼...' : '搜尋症狀...'}
              value={view === 'points' ? searchQuery : treatSearch}
              onChange={e => view === 'points' ? setSearchQuery(e.target.value) : setTreatSearch(e.target.value)}
              disabled={loading}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#FFFEF9' }}
            />
            {(view === 'points' ? searchQuery : treatSearch) && (
              <button onClick={() => view === 'points' ? setSearchQuery('') : setTreatSearch('')} style={{ background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            )}
          </div>
        </div>

        {/* 3-Tab */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: '7px' }}>
          {[
            { href: '/acu', label: '針灸大全', emoji: '💉' },
            { href: '/db', label: '方劑大全', emoji: '🍵' },
            { href: '/herbs', label: '中藥大全', emoji: '🌿' },
            { href: '/symptoms', label: '症狀', emoji: '🩺' },
          ].map(tab => (
            <Link key={tab.href} href={tab.href} style={{
              flex: 1, padding: '10px 4px',
              backgroundColor: tab.href === '/acu' ? '#FFFEF9' : 'rgba(255,254,249,0.12)',
              color: tab.href === '/acu' ? '#1a3A2C' : 'rgba(255,254,249,0.8)',
              borderRadius: '12px', textDecoration: 'none', fontSize: '11px', fontWeight: 700, textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.emoji}</div>
              <div>{tab.label}</div>
            </Link>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div style={{ padding: '10px 14px 0', display: 'flex', gap: '6px' }}>
          <button
            onClick={() => { setView('points'); setAcuView('home') }}
            style={{
              flex: 1, padding: '9px 4px', borderRadius: '12px', border: 'none',
              cursor: 'pointer', fontSize: '12px', fontWeight: 700, textAlign: 'center',
              backgroundColor: view === 'points' ? '#FFFEF9' : 'rgba(255,254,249,0.12)',
              color: view === 'points' ? '#1a3A2C' : 'rgba(255,254,249,0.8)',
            }}
          >
            💉 {view === 'points' ? '穴位' : '穴位'}
          </button>
          <button
            onClick={() => { setView('treatment'); setAcuView('home') }}
            style={{
              flex: 1, padding: '9px 4px', borderRadius: '12px', border: 'none',
              cursor: 'pointer', fontSize: '12px', fontWeight: 700, textAlign: 'center',
              backgroundColor: view === 'treatment' ? '#FFFEF9' : 'rgba(255,254,249,0.12)',
              color: view === 'treatment' ? '#1a3A2C' : 'rgba(255,254,249,0.8)',
            }}
          >
            💊 {view === 'treatment' ? '治療' : '治療'}
          </button>
        </div>
      </div>

      {/* ===== POINTS VIEW ===== */}
      {view === 'points' && (
        <>
          {acuView === 'home' && (
            <>
              <div style={{ padding: '16px 14px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => { setAcuView('category') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💉</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '4px' }}>穴位查詢</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>十二經脈 · 督脈 · 任脈 · 經外奇穴</div>
                </button>
                <button onClick={() => { setSelectedCategory('regular'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🫁</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '4px' }}>十二經脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>手三陰三陽 · 足三陰三陽</div>
                </button>
                <button onClick={() => { setSelectedCategory('GV'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '4px' }}>督脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>陽脈之海 · 28穴</div>
                </button>
                <button onClick={() => { setSelectedCategory('CV'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌊</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '4px' }}>任脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>陰脈之海 · 24穴</div>
                </button>
              </div>
              <div style={{ padding: '8px 14px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => { setSelectedCategory('EX'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>⭐</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a2C24', marginBottom: '3px' }}>經外奇穴</div>
                  <div style={{ fontSize: '10px', color: '#8A8A7A' }}>不歸經 · 新穴</div>
                </button>
              </div>
            </>
          )}

          {acuView === 'category' && (
            <>
              <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setAcuView('home')} style={{
                  background: 'rgba(255,254,249,0.15)', border: 'none', borderRadius: '12px',
                  padding: '6px 10px', cursor: 'pointer', fontSize: '11px', color: '#FFFEF9', fontWeight: 700,
                }}>← 返回</button>
              </div>
              <div style={{ padding: '12px 14px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => { setSelectedCategory('regular'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🫁</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24' }}>十二經脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>肺經 · 大腸經 · 胃經 · 脾經...</div>
                </button>
                <button onClick={() => { setSelectedCategory('GV'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24' }}>督脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>陽脈之海</div>
                </button>
                <button onClick={() => { setSelectedCategory('CV'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌊</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24' }}>任脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>陰脈之海</div>
                </button>
                <button onClick={() => { setSelectedCategory('EX'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24' }}>經外奇穴</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>新穴</div>
                </button>
              </div>
            </>
          )}

          {acuView === 'list' && (
            <>
              <button onClick={() => setAcuView('home')} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '8px 14px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '11px', color: '#8A8A7A', fontWeight: 600,
              }}>← 返回首頁</button>

              {/* Category Banner */}
              <div style={{ padding: '10px 14px 0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.key} onClick={() => { setSelectedCategory(cat.key); setSelectedMeridian(''); setSelectedPointType('') }} style={{
                    padding: '6px 13px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
                    backgroundColor: selectedCategory === cat.key ? '#1a3A2C' : '#FFFEF9',
                    color: selectedCategory === cat.key ? '#FFFEF9' : '#1a2C24', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    <span>{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>

              {/* Meridian Pills */}
              {(selectedCategory === 'all' || selectedCategory === 'regular') && (
                <div style={{ padding: '8px 14px 0', display: 'flex', gap: '5px', overflowX: 'auto' }}>
                  <button onClick={() => setSelectedMeridian('')} style={{ padding: '5px 12px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: !selectedMeridian ? '#2C4A3E' : '#E8E4DC', color: !selectedMeridian ? '#FFFEF9' : '#1a2C24', fontWeight: 600 }}>全部</button>
                  {MERIDIANS.map(m => (
                    <button key={m.code} onClick={() => setSelectedMeridian(m.code === selectedMeridian ? '' : m.code)} style={{ padding: '5px 10px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: selectedMeridian === m.code ? '#2C4A3E' : '#E8E4DC', color: selectedMeridian === m.code ? '#FFFEF9' : '#1a2C24', fontWeight: 600 }}>
                      {m.code}
                    </button>
                  ))}
                </div>
              )}

              {/* Point Type Pills */}
              <div style={{ padding: '8px 14px 0', display: 'flex', gap: '5px', overflowX: 'auto' }}>
                <button onClick={() => setSelectedPointType('')} style={{ padding: '4px 10px', borderRadius: '14px', border: 'none', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: !selectedPointType ? '#8B4513' : '#E8E4DC', color: !selectedPointType ? '#FFFEF9' : '#5A3A2A', fontWeight: 600 }}>全部穴性</button>
                {POINT_TYPES.map(pt => (
                  <button key={pt.key} onClick={() => setSelectedPointType(pt.key === selectedPointType ? '' : pt.key)} style={{ padding: '4px 10px', borderRadius: '14px', border: 'none', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: selectedPointType === pt.key ? '#8B4513' : '#E8E4DC', color: selectedPointType === pt.key ? '#FFFEF9' : '#5A3A2A', fontWeight: 600 }}>
                    {pt.label}
                  </button>
                ))}
              </div>

              {/* Result count */}
              <div style={{ padding: '8px 16px 4px', fontSize: '11px', color: '#8A8A7A' }}>
                {loading ? '...' : filteredAcupoints.length + ' 個穴位'}
                {selectedMeridian && (' · ' + MERIDIANS.find(m => m.code === selectedMeridian)?.name)}
                {selectedPointType && (' · ' + selectedPointType)}
              </div>

              {/* List */}
              <div style={{ padding: '0 0 80px' }}>
                {loading ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#7A7A6A', fontSize: '14px' }}>載入中...</div>
                ) : filteredAcupoints.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#7A7A6A' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>找不到符合的穴位</div>
                  </div>
                ) : (
                  filteredAcupoints.slice(0, 200).map(a => (
                    <button key={a.code} onClick={() => setSelectedAcupoint(a)} style={{
                      width: '100%', padding: '12px 16px',
                      backgroundColor: selectedAcupoint?.code === a.code ? '#F0EDE6' : '#FFFEF9',
                      border: 'none', borderBottom: '1px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24' }}>{a.name}</span>
                        <span style={{ fontSize: '11px', color: '#8A8A7A', backgroundColor: '#F0EDE5', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{a.code}</span>
                        {a.specialType && <span style={{ fontSize: '10px', color: '#8B4513', backgroundColor: '#FDF3E7', padding: '2px 8px', borderRadius: '10px' }}>{a.specialType}</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8A8A7A' }}>
                        {getMeridianName(a.code)} · {(a.indications || '').slice(0, 35)}...
                      </div>
                    </button>
                  ))
                )}
                {!loading && filteredAcupoints.length > 200 && (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#8A8A7A' }}>搜尋取得更多結果</div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ===== TREATMENT VIEW ===== */}
      {view === 'treatment' && (
        <>
          {/* Category tabs */}
          <div style={{ padding: '12px 14px 0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {TREAT_CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setTreatCat(c.key)} style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '12px',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 700,
                backgroundColor: treatCat === c.key ? '#1a3A2C' : '#E8E4DC',
                color: treatCat === c.key ? '#FFFEF9' : '#4A3A2C',
              }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* Result count */}
          <div style={{ padding: '8px 16px 4px', fontSize: '11px', color: '#8A8A7A' }}>
            {filteredTreatments.length} 個治療處方
          </div>

          {/* Symptom grid */}
          <div style={{ padding: '0 14px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {filteredTreatments.map(t => (
              <button key={t.name} onClick={() => setSelectedTreatment(t as Treatment)} style={{
                backgroundColor: selectedTreatment?.name === t.name ? '#F0EDE6' : '#FFFEF9',
                borderRadius: '16px', padding: '14px',
                border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1a2C24', marginBottom: '6px' }}>
                  {t.name}
                </div>
                <div style={{ fontSize: '11px', color: '#8B4513', marginBottom: '3px' }}>
                  主穴：{t.mainPoints.slice(0, 3).map(p => p.name).join('、')}{t.mainPoints.length > 3 ? '...' : ''}
                </div>
                <div style={{ fontSize: '10px', color: '#8A8A7A' }}>
                  {Object.keys(t.paired).length > 0 ? Object.keys(t.paired)[0] : '綜合處方'}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ===== TREATMENT BOTTOM SHEET ===== */}
      {selectedTreatment && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSelectedTreatment(null)}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '90vh', backgroundColor: '#FFFEF9', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', overflowY: 'auto', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#D4D0C8' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1a2C24', marginBottom: '4px' }}>{selectedTreatment.name}</h2>
            <div style={{ fontSize: '12px', color: '#8A8A7A', marginBottom: '16px' }}>針灸治療處方</div>

            {/* Main points */}
            <div style={{ backgroundColor: '#F7F5F0', borderRadius: '14px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>💉 主穴</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedTreatment.mainPoints.map(p => (
                  <Link key={p.name} href={`/acu?q=${encodeURIComponent(p.name)}`} onClick={() => setSelectedTreatment(null)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '5px 10px', backgroundColor: '#FDF3E7', borderRadius: '20px',
                    border: '1px solid #E8C99A', textDecoration: 'none', fontSize: '12px',
                    color: '#8B4513', fontWeight: 700,
                  }}>
                    {p.name} {p.code && <span style={{ fontSize: '10px', opacity: 0.7 }}>{p.code}</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Paired points */}
            {Object.keys(selectedTreatment.paired).length > 0 && (
              <div style={{ backgroundColor: '#F7F5F0', borderRadius: '14px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>🔗 配穴</div>
                {Object.entries(selectedTreatment.paired).map(([syndrome, desc]) => (
                  <div key={syndrome} style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#8B4513', marginBottom: '3px' }}>▎ {syndrome}</div>
                    <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Zhifa */}
            {selectedTreatment.zhifa && (
              <div style={{ backgroundColor: '#F7F5F0', borderRadius: '14px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>⚕️ 治法</div>
                <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.7 }}>{selectedTreatment.zhifa}</div>
              </div>
            )}

            {/* Caozuo */}
            {selectedTreatment.caozuo && (
              <div style={{ backgroundColor: '#F7F5F0', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#1a3A2C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>🪡 操作</div>
                <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.7 }}>{selectedTreatment.caozuo}</div>
              </div>
            )}

            <button onClick={() => setSelectedTreatment(null)} style={{ marginTop: '4px', padding: '12px', backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, width: '100%' }}>
              關閉
            </button>
          </div>
        </div>
      )}

      {/* ===== ACUPOINT DETAIL BOTTOM SHEET ===== */}
      {selectedAcupoint && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSelectedAcupoint(null)}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88vh', backgroundColor: '#FFFEF9', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', overflowY: 'auto', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#D4D0C8' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a2C24', marginBottom: '8px' }}>{selectedAcupoint.name}</h2>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', backgroundColor: '#EEEBE3', borderRadius: '20px', fontSize: '12px', color: '#2C4A3E', fontWeight: 700 }}>{selectedAcupoint.code} · {getMeridianName(selectedAcupoint.code)}</span>
                {selectedAcupoint.specialType && <span style={{ padding: '3px 10px', backgroundColor: '#FDF3E7', borderRadius: '20px', fontSize: '12px', color: '#8B4513', fontWeight: 700 }}>{selectedAcupoint.specialType}</span>}
              </div>
            </div>
            {[
              { label: '定位', value: selectedAcupoint.location },
              { label: '主治', value: selectedAcupoint.indications },
              { label: '針法', value: selectedAcupoint.method },
              { label: '解剖', value: selectedAcupoint.anatomy },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2C4A3E', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: '14px', color: '#2C3428', lineHeight: 1.75 }}>{value}</div>
              </div>
            ) : null)}
            <button onClick={() => setSelectedAcupoint(null)} style={{ marginTop: '16px', padding: '12px', backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, width: '100%' }}>關閉</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalContent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModalContent(null)}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '90vw', maxWidth: '380px', backgroundColor: '#FFFEF9', borderRadius: '20px', padding: '24px 20px 28px', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a2C24', marginBottom: '14px', textAlign: 'center' }}>{modalContent.title}</h2>
            <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'center' }}>{modalContent.body}</div>
            <button onClick={() => setModalContent(null)} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>關閉</button>
          </div>
        </div>
      )}

      {showMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />}
    </div>
  )
}

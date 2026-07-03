'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MENU_ITEMS is defined below after T_MENU (uses lang-aware text)

interface RetrieverResult {
  id: string
  name: string
  type: string
  description?: string
}

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<RetrieverResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)
  const [acupointsCount, setAcupointsCount] = useState(0)
  const [formulasCount, setFormulasCount] = useState(0)
  const [herbsCount, setHerbsCount] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)
  const LANG_KEY = 'tcm_lang'
  const [lang, setLang] = useState('tw')

  const toggleLang = () => {
    const next = lang === 'tw' ? 'cn' : 'tw'
    setLang(next)
    localStorage.setItem(LANG_KEY, next)
  }

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as 'tw' | 'cn' | null
    if (saved) setLang(saved)
  }, [])

  const T_MENU = lang === 'tw'
    ? { langToggle: '繁體 / 簡體', langCurrent: '繁', guide: '使用說明', disclaimer: '免責聲明', about: '關於本站', contact: '聯絡我們' }
    : { langToggle: '繁体 / 简体', langCurrent: '简', guide: '使用说明', disclaimer: '免责声明', about: '关于我们', contact: '联系我们' }

  const MENU_ITEMS = [
    { label: T_MENU.langToggle, icon: '🌐', action: 'lang' },
    { label: '🔤 字體 ±', icon: '🔤', action: 'font' },
    { label: T_MENU.guide, icon: '📋', action: 'guide' },
    { label: T_MENU.disclaimer, icon: '⚠️', action: 'disclaimer' },
    { label: T_MENU.about, icon: 'ℹ️', action: 'about' },
    { label: T_MENU.contact, icon: '📩', action: 'contact' },
  ]

  useEffect(() => {
    Promise.all([
      fetch('/data/acupoints.json').then(r => r.json()),
      fetch('/data/formulas.json').then(r => r.json()),
      fetch('/data/herbs.json').then(r => r.json()),
    ]).then(([a, f, h]) => {
      setAcupointsCount(a.length)
      setFormulasCount(f.length)
      setHerbsCount(h.length)
      setLoading(false)
    })
  }, [])

  // 智慧建議：调用 retriever API
  useEffect(() => {
    if (!search.trim() || search.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('http://127.0.0.1:8765/retrieve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: search.trim(), topK: 6 })
        })
        const data = await res.json()
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results.slice(0, 6))
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (e) {
        console.error('retriever error:', e)
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // 點擊外部關閉建議
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node) && !searchRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    if (!search.trim()) return
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  // 語音輸入
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('瀏覽器不支持語音輸入')
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'tw' ? 'zh-TW' : 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    setIsListening(true)
    recognition.start()
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearch(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const goToSuggestion = (item: RetrieverResult) => {
    setShowSuggestions(false)
    const typeMap: Record<string, string> = { Herb: '/herbs', Formula: '/db', Acupoint: '/acu', Pattern: '/symptoms', Symptom: '/symptoms', Disease: '/symptoms' }
    const path = typeMap[item.type] || '/search'
    router.push(`${path}?q=${encodeURIComponent(item.name)}`)
  }

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'lang') { toggleLang(); return }
    if (action === 'disclaimer') setModalContent({ title: '⚠️ 免責聲明', body: '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。\n\n本站所收錄的中醫藥知識來源於公開文獻整理，編者在編輯過程中已盡可能核實內容準確性，但不保證所有資訊完全正確、及時或完整。讀者依此行事需自行承擔風險。' })
    else if (action === 'about') setModalContent({ title: 'ℹ️ 關於本站', body: `📖 醫道中醫大全是一個開源的中醫藥知識庫，收錄了針灸穴位、經典方劑等中醫藥資料。\n\n🎯 目標：讓中醫藥知識更容易被查詢和學習。\n\n📊 目前收錄：\n• ${acupointsCount} 個針灸穴位（WHO 國際標準）\n• ${formulasCount} 首經典方劑\n• ${herbsCount} 味中藥\n• 更多內容持續更新中\n\n❤️ 製作給所有中醫藥愛好者。` })
    else if (action === 'contact') setModalContent({ title: '📩 聯絡我們', body: '📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base\n\n我們會盡快回覆您。' })
    else if (action === 'font') setFontSize(fontSize >= 20 ? 12 : fontSize + 2)
    else if (action === 'guide') setModalContent({ title: '📋 使用說明', body: '📖 本資料庫分為四大專區：\n\n💉 針灸大全：收錄WHO國際標準穴位374個，可依經絡、穴性篩選。\n\n🍵 方劑大全：收錄205首經典方劑，按功效18分類。\n\n🩺 症狀區：輸入症狀找到可能的中醫證型。\n\n🌿 中藥大全：收錄422味中藥，按功效22分類，含药性、功效、应用、用量等。\n\n🔍 搜尋：支援名稱、功效、分類等多種方式。' })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', fontSize: `${fontSize}px`, fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a3A2C', color: '#FFFEF9', padding: '0 0 32px', borderRadius: '0 0 24px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: '52px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
            <span style={{ fontSize: '16px' }}>🏠</span><span>首頁</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700 }}>醫道中醫大全</div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', color: '#FFFEF9', backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              ☰ <span style={{ fontSize: '11px' }}>選單</span>
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', backgroundColor: '#FFFEF9', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC' }}>
                {MENU_ITEMS.map((item, i) => (
                  <a key={i} href="#" onClick={e => { e.preventDefault(); if (item.action) handleMenuAction(item.action) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', color: '#1a2C24', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid #F0EDE5' : 'none' }}>
                    <span style={{ fontSize: '15px' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px', position: 'relative' }}>
          <label htmlFor="home-search-input" ref={searchRef} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,254,249,0.15)', borderRadius: '14px', padding: '12px 14px', border: '1.5px solid rgba(255,254,249,0.25)', cursor: 'text' }}
            onClick={() => document.getElementById('home-search-input')?.focus()}>
            <span style={{ fontSize: '17px', opacity: 0.7, flexShrink: 0, userSelect: 'none' }}>🔍</span>
            <input id="home-search-input"
              type="text"
              placeholder={loading ? '載入中...' : '搜尋穴位、方劑、藥材...'}
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              onFocus={() => search.trim().length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
              disabled={loading}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#FFFEF9', caretColor: '#FFFEF9' }} />
            {/* 語音按鈕 */}
            <button type="button" onClick={handleVoiceInput} disabled={loading || isListening} style={{ background: isListening ? '#ff6b6b' : 'rgba(255,254,249,0.2)', border: 'none', borderRadius: 20, padding: '6px 10px', cursor: loading || isListening ? 'default' : 'pointer', fontSize: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
              {isListening ? '🔴' : '🎤'}
            </button>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,254,249,0.7)', flexShrink: 0 }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,254,249,0.4)', borderTopColor: '#FFFEF9', borderRadius: '50%' }} className="animate-spin-fast" />
              </span>
            ) : search ? (
              <button onClick={() => { setSearch(''); setSuggestions([]); setShowSuggestions(false); document.getElementById('home-search-input')?.focus() }} style={{ background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: 20, padding: '2px 8px', cursor: 'pointer', fontSize: 11, color: '#FFFEF9', fontWeight: 700, display: 'flex', alignItems: 'center', flexShrink: 0 }}>✕</button>
            ) : null}
            {!loading && (
              <button onClick={handleSearch} disabled={!search.trim()} style={{ padding: '7px 16px', backgroundColor: search.trim() ? '#FFFEF9' : 'rgba(255,254,249,0.3)', color: '#1a3A2C', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: search.trim() ? 'pointer' : 'default', flexShrink: 0 }}>搜尋</button>
            )}
          </label>
          {/* 智能建議卡片 */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionRef} style={{ position: 'absolute', left: 16, right: 16, top: '100%', marginTop: 8, backgroundColor: '#FFFEF9', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 200, overflow: 'hidden', border: '1px solid #E8E4DC' }}>
              <div style={{ padding: '10px 14px', fontSize: 11, color: '#8A8A7A', fontWeight: 600, borderBottom: '1px solid #F0EDE5', backgroundColor: '#FAF9F6' }}>💡 智能建議</div>
              {suggestions.map((item, i) => (
                <div key={i} onClick={() => goToSuggestion(item)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #F0EDE5' : 'none', transition: 'background 0.15s' }}>
                  <span style={{ fontSize: 18 }}>{item.type === 'Herb' ? '🌿' : item.type === 'Formula' ? '🍵' : item.type === 'Acupoint' ? '💉' : item.type === 'Pattern' ? '🔯' : '📋'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2C24' }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: 11, color: '#6A6A5A', marginTop: 2 }}>{item.description.slice(0, 50)}{item.description.length > 50 ? '...' : ''}</div>}
                  </div>
                  <span style={{ fontSize: 10, color: '#8A8A7A', backgroundColor: '#F0EDE5', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{item.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
          {[{ emoji: '💉', count: loading ? '...' : acupointsCount, label: '穴位' }, { emoji: '🍵', count: loading ? '...' : formulasCount, label: '方劑' }, { emoji: '🩺', count: '—', label: '症狀' }, { emoji: '🌿', count: loading ? '...' : herbsCount, label: '中藥' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: '1px' }}>{s.emoji}</div>
              <div style={{ fontSize: '16px', fontWeight: 800 }}>{s.count}</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Sections 3+2 Grid */}
      <div style={{ padding: '12px 14px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#8A8A7A', marginBottom: '8px', paddingLeft: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>中醫資料庫</h2>

        {/* Row 1 — 3 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          {/* 針灸大全 */}
          <Link href="/acu" style={{ display: 'flex', flexDirection: 'column', padding: '14px 14px 12px', backgroundColor: '#EEF4F0', borderRadius: '16px', border: '1.5px solid #D8E4DC', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '28px', lineHeight: 1 }}>💉</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a2C24', marginBottom: '2px' }}>針灸大全</div>
                <div style={{ fontSize: '10px', color: '#5A8A6A', fontWeight: 600 }}>{loading ? '...' : acupointsCount} 穴位</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#5A5A4A', lineHeight: 1.5, marginBottom: '8px', flex: 1 }}>
              十二經絡、督脈任脈、經外奇穴，可依經絡或穴性篩選
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['經絡', '穴性', 'WHO'].map(tag => (
                <span key={tag} style={{ fontSize: '9px', color: '#2C4A3E', backgroundColor: 'rgba(44,74,62,0.1)', padding: '2px 7px', borderRadius: '8px', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </Link>

          {/* 方劑大全 */}
          <Link href="/db" style={{ display: 'flex', flexDirection: 'column', padding: '14px 14px 12px', backgroundColor: '#FDF3E7', borderRadius: '16px', border: '1.5px solid #E8DDD0', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '28px', lineHeight: 1 }}>🍵</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a2C24', marginBottom: '2px' }}>方劑大全</div>
                <div style={{ fontSize: '10px', color: '#8A5A3A', fontWeight: 600 }}>{loading ? '...' : formulasCount} 首方劑</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#5A5A4A', lineHeight: 1.5, marginBottom: '8px', flex: 1 }}>
              《傷寒論》《金匱》经典方劑，按功效18分類，方便依症找方
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['解表', '清熱', '補益', '更多'].map(tag => (
                <span key={tag} style={{ fontSize: '9px', color: '#8B4513', backgroundColor: 'rgba(139,69,19,0.1)', padding: '2px 7px', borderRadius: '8px', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </Link>
        </div>

        {/* Row 2 — 2 cards (左對齊) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {/* 症狀 */}
          <Link href="/symptoms" style={{ display: 'flex', flexDirection: 'column', padding: '14px 14px 12px', backgroundColor: '#F3EEF7', borderRadius: '16px', border: '1.5px solid #E0D8EC', textDecoration: 'none', opacity: 0.8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '28px', lineHeight: 1 }}>🩺</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a2C24', marginBottom: '2px' }}>症狀大全</div>
                <div style={{ fontSize: '10px', color: '#6A4A8A', fontWeight: 600 }}>即將上線</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#5A5A4A', lineHeight: 1.5, marginBottom: '8px', flex: 1 }}>
              輸入症狀找中醫證型，含辯證要點、治法建議
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['辯證', '治法'].map(tag => (
                <span key={tag} style={{ fontSize: '9px', color: '#6A4A8A', backgroundColor: 'rgba(106,74,138,0.1)', padding: '2px 7px', borderRadius: '8px', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </Link>

          {/* 中藥大全 */}
          <Link href="/herbs" style={{ display: 'flex', flexDirection: 'column', padding: '14px 14px 12px', backgroundColor: '#F0F4E0', borderRadius: '16px', border: '1.5px solid #D8E0C8', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '28px', lineHeight: 1 }}>🌿</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a2C24', marginBottom: '2px' }}>中藥大全</div>
                <div style={{ fontSize: '10px', color: '#5A6A1A', fontWeight: 600 }}>{loading ? '...' : herbsCount} 味</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#5A5A4A', lineHeight: 1.5, marginBottom: '8px', flex: 1 }}>
              性味、歸經、功效主治，配伍禁忌等中藥知識
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['性味', '歸經'].map(tag => (
                <span key={tag} style={{ fontSize: '9px', color: '#5A6A1A', backgroundColor: 'rgba(90,106,26,0.1)', padding: '2px 7px', borderRadius: '8px', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </Link>

          {/* 學習大全 */}
          <Link href="/learn" style={{ display: 'flex', flexDirection: 'column', padding: '14px 14px 12px', backgroundColor: '#F5E8F0', borderRadius: '16px', border: '1.5px solid #E0C8D8', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '28px', lineHeight: 1 }}>📚</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a2C24', marginBottom: '2px' }}>學習大全</div>
                <div style={{ fontSize: '10px', color: '#8A4A6A', fontWeight: 600 }}>互動學習</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#5A5A4A', lineHeight: 1.5, marginBottom: '8px', flex: 1 }}>
              系統學針灸，含穴位故事、配穴、配伍
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['故事', '配穴', '互動'].map(tag => (
                <span key={tag} style={{ fontSize: '9px', color: '#8A4A6A', backgroundColor: 'rgba(138,74,106,0.1)', padding: '2px 7px', borderRadius: '8px', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </Link>

          {/* 第三格留白（保持 3-column 對齊） */}
          <div style={{ backgroundColor: 'transparent' }} />
        </div>
      </div>

      {/* 12 Meridian Quick Access */}
      <div style={{ padding: '0 16px 16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24', marginBottom: '10px', paddingLeft: '4px' }}>十二經絡快速查詢</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px' }}>
          {[
            { code: 'LU', name: '肺經', emoji: '🌬️' }, { code: 'LI', name: '大腸經', emoji: '💨' },
            { code: 'ST', name: '胃經', emoji: '🍚' }, { code: 'SP', name: '脾經', emoji: '🟤' },
            { code: 'HT', name: '心經', emoji: '❤️' }, { code: 'SI', name: '小腸經', emoji: '🔥' },
            { code: 'BL', name: '膀胱經', emoji: '💧' }, { code: 'KI', name: '腎經', emoji: '🌙' },
            { code: 'PC', name: '心包經', emoji: '🫀' }, { code: 'TE', name: '三焦經', emoji: '🔥' },
            { code: 'GB', name: '膽經', emoji: '💚' }, { code: 'LV', name: '肝經', emoji: '🌳' },
          ].map(m => (
            <Link key={m.code} href="/acu" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px', backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '14px', marginBottom: '2px' }}>{m.emoji}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1a3A2C' }}>{m.code}</span>
              <span style={{ fontSize: '9px', color: '#8A8A7A' }}>{m.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #E8E4DC', textAlign: 'center', fontSize: '11px', color: '#8A8A7A', backgroundColor: '#FFFEF9' }}>
        ⚠️ 本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。
      </div>

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
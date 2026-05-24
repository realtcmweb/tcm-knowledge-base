'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { toSimplified } from '@/lib/toSimplified'
import { useRouter, usePathname } from 'next/navigation'

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
  { key: '解表劑', tw: '解表劑', cn: '解表剂', emoji: '🌬️' },
  { key: '清熱劑', tw: '清熱劑', cn: '清热剂', emoji: '🔥' },
  { key: '瀉下劑', tw: '瀉下劑', cn: '泻下剂', emoji: '💩' },
  { key: '和解劑', tw: '和解劑', cn: '和解剂', emoji: '🔄' },
  { key: '溫裡劑', tw: '溫裡劑', cn: '温里剂', emoji: '🤝' },
  { key: '補益劑', tw: '補益劑', cn: '补益剂', emoji: '💪' },
  { key: '理氣劑', tw: '理氣劑', cn: '理气剂', emoji: '😤' },
  { key: '理血劑', tw: '理血劑', cn: '理血剂', emoji: '❤️' },
  { key: '祛痰劑', tw: '祛痰劑', cn: '祛痰剂', emoji: '😷' },
  { key: '安神劑', tw: '安神劑', cn: '安神剂', emoji: '😴' },
  { key: '祛濕劑', tw: '祛濕劑', cn: '祛湿剂', emoji: '💧' },
  { key: '治風劑', tw: '治風劑', cn: '治风剂', emoji: '🌪️' },
  { key: '消導劑', tw: '消導劑', cn: '消导剂', emoji: '🍽️' },
  { key: '固澀劑', tw: '固澀劑', cn: '固涩剂', emoji: '🔒' },
  { key: '治燥劑', tw: '治燥劑', cn: '治燥剂', emoji: '🏜️' },
  { key: '驅蟲劑', tw: '驅蟲劑', cn: '驱虫剂', emoji: '🐛' },
  { key: '涌吐劑', tw: '涌吐劑', cn: '涌吐剂', emoji: '🤮' },
  { key: '治瘡劑', tw: '治瘡劑', cn: '治疮剂', emoji: '🩹' },
]

function getLinkedComposition(composition: string, herbNamesSorted: string[]): React.ReactNode[] {
  if (!composition || !herbNamesSorted.length) return [composition]
  const normalizedComp = composition.replace(/\s+/g, '')
  const parts: React.ReactNode[] = []
  let remaining = normalizedComp
  while (remaining) {
    let matched = false
    for (const hn of herbNamesSorted) {
      const hnNorm = hn.replace(/\s+/g, '')
      const idx = remaining.indexOf(hnNorm)
      if (idx === 0) {
        parts.push(
          <Link key={`${hn}-${parts.length}`} href={`/${'zh-TW'}/herbs?herb=${encodeURIComponent(hn)}`} style={{ color: '#2C6B3A', fontWeight: 700, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>
            {hn}
          </Link>
        )
        remaining = remaining.slice(hnNorm.length)
        matched = true
        break
      }
    }
    if (!matched) {
      const next = remaining.search(/[\u4e00-\u9fa5]/)
      if (next === 0) {
        parts.push(remaining[0])
        remaining = remaining.slice(1)
      } else if (next > 0) {
        parts.push(remaining.slice(0, next))
        remaining = remaining.slice(next)
      } else {
        parts.push(remaining)
        break
      }
    }
  }
  return parts
}

export default function FormulasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState('解表劑')
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [loading, setLoading] = useState(true)
  const [showCatSidebar, setShowCatSidebar] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)
  const [dbView, setDbView] = useState<'home' | 'list'>('home')
  const router = useRouter()
  const locale = usePathname().split('/')[1] || 'zh-TW'
  const isCN = locale === 'zh-CN'

  const T_MENU = {
    langToggle: isCN ? '繁體 / 簡體' : '繁体 / 简体',
    langCurrent: isCN ? '简' : '繁',
    guide: isCN ? '📋 使用说明' : '📋 使用說明',
    disclaimer: isCN ? '⚠️ 免责声明' : '⚠️ 免责声名',
    about: isCN ? 'ℹ️ 关于本站' : 'ℹ️ 關於本站',
    contact: isCN ? '📩 联系我们' : '📩 聯絡我們',
  }

  const MENU_ITEMS = [
    { label: T_MENU.langToggle, icon: '🌐', action: 'lang' },
    { label: T_MENU.guide, icon: '📋', action: 'guide' },
    { label: T_MENU.disclaimer, icon: '⚠️', action: 'disclaimer' },
    { label: T_MENU.about, icon: 'ℹ️', action: 'about' },
    { label: T_MENU.contact, icon: '📩', action: 'contact' },
  ]

  const [herbNames, setHerbNames] = useState<string[]>([])
  const herbNamesSorted = useMemo(() => [...herbNames].sort((a, b) => b.length - a.length), [herbNames])

  useEffect(() => {
    Promise.all([
      fetch('/data/formulas.json').then(r => r.json()),
      fetch('/data/herbs.json').then(r => r.json()),
    ]).then(([f, h]) => {
      setFormulas(f)
      setHerbNames(h.map((x: { name: string }) => x.name))
      setLoading(false)
    })
  }, [])

  const filteredFormulas = formulas.filter(f => {
    if (selectedCat && f.category !== selectedCat) return false
    if (searchQuery.trim()) {
      const sq = toSimplified(searchQuery).toLowerCase()
      return f.name.toLowerCase().includes(sq) ||
        f.source.toLowerCase().includes(sq) ||
        f.effects.toLowerCase().includes(sq) ||
        f.categoryLabel.includes(sq)
    }
    return true
  })

  const activeCat = FORMULA_CATEGORIES.find(c => c.key === selectedCat) || FORMULA_CATEGORIES[0]

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'lang') {
      router.push(locale === 'zh-TW' ? '/zh-CN/db' : '/zh-TW/db')
      return
    }
    if (action === 'disclaimer') {
      setModalContent({ title: T_MENU.disclaimer, body: isCN ? '本资料库内容仅供学术参考，不作商业用途。有病请寻求合法的医师，非中医师请勿擅自处方服药。\n\n本站所收录的中医药知识来源于公开文献整理，编者已尽可能核实内容准确性，但不保证所有信息完全正确、及时或完整。读者依此行事需自行承担风险。' : '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。\n\n本站所收錄的中醫藥知識來源於公開文獻整理，編者在編輯過程中已盡可能核實內容準確性，但不保證所有資訊完全正確、及時或完整。讀者依此行事需自行承擔風險。' })
    } else if (action === 'about') {
      setModalContent({ title: 'ℹ️ 關於本站', body: isCN ? '📖 医道中医大全是一个开源的中医药知识库，收录了针灸穴位、经典方剂等中医药资料。\n\n🎯 目标：让中医药知识更容易被查询和学习。\n\n📊 目前收录：\n• 374 个针灸穴位（WHO 国际标准）\n• 205 首经典方剂\n• 更多内容持续更新中\n\n❤️ 制作给所有中医药爱好者。' : '📖 醫道中醫大全是一個開源的中醫藥知識庫，收錄了針灸穴位、經典方劑等中醫藥資料。\n\n🎯 目標：讓中醫藥知識更容易被查詢和學習。\n\n📊 目前收錄：\n• 374 個針灸穴位（WHO 國際標準）\n• 205 首經典方劑\n• 更多內容持續更新中\n\n❤️ 製作給所有中醫藥愛好者。' })
    } else if (action === 'contact') {
      setModalContent({ title: isCN ? '📩 联系我们' : '📩 聯絡我們', body: isCN ? '📧 请在 GitHub 仓库提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base\n\n我们会尽快回复您。' : '📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base\n\n我們會盡快回覆您。' })
    } else if (action === 'guide') {
      setModalContent({ title: T_MENU.guide, body: isCN ? '📖 本资料库收录中医经典方剂205首。\n\n🔍 搜寻：输入方剂名称或功效\n\n🏷️ 分类方式：\n• 按主治功效：解表剂/清热剂/补益剂...\n• 按方剂来源：伤寒论/金匮要略...\n\n💡 方剂详情页显示：组成、功效、主治、方义' : '📖 本資料庫收錄中醫經典方劑205首。\n\n🔍 搜尋：輸入方劑名稱或功效\n\n🏷️ 分類方式：\n• 按主治功效：解表劑/清熱劑/補益劑...\n• 按方劑來源：傷寒論/金匱要略...\n\n💡 方劑詳情頁顯示：組成、功效、主治、方義' })
    }
  }

  const catLabel = (cat: typeof FORMULA_CATEGORIES[0]) => isCN ? cat.cn : cat.tw

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a3A2C', color: '#FFFEF9', padding: '0 0 18px', borderRadius: '0 0 20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: '50px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
            <span style={{ fontSize: '15px' }}>🏠</span>
            <span>{isCN ? '首页' : '首頁'}</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700, letterSpacing: '0.03em' }}>
            {isCN ? '方剂大全' : '方劑大全'}
          </div>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', color: '#FFFEF9', backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              ☰ <span style={{ fontSize: '11px' }}>{isCN ? '菜单' : '選單'}</span>
            </button>

            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', backgroundColor: '#FFFEF9', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC' }}>
                {MENU_ITEMS.map((item, i) => (
                  <a key={i} href="#" onClick={e => { e.preventDefault(); handleMenuAction(item.action) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', color: '#1a2C24', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid #F0EDE5' : 'none' }}>
                    <span style={{ fontSize: '15px' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,254,249,0.15)', borderRadius: '14px', padding: '11px 14px', border: '1.5px solid rgba(255,254,249,0.25)' }}>
            <span style={{ fontSize: '16px', opacity: 0.8 }}>🔍</span>
            <input type="text" placeholder={loading ? (isCN ? '载入中...' : '載入中...') : (isCN ? '搜寻方剂名称、功效、分类...' : '搜尋方劑名稱、功效、分類...')}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearchQuery(searchQuery)}
              disabled={loading}
              style={{ flex: 1, border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '14px', color: '#FFFEF9' }} />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} style={{ background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: 20, padding: '2px 8px', cursor: 'pointer', fontSize: 11, color: '#FFFEF9', fontWeight: 700, display: 'flex', alignItems: 'center' }}>✕</button>
            ) : <span style={{ width: 28 }} />}
            <button onClick={() => { setSearchQuery(searchQuery); setDbView('list') }} style={{ background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: 20, padding: '2px 8px', cursor: 'pointer', fontSize: 11, color: '#FFFEF9', fontWeight: 700, display: 'flex', alignItems: 'center' }}>送出</button>
          </div>
        </div>

        {/* 4-Tab Navigation */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: '7px' }}>
          {[
            { href: `/${locale}/acu`, label: isCN ? '针灸大全' : '針灸大全', emoji: '💉' },
            { href: `/${locale}/db`, label: isCN ? '方剂大全' : '方劑大全', emoji: '🍵' },
            { href: `/${locale}/herbs`, label: isCN ? '中药大全' : '中藥大全', emoji: '🌿' },
            { href: `/${locale}/symptoms`, label: isCN ? '症状大全' : '症狀大全', emoji: '🩺' },
          ].map(tab => (
            <Link key={tab.label} href={tab.href} style={{ flex: 1, padding: '10px 4px', backgroundColor: tab.href === `/${locale}/db` ? '#FFFEF9' : 'rgba(255,254,249,0.12)', color: tab.href === `/${locale}/db` ? '#1a3A2C' : 'rgba(255,254,249,0.8)', borderRadius: '12px', textDecoration: 'none', fontSize: '11px', fontWeight: 700, textAlign: 'center' }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.emoji}</div>
              <div>{tab.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {dbView === 'home' && (
        <div style={{ padding: '16px 14px 100px' }}>
          <div style={{ fontSize: 13, color: '#2C4A3E', marginBottom: 12, padding: '0 2px' }}>🍵 {isCN ? '按主治功效分类' : '按主治功效分類'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {FORMULA_CATEGORIES.filter(c => c.key !== '').map(cat => (
              <button key={cat.key} onClick={() => { setSelectedCat(cat.key); setDbView('list') }} style={{ backgroundColor: '#FFFEF9', borderRadius: 16, padding: '16px 14px', border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1a2C24' }}>{catLabel(cat)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {dbView === 'list' && (
        <>
          <button onClick={() => setDbView('home')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#2C4A3E', fontWeight: 600 }}>
            ← {isCN ? '返回首页' : '返回首頁'}
          </button>

          {/* Category Pills */}
          <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowCatSidebar(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', borderRadius: '20px', backgroundColor: 'rgba(255,254,249,0.15)', color: '#FFFEF9', border: '1.5px solid rgba(255,254,249,0.25)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ fontSize: '15px' }}>{activeCat.emoji}</span>
              <span>{catLabel(activeCat)}</span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>▾</span>
            </button>
            <div style={{ fontSize: '11px', color: '#2C4A3E', whiteSpace: 'nowrap' }}>
              {loading ? '...' : `${filteredFormulas.length} ${isCN ? '个方剂' : '個方劑'}`}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '12px 14px 100px' }}>
            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A', fontSize: '14px' }}>{isCN ? '载入中...' : '載入中...'}</div>
            ) : filteredFormulas.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{isCN ? '找不到符合的方剂' : '找不到符合的方劑'}</div>
                <div style={{ fontSize: '12px' }}>{isCN ? '试试其他关键字或分类' : '試試其他關鍵字或分類'}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredFormulas.map(f => (
                  <button key={f.id} onClick={() => router.push(`/${locale}/db/${encodeURIComponent(f.name)}`)} style={{ backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC', borderRadius: '16px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', width: '100%', transition: 'all 0.15s ease' }}
                    onMouseEnter={e => { ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2C4A3E'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E4DC'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a2C24', lineHeight: 1.3 }}>{f.name}</div>
                      <div style={{ flexShrink: 0, padding: '3px 10px', borderRadius: '20px', backgroundColor: '#EEEBE3', fontSize: '11px', color: '#2C4A3E', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '2px' }}>{f.categoryLabel}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#8A8A7A', marginBottom: '4px' }}>📚 {isCN ? '出自《' : '出自《'}{f.source}{isCN ? '》' : '》'}</div>
                    <div style={{ fontSize: '13px', color: '#5A5A4A', lineHeight: 1.5 }}>{f.effects?.slice(0, 60)}{f.effects && f.effects.length > 60 ? '...' : ''}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Category Sidebar */}
      {showCatSidebar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowCatSidebar(false)}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '75vw', maxWidth: '320px', backgroundColor: '#FFFEF9', borderRadius: '0 20px 20px 0', padding: '24px 16px', overflowY: 'auto', boxShadow: '4px 0 20px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2C24', margin: 0 }}>{isCN ? '选择功效分类' : '選擇功效分類'}</h2>
              <button onClick={() => setShowCatSidebar(false)} style={{ background: '#E8E4DC', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '12px', color: '#7A7A6A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {FORMULA_CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => { setSelectedCat(cat.key); setShowCatSidebar(false) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, backgroundColor: selectedCat === cat.key ? '#1a3A2C' : '#F0EDE5', color: selectedCat === cat.key ? '#FFFEF9' : '#1a2C24', textAlign: 'left', width: '100%' }}>
                  <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
                  <span style={{ flex: 1 }}>{catLabel(cat)}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>{formulas.filter(f => f.category === cat.key).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalContent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModalContent(null)}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '90vw', maxWidth: '380px', backgroundColor: '#FFFEF9', borderRadius: '20px', padding: '24px 20px 28px', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a2C24', marginBottom: '14px', textAlign: 'center' }}>{modalContent.title}</h2>
            <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'center' }}>{modalContent.body}</div>
            <button onClick={() => setModalContent(null)} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>{isCN ? '关闭' : '關閉'}</button>
          </div>
        </div>
      )}

      {showMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />}
    </div>
  )
}
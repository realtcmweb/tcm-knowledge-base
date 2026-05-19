'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import diseasesData from '@/public/data/diseases.json'
import BottomNav from '@/components/BottomNav'

type Lang = 'tw' | 'cn'
const LANG_KEY = 'tcm_lang'

const L_TW = {
  title: '症狀大全', expert: '專家', popular: '大眾',
  menuBtn: '選單', navHome: '首頁', navAcupuncture: '針灸大全',
  navFormula: '方劑大全', navSymptoms: '症狀大全',
  symptomsCount: (n: number) => `${n} 個疾病`,
  langToggle: '繁體 / 簡體', langCurrent: '繁',
  noRx: '針灸治療方案研究中', noRxDesc: '敬請期待，更多症狀治療數據即將上線',
  sections: { 治法: '治法', 主穴: '主穴', 配穴: '配穴', 方義: '方義', 操作: '操作', 辨證: '辨證分型', 症狀: '常見症狀', 舌脈: '舌脈象', 概述: '概述' },
  menu: {
    login: '👤 登錄 / 註冊', font: '🔤 字體 ±', manual: '📋 使用說明',
    disclaimer: '⚠️ 免責聲明', about: 'ℹ️ 關於本站', contact: '📩 聯絡我們',
  },
  disclaimer: '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。\n\n本站所收錄的中醫藥知識來源於公開文獻整理，編者在編輯過程中已盡可能核實內容準確性，但不保證所有資訊完全正確、及時或完整。讀者依此行事需自行承擔風險。',
  about: '📖 醫道中醫大全是一個開源的中醫藥知識庫，收錄了針灸穴位、經典方劑等中醫藥資料。\n\n🎯 目標：讓中醫藥知識更容易被查詢和學習。\n\n❤️ 製作給所有中醫藥愛好者。',
  contact: '如有問題或建議，歡迎透過以下方式聯絡：\n\n📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base',
  close: '關閉', searchResults: '🔍 搜尋「{q}」的相關症狀',
  内科: '內科', 外科: '外科', 妇科: '婦科', 儿科: '兒科',
  肺系: '肺系', 心系: '心系', 脑系: '腦系', 脾胃系: '脾胃系',
  肝胆系: '肝膽系', 肾系: '腎系', 气血津液: '氣血津液', 肢体经络: '肢體經絡',
  疮疡: '瘡疡', 乳房: '乳房', 皮肤: '皮膚', 肛肠: '肛腸',
  泌尿男性: '泌尿男性', 肿瘤: '腫瘤', 其他: '其他',
  月经: '月經', 带下: '帶下', 妊娠: '妊娠', 产后: '產後',
  新生儿: '新生兒', 肺系病: '肺系', 脾胃病: '脾胃', 传染病: '傳染病', 心肝: '心肝',
  辨證分型: '辨證分型', 中藥方劑: '中藥方劑',
  has_treatment: '有針灸方案', no_treatment: '治療方案研究中',
  loading: '載入中...', overview: '中醫內科學原文',
}

const L_CN = {
  title: '症状大全', expert: '专家', popular: '大众',
  menuBtn: '菜单', navHome: '首页', navAcupuncture: '针灸大全',
  navFormula: '方剂大全', navSymptoms: '症状大全',
  symptomsCount: (n: number) => `${n} 个疾病`,
  langToggle: '繁体 / 简体', langCurrent: '简',
  noRx: '针灸治疗方案研究中', noRxDesc: '敬请期待，更多症状治疗数据即将上线',
  sections: { 治法: '治法', 主穴: '主穴', 配穴: '配穴', 方義: '方义', 操作: '操作', 辨證: '辨证分型', 症狀: '常见症状', 舌脈: '舌脉象', 概述: '概述' },
  menu: {
    login: '👤 登录 / 注册', font: '🔤 字体 ±', manual: '📋 使用说明',
    disclaimer: '⚠️ 免责声明', about: 'ℹ️ 关于本站', contact: '📩 联系我们',
  },
  disclaimer: '本资料库内容仅供学术参考，不作商业用途。有病请寻求合法的医师，非中医师请勿擅自处方服药。\n\n本站所收录的中医药知识来源于公开文献整理，编者已尽可能核实内容准确性，但不保证所有信息完全正确、及时或完整。读者依此行事需自行承担风险。',
  about: '📖 医道中医大全是一个开源的中医药知识库，收录了针灸穴位、经典方剂等中医药资料。\n\n🎯 目标：让中医药知识更容易被查询和学习。\n\n❤️ 制作给所有中医药爱好者。',
  contact: '如有问题或建议，欢迎通过以下方式联络：\n\n📧 请在 GitHub 仓库提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base',
  close: '关闭', searchResults: '🔍 搜索「{q}」的相关疾病',
  内科: '内科', 外科: '外科', 妇科: '妇科', 儿科: '儿科',
  肺系: '肺系', 心系: '心系', 脑系: '脑系', 脾胃系: '脾胃系',
  肝胆系: '肝胆系', 肾系: '肾系', 气血津液: '气血津液', 肢体经络: '肢体经络',
  疮疡: '疮疡', 乳房: '乳房', 皮肤: '皮肤', 肛肠: '肛肠',
  泌尿男性: '泌尿男性', 肿瘤: '肿瘤', 其他: '其他',
  月经: '月经', 带下: '带下', 妊娠: '妊娠', 产后: '产后',
  新生儿: '新生儿', 肺系病: '肺系', 脾胃病: '脾胃', 传染病: '传染病', 心肝: '心肝',
  辨證分型: '辨证分型', 中藥方劑: '中药方剂',
  has_treatment: '有针灸方案', no_treatment: '治疗方案研究中',
  loading: '载入中...', overview: '中医内科学原文',
}

type SpecialtyKey = '內科' | '外科' | '婦科' | '兒科'
type SubKey = string

interface Disease {
  name: string
  synonyms: string[]
  syndromes: string[]
  treatment_available: boolean
}

const SPECIALTY_TABS: Record<Lang, { key: SpecialtyKey; emoji: string; subKeys: SubKey[] }[]> = {
  tw: [
    { key: '內科', emoji: '🧠', subKeys: ['肺系', '心系', '腦系', '脾胃系', '肝膽系', '腎系', '氣血津液', '肢體經絡'] },
    { key: '外科', emoji: '🦴', subKeys: ['瘡疡', '乳房', '皮膚', '肛腸', '泌尿男性', '腫瘤', '其他'] },
    { key: '婦科', emoji: '👩', subKeys: ['月經', '帶下', '妊娠', '產後', '腫瘤', '其他'] },
    { key: '兒科', emoji: '👶', subKeys: ['新生兒', '肺系病', '脾胃病', '傳染病', '心肝'] },
  ],
  cn: [
    { key: '内科', emoji: '🧠', subKeys: ['肺系', '心系', '脑系', '脾胃系', '肝胆系', '肾系', '气血津液', '肢体经络'] },
    { key: '外科', emoji: '🦴', subKeys: ['疮疡', '乳房', '皮肤', '肛肠', '泌尿男性', '肿瘤', '其他'] },
    { key: '妇科', emoji: '👩', subKeys: ['月经', '带下', '妊娠', '产后', '肿瘤', '其他'] },
    { key: '儿科', emoji: '👶', subKeys: ['新生儿', '肺系病', '脾胃病', '传染病', '心肝'] },
  ],
}

export default function SymptomsPage() {
  const [lang, setLang] = useState<Lang>('tw')
  const [showMenu, setShowMenu] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)
  const [mode, setMode] = useState<'expert' | 'popular'>('expert')
  const [symptomView, setSymptomView] = useState<'home' | 'list'>('home')
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyKey>('內科')
  const [selectedSub, setSelectedSub] = useState<SubKey>('肺系')
  const [selectedPart, setSelectedPart] = useState('')
  const [selectedDisease, setSelectedDisease] = useState<{disease: Disease; syndromeData?: any; overview?: string} | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const T = lang === 'tw' ? L_TW : L_CN

  const specialtyTabs = SPECIALTY_TABS[lang]

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null
    if (saved) {
      setLang(saved)
      const tabs = SPECIALTY_TABS[saved]
      setSelectedSpecialty(tabs[0].key)
      setSelectedSub(tabs[0].subKeys[0])
    }
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'tw' ? 'cn' : 'tw'
    setLang(next)
    localStorage.setItem(LANG_KEY, next)
    const tabs = SPECIALTY_TABS[next]
    setSelectedSpecialty(tabs[0].key)
    setSelectedSub(tabs[0].subKeys[0])
  }

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'font') {
      setFontSize(fontSize >= 20 ? 12 : fontSize + 2)
    } else if (action === 'disclaimer') {
      setModalContent({ title: T.menu.disclaimer, body: T.disclaimer })
    } else if (action === 'about') {
      setModalContent({ title: T.menu.about, body: T.about })
    } else if (action === 'contact') {
      setModalContent({ title: T.menu.contact, body: T.contact })
    }
  }

  // Get diseases for current selection
  // Body part -> related disease names mapping
  const partDiseaseMap: Record<string, string[]> = {
    head: ['感冒', '頭痛', '眩暈', '失眠', '不寐', '癲狂', '癇證', '痴呆', '多寐', '郁證'],
    chest: ['咳嗽', '哮病', '喘證', '心悸', '胸痹', '心衰', '感冒', '肺脹', '肺癰', '肺癆'],
    abdomen: ['胃痛', '胃痞', '嘔吐', '呃逆', '腹痛', '泄瀉', '痢疾', '便秘', '脅痛', '鼓脹', '黃疸', '積證', '聚證', '水腫', '淋證', '癃閉'],
    limb: ['腰痛', '痹證', '痙證', '痿證', '顫證', '痙證'],
    skin: ['濕疹', '癬', '疥瘡', '牛皮癬', '帶狀皰疹', '脫髮', '神經性皮炎', '白疕', '扁平疣', '丹毒', '癰', '疔'],
  }

  const currentDiseases = useMemo(() => {
    // If searchQuery is set, filter all diseases
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const all: Disease[] = []
      Object.values(diseasesData.diseases as Record<string, Record<string, Disease[]>>).forEach(sp => {
        Object.values(sp).forEach(sub => { all.push(...sub) })
      })
      return all.filter(d =>
        d.name.includes(q) ||
        d.synonyms.some(s => s.includes(q)) ||
        d.syndromes.some(s => s.includes(q))
      )
    }

    // If selectedPart is set, filter by body part
    if (selectedPart && partDiseaseMap[selectedPart]) {
      const partNames = partDiseaseMap[selectedPart]
      const all: Disease[] = []
      Object.values(diseasesData.diseases as Record<string, Record<string, Disease[]>>).forEach(sp => {
        Object.values(sp).forEach(sub => { all.push(...sub) })
      })
      return all.filter(d => partNames.some(pn => d.name.includes(pn) || d.synonyms.some(s => s.includes(pn))))
    }

    // Otherwise use specialty + sub
    const specialtyMapTW: Record<string, any> = {
      '內科': diseasesData.diseases['內科'] || diseasesData.diseases['内科'],
      '外科': diseasesData.diseases['外科'],
      '婦科': diseasesData.diseases['婦科'],
      '兒科': diseasesData.diseases['兒科'],
    }
    const specialtyMapCN: Record<string, any> = {
      '内科': diseasesData.diseases['內科'] || diseasesData.diseases['内科'],
      '外科': diseasesData.diseases['外科'],
      '妇科': diseasesData.diseases['婦科'],
      '儿科': diseasesData.diseases['兒科'],
    }
    const map = lang === 'cn' ? specialtyMapCN : specialtyMapTW
    const sp = map[selectedSpecialty]
    if (!sp) return []
    const subMap = sp as Record<string, Disease[]>
    let subDiseases = subMap[selectedSub]
    if (!subDiseases && lang === 'cn') {
      const reverseMap: Record<string, string> = {
        '肺系': '肺系', '心系': '心系', '脑系': '腦系', '脾胃系': '脾胃系',
        '肝胆系': '肝膽系', '肾系': '腎系', '气血津液': '氣血津液', '肢体经络': '肢體經絡',
        '疮疡': '瘡疡', '乳房': '乳房', '皮肤': '皮膚', '肛肠': '肛腸',
        '泌尿男性': '泌尿男性', '肿瘤': '腫瘤', '其他': '其他',
        '月经': '月經', '带下': '帶下', '妊娠': '妊娠', '产后': '產後',
        '新生儿': '新生兒', '肺系病': '肺系', '脾胃病': '脾胃', '传染病': '傳染病', '心肝': '心肝',
      }
      const twKey = reverseMap[selectedSub]
      if (twKey) subDiseases = subMap[twKey]
    }
    return subDiseases || []
  }, [selectedSpecialty, selectedSub, lang, searchQuery, selectedPart])

  const handleDiseaseClick = async (disease: Disease) => {
    setSelectedDisease({ disease })
    setLoadingOverview(true)

    // Fetch overview from backend
    try {
      const res = await fetch(`/api/search/diagnosis?q=${encodeURIComponent(disease.name)}`)
      const data = await res.json()
      const overview = data.results?.[0]?.content?.slice(0, 500) || ''
      setSelectedDisease({ disease, overview })
    } catch {
      setSelectedDisease({ disease })
    } finally {
      setLoadingOverview(false)
    }
  }

  const handleSyndromeClick = (syndromeName: string) => {
    const syndromeData = diseasesData.syndromes_map?.[syndromeName]
    if (syndromeData) {
      setSelectedDisease(prev => prev ? { ...prev, syndromeData } : null)
    }
  }

  const navItems = [
    { href: '/acu', label: T.navAcupuncture, emoji: '💉', active: false },
    { href: '/db', label: T.navFormula, emoji: '🍵', active: false },
    { href: '/herbs', label: '中藥大全', emoji: '🌿', active: false },
    { href: '/symptoms', label: T.navSymptoms, emoji: '🩺', active: true },
  ]

  const currentSpecialtyTab = specialtyTabs.find(t => t.key === selectedSpecialty) || specialtyTabs[0]

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F7F5F0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif',
      fontSize: `${fontSize}px`,
    }}>
      {/* Header */}
      <div style={{ background: '#1a3A2C', color: '#FFFEF9', padding: '0 0 18px', borderRadius: '0 0 20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: '50px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
            <span style={{ fontSize: '15px' }}>🏠</span>
            <span>{T.navHome}</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700, letterSpacing: '0.03em' }}>{T.title}</div>



          {/* Menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', color: '#FFFEF9', backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              ☰ <span style={{ fontSize: '11px' }}>{T.menuBtn}</span>
            </button>

            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', backgroundColor: '#FFFEF9', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC' }}>
                <button onClick={() => { toggleLang(); setShowMenu(false) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', color: '#1a2C24', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, width: '100%', borderBottom: '1px solid #F0EDE5' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F2EB')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <span style={{ fontSize: '15px' }}>🌐</span>
                  <span style={{ flex: 1 }}>{T.langToggle}</span>
                  <span style={{ fontSize: '10px', backgroundColor: '#1a3A2C', color: '#FFFEF9', padding: '2px 6px', borderRadius: '8px' }}>{T.langCurrent}</span>
                </button>
                <button onClick={() => { handleMenuAction('font') }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', color: '#1a2C24', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, width: '100%', borderBottom: '1px solid #F0EDE5' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F2EB')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <span style={{ fontSize: '15px' }}>🔤</span>
                  <span style={{ flex: 1 }}>{T.menu.font}</span>
                </button>
                {[
                  { emoji: '📋', label: T.menu.manual },
                  { emoji: '⚠️', label: T.menu.disclaimer, action: 'disclaimer' },
                  { emoji: 'ℹ️', label: T.menu.about, action: 'about' },
                  { emoji: '📩', label: T.menu.contact, action: 'contact' },
                ].map((item, i) => (
                  <a key={i} href="#" onClick={e => { e.preventDefault(); if (item.action) handleMenuAction(item.action) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', color: '#1a2C24', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderBottom: i < 3 ? '1px solid #F0EDE5' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F2EB')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <span style={{ fontSize: '15px' }}>{item.emoji}</span>
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
            <input type="text" placeholder="搜尋症狀、疾病..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '14px', color: '#FFFEF9' }} />
            {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>}
          </div>
        </div>

        {/* 3-Tab Nav */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: '7px' }}>
          {navItems.map(tab => (
            <Link key={tab.label} href={tab.href} style={{ flex: 1, padding: '10px 4px', backgroundColor: tab.active ? '#FFFEF9' : 'rgba(255,254,249,0.12)', color: tab.active ? '#1a3A2C' : 'rgba(255,254,249,0.8)', border: 'none', borderRadius: '12px', textDecoration: 'none', fontSize: '11px', fontWeight: 700, textAlign: 'center' }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.emoji}</div>
              <div>{tab.label}</div>
            </Link>
          ))}
        </div>


      </div>

      {symptomView === 'home' && (
        <div style={{ padding: '16px 14px 100px' }}>
          {/* 身體部位 */}
          <div style={{ fontSize: 12, color: 'rgba(255,254,249,0.65)', marginBottom: 8, padding: '0 2px', letterSpacing: '0.05em' }}>🏠 身體部位（大眾）</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { emoji: '🏠', label: '頭部', desc: '頭痛·眩暈·失眠·脫髮', partKey: 'head' },
              { emoji: '🫁', label: '胸腔', desc: '咳嗽·氣喘·胸悶·心悸', partKey: 'chest' },
              { emoji: '👋', label: '腹部', desc: '胃痛·腹瀉·便祕·嘔吐', partKey: 'abdomen' },
              { emoji: '🦵', label: '四肢', desc: '腰痛·膝痛·關節痛·手腳麻', partKey: 'limb' },
              { emoji: '🔴', label: '皮膚', desc: '濕疹·蕁麻疹·瘙癢·痘痘', partKey: 'skin' },
            ].map(part => (
              <button key={part.partKey} onClick={() => { setSelectedPart(part.partKey); setSymptomView('list') }} style={{ backgroundColor: '#FFFEF9', borderRadius: 16, padding: '16px 14px', border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{part.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1a2C24', marginBottom: 3 }}>{part.label}</div>
                <div style={{ fontSize: 11, color: '#7A7A6A', lineHeight: 1.4 }}>{part.desc}</div>
              </button>
            ))}
          </div>

          {/* 科別系統 */}
          <div style={{ fontSize: 12, color: 'rgba(255,254,249,0.65)', marginBottom: 8, padding: '0 2px', letterSpacing: '0.05em' }}>🧠 科別系統（專家）</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {specialtyTabs.map(sp => (
              <button key={sp.key} onClick={() => { setSelectedSpecialty(sp.key); setSelectedSub(sp.subKeys[0]); setSelectedPart(''); setSymptomView('list') }} style={{ backgroundColor: '#FFFEF9', borderRadius: 16, padding: '16px 14px', border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{sp.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1a2C24', marginBottom: 3 }}>{sp.key}</div>
                <div style={{ fontSize: 11, color: '#7A7A6A' }}>{sp.subKeys.slice(0, 3).join(' · ')}{sp.subKeys.length > 3 ? '...' : ''}</div>
              </button>
            ))}
          </div>

          {/* 常見健康問題 */}
          <div style={{ fontSize: 12, color: 'rgba(255,254,249,0.65)', marginBottom: 8, padding: '0 2px', letterSpacing: '0.05em' }}>⭐ 常見健康問題</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { emoji: '🤧', label: '感冒' },
              { emoji: '💨', label: '咳嗽' },
              { emoji: '😴', label: '失眠' },
              { emoji: '🤕', label: '頭痛' },
              { emoji: '🫃', label: '胃痛' },
              { emoji: '🚽', label: '便祕' },
              { emoji: '🦿', label: '腰痛' },
              { emoji: '🩸', label: '月經' },
            ].map(sym => (
              <button key={sym.label} onClick={() => { setSearchQuery(sym.label); setSymptomView('list') }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC', borderRadius: 20, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: 16 }}>{sym.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1a2C24' }}>{sym.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {symptomView === 'list' && (
      <>
        <button onClick={() => setSymptomView('home')} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '8px 14px 0', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, color: 'rgba(255,254,249,0.65)', fontWeight: 600,
        }}>← 返回首頁</button>

      {/* Specialty + Sub tabs */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {specialtyTabs.map(tab => (
            <button key={tab.key} onClick={() => {
              setSelectedSpecialty(tab.key)
              setSelectedSub(tab.subKeys[0])
              setSelectedPart('')
            }} style={{ flexShrink: 0, padding: '7px 13px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, backgroundColor: selectedSpecialty === tab.key ? '#FFFEF9' : '#E8E4DC', color: selectedSpecialty === tab.key ? '#1a3A2C' : '#4A3A2C', whiteSpace: 'nowrap', border: selectedSpecialty === tab.key ? '1.5px solid transparent' : '1.5px solid #D8D4CC' }}>
              <span style={{ fontSize: '14px', marginRight: '4px' }}>{tab.emoji}</span>{tab.key}
            </button>
          ))}
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{ padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '4px' }}>
          {currentSpecialtyTab.subKeys.map(sub => (
            <button key={sub} onClick={() => setSelectedSub(sub)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, backgroundColor: selectedSub === sub ? '#1a3A2C' : '#FFFEF9', color: selectedSub === sub ? '#FFFEF9' : '#5A5A4A', whiteSpace: 'nowrap', boxShadow: selectedSub === sub ? '0 1px 4px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.06)' }}>
              {sub}
            </button>
          ))}
        </div>
      </div>



      {/* Content */}
      <div style={{ padding: '14px 14px 100px' }}>
        <div style={{ fontSize: '12px', color: '#7A7A6A', marginBottom: '12px' }}>
          {T.symptomsCount(currentDiseases.length)}{selectedPart ? ` · ${selectedPart === 'head' ? '頭部' : selectedPart === 'chest' ? '胸腔' : selectedPart === 'abdomen' ? '腹部' : selectedPart === 'limb' ? '四肢' : '皮膚'}` : ` · ${selectedSpecialty} · ${selectedSub}`}
        </div>
        {currentDiseases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8A8A7A' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '14px' }}>{T.loading}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentDiseases.map((disease, i) => (
              <button key={i} onClick={() => handleDiseaseClick(disease)} style={{ backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC', borderRadius: '14px', padding: '13px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24' }}>{disease.name}</div>
                      <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '8px', backgroundColor: disease.treatment_available ? '#EEF4F0' : '#F0EDE5', color: disease.treatment_available ? '#2C4A3E' : '#8A8A7A', fontWeight: 700 }}>
                        {disease.treatment_available ? '💉' : '📖'}
                      </span>
                    </div>
                    {disease.synonyms.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#8A8A7A', marginBottom: '5px', lineHeight: 1.4 }}>
                        {disease.synonyms.slice(0, 4).join('、')}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {disease.syndromes.slice(0, 3).map((s, si) => (
                        <span key={si} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', backgroundColor: '#F7F5F0', color: '#5A5A4A', border: '1px solid #E8E4DC', fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                      {disease.syndromes.length > 3 && (
                        <span style={{ fontSize: '10px', color: '#8A8A7A', fontWeight: 600, alignSelf: 'center' }}>
                          +{disease.syndromes.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: '#8A8A7A', fontSize: '16px', marginLeft: '8px', flexShrink: 0 }}>›</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Bottom Sheet */}
      {selectedDisease && (
        <>
          <div onClick={() => setSelectedDisease(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, backgroundColor: '#FFFEF9', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 -8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'sticky', top: 0, backgroundColor: '#FFFEF9', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a2C24', marginBottom: '4px' }}>{selectedDisease.disease.name}</div>
                <div style={{ fontSize: '11px', color: selectedDisease.disease.treatment_available ? '#2C4A3E' : '#8A8A7A', fontWeight: 700 }}>
                  {selectedDisease.disease.treatment_available ? T.has_treatment : T.no_treatment}
                </div>
              </div>
              <button onClick={() => setSelectedDisease(null)} style={{ background: '#E8E4DC', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', color: '#7A7A6A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Synonyms */}
            {selectedDisease.disease.synonyms.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#8A8A7A', marginBottom: '5px', fontWeight: 600 }}>別名</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {selectedDisease.disease.synonyms.map((syn, i) => (
                    <span key={i} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#F0EDE5', color: '#5A5A4A', fontWeight: 600 }}>{syn}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview from backend */}
            {loadingOverview ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#8A8A7A', fontSize: '13px' }}>{T.loading}</div>
            ) : selectedDisease.overview ? (
              <div style={{ backgroundColor: '#F7F5F0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#5A8A6A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{T.overview}</div>
                <div style={{ fontSize: '12px', color: '#3A3A2A', lineHeight: 1.8 }}>{selectedDisease.overview}</div>
              </div>
            ) : null}

            {/* Syndrome pills + detail */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#5A8A6A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{T.辨證分型}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedDisease.disease.syndromes.map((s, i) => {
                  const hasData = !!diseasesData.syndromes_map?.[s]
                  return (
                    <button key={i} onClick={() => hasData && handleSyndromeClick(s)} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '14px', border: hasData ? '1.5px solid #C8D8CC' : '1.5px solid #D8D4CC', cursor: hasData ? 'pointer' : 'default', fontWeight: 700, backgroundColor: hasData ? '#EEF4F0' : '#F0EDE5', color: hasData ? '#2C4A3E' : '#8A8A7A' }}>
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Syndrome detail */}
            {selectedDisease.syndromeData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedDisease.syndromeData.symptoms?.length > 0 && (
                  <div style={{ backgroundColor: '#EEF4F0', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2C4A3E', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{T.sections.症狀}</div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {selectedDisease.syndromeData.symptoms.map((s: string, i: number) => (
                        <span key={i} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '10px', backgroundColor: '#FFFEF9', color: '#3A5A4A', fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedDisease.syndromeData.tongueSigns?.length > 0 && (
                  <div style={{ backgroundColor: '#F7F5F0', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A5A3A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{T.sections.舌脈}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#3A3A2A', fontWeight: 600 }}>👅 {selectedDisease.syndromeData.tongueSigns.join('、')}</span>
                      <span style={{ fontSize: '12px', color: '#3A3A2A', fontWeight: 600 }}>💓 {selectedDisease.syndromeData.pulseTypes?.join('、')}</span>
                    </div>
                  </div>
                )}
                {selectedDisease.syndromeData.zhifa && (
                  <div style={{ backgroundColor: '#E8F0F8', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2A4A6A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{T.sections.治法}</div>
                    <div style={{ fontSize: '13px', color: '#1a2C24', fontWeight: 600, lineHeight: 1.5 }}>{selectedDisease.syndromeData.zhifa}</div>
                  </div>
                )}
                {selectedDisease.syndromeData.main_points && (
                  <div style={{ backgroundColor: '#EEF4F0', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2C4A3E', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{T.sections.主穴}</div>
                    <div style={{ fontSize: '14px', color: '#1a2C24', fontWeight: 700, lineHeight: 1.5 }}>{selectedDisease.syndromeData.main_points}</div>
                  </div>
                )}
              </div>
            )}

            {/* TCM Formula Link */}
            <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: '#F3EEF7', borderRadius: '12px' }}>
              <Link href="/db" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: '#6A4A8A' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>🍵 {T.中藥方劑}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>查看經典方劑大全</div>
                </div>
                <span style={{ fontSize: '16px' }}>›</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {modalContent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModalContent(null)}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '90vw', maxWidth: '380px', backgroundColor: '#FFFEF9', borderRadius: '20px', padding: '24px 20px 28px', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a2C24', marginBottom: '14px', textAlign: 'center' }}>{modalContent.title}</h2>
            <div style={{ fontSize: '13px', color: '#3A3A2A', lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'center' }}>{modalContent.body}</div>
            <button onClick={() => setModalContent(null)} style={{ display: 'block', width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>{T.close}</button>
          </div>
        </div>
      )}

      {showMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />}
    <BottomNav />
    </div>
  )
}
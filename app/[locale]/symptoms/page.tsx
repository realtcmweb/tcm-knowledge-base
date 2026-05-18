'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

// === 專家模式：依照針灸治療學分類 ===
const EXPERT_CATEGORIES = [
  { key: '內科', label: '內科', emoji: '🧠', count: 21, symptoms: [
    { name: '感冒', desc: '风寒/风热感冒，恶寒发热' },
    { name: '咳嗽', desc: '外感咳嗽、内伤咳嗽' },
    { name: '哮喘', desc: '支气管哮喘、过敏性哮喘' },
    { name: '胃痛', desc: '胃炎、胃潰疡、消化不良' },
    { name: '呕吐', desc: '胃气上逆、脾胃虚弱' },
    { name: '呃逆', desc: '打嗝、膈肌痉挛' },
    { name: '腹痛', desc: '腹部不适、肠痉挛' },
    { name: '腹泻', desc: '急慢性腹泻、肠炎' },
    { name: '便秘', desc: '排便困难、肠道功能紊乱' },
    { name: '不寐', desc: '失眠、多梦、易醒' },
    { name: '心悸', desc: '心慌、心律不齐' },
    { name: '眩晕', desc: '头晕、血压异常' },
    { name: '头痛', desc: '偏头痛、紧张性头痛' },
    { name: '郁证', desc: '抑郁、焦虑、情绪问题' },
    { name: '癫病', desc: '癫痫发作、神志异常' },
    { name: '狂病', desc: '精神躁狂、神志失常' },
    { name: '痫病', desc: '癫痫抽搐、口吐白沫' },
    { name: '痴呆', desc: '认知障碍、老年痴呆' },
    { name: '嗜睡', desc: '过度困倦、精神不振' },
    { name: '消渴', desc: '糖尿病、多饮多尿' },
    { name: '阳强', desc: '阴茎异常勃起' },
  ]},
  { key: '骨傷科', label: '骨傷科', emoji: '🦴', count: 12, symptoms: [
    { name: '腰痛', desc: '腰肌劳损、腰椎间盘突出' },
    { name: '坐骨神经痛', desc: '下肢放射性疼痛' },
    { name: '肩周炎', desc: '五十肩、肩关节活动受限' },
    { name: '膝痛', desc: '膝关节炎、韧带损伤' },
    { name: '踝扭伤', desc: '急性踝关节扭伤' },
    { name: '颈椎病', desc: '颈椎骨质增生、脖子僵硬' },
    { name: '痹病', desc: '关节疼痛、类风湿关节炎' },
    { name: '面瘫', desc: '面神经麻痹、口眼歪斜' },
    { name: '面痛', desc: '三叉神经痛、面部抽搐' },
    { name: '手腕痛', desc: '网球肘、腕管综合征' },
    { name: '落枕', desc: '颈项强直、睡姿不良' },
    { name: '急性腰扭伤', desc: '腰骶部急性损伤' },
  ]},
  { key: '皮外', label: '皮外科', emoji: '🦠', count: 9, symptoms: [
    { name: '斑秃', desc: '脱发、斑片状脱发' },
    { name: '神经性皮炎', desc: '慢性瘙痒性皮肤病' },
    { name: '扁平疣', desc: '病毒性疣状增生' },
    { name: '疖疮', desc: '毛囊炎、疖肿' },
    { name: '丹毒', desc: '链球菌感染、皮肤红肿' },
    { name: '痔疮', desc: '内外痔、肛门疾患' },
    { name: '湿疹', desc: '过敏性皮肤炎' },
    { name: '带状疱疹', desc: '蛇串疮、神经痛' },
    { name: '脱肛', desc: '直肠脱出' },
  ]},
  { key: '五官科', label: '五官科', emoji: '👁️', count: 14, symptoms: [
    { name: '目赤肿痛', desc: '结膜炎、眼睛红肿' },
    { name: '麦粒肿', desc: '睑腺炎、眼睑脓肿' },
    { name: '眼睑下垂', desc: '重症肌无力眼型' },
    { name: '鼻炎', desc: '過敏性鼻炎、鼻塞' },
    { name: '鼻衄', desc: '鼻出血' },
    { name: '咽喉肿痛', desc: '急性扁桃体炎、咽炎' },
    { name: '牙痛', desc: '龋齿、牙髓炎' },
    { name: '口疮', desc: '口腔溃疡、鹅口疮' },
    { name: '耳鸣耳聋', desc: '神经性耳鸣、听力减退' },
    { name: '肥胖', desc: '单纯性肥胖、代谢综合征' },
    { name: '阳痿', desc: '勃起功能障碍' },
    { name: '早泄', desc: '射精过早' },
    { name: '阳强', desc: '阴茎异常勃起' },
    { name: '眩暈（五官）', desc: '梅尼埃病、前庭功能紊亂' },
  ]},
  { key: '急症', label: '急症', emoji: '🚨', count: 7, symptoms: [
    { name: '晕厥', desc: '短暂意识丧失' },
    { name: '虚脱', desc: '循环衰竭、血压下降' },
    { name: '高热', desc: '高烧不退，体温过高' },
    { name: '抽搐', desc: '癫痫大发作、破伤风' },
    { name: '内脏绞痛', desc: '心绞痛、胆绞痛、肾绞痛' },
    { name: '出血', desc: '吐血、咯血、便血、尿血' },
    { name: '溺水', desc: '窒息急救' },
  ]},
]

// === 大眾模式 ===
const POPULAR_CATEGORIES = [
  { key: '身體部位', label: '身體部位', emoji: '🧍', children: [
    { name: '頭部', desc: '頭痛、眩暈、失眠、耳鳴' },
    { name: '胸背部', desc: '咳嗽、哮喘、胸悶、心悸' },
    { name: '腹部', desc: '胃痛、腹瀉、便祕、嘔吐' },
    { name: '腰腿', desc: '腰痛、坐骨神經痛、膝痛' },
    { name: '四肢', desc: '肩周炎、踝扭傷、手腕痛' },
  ]},
  { key: '常見症狀', label: '常見症狀', emoji: '🏥', children: [
    { name: '感冒咳嗽', desc: '發燒、咳嗽、鼻塞、流涕' },
    { name: '失眠問題', desc: '失眠、多夢、易醒、嗜睡' },
    { name: '腸胃不適', desc: '胃痛、嘔吐、腹瀉、便祕' },
    { name: '疼痛問題', desc: '頭痛、腰痛、關節痛、神經痛' },
    { name: '情緒問題', desc: '郁證、眩暈、記憶力減退' },
  ]},
  { key: '人生階段', label: '人生階段', emoji: '👶', children: [
    { name: '兒科', desc: '發燒、驚風、疳積、遺尿' },
    { name: '婦科', desc: '月經問題、痛經、不孕' },
    { name: '產科', desc: '妊娠反應、胎位不正、產後' },
    { name: '老年', desc: '腰腿痛、痴呆、視力退化' },
  ]},
]

const POPULAR_QUICK = [
  { name: '感冒咳嗽', emoji: '😷' },
  { name: '失眠', emoji: '😴' },
  { name: '胃痛', emoji: '🤢' },
  { name: '腰痛', emoji: '💪' },
  { name: '月經', emoji: '🩸' },
]

const MENU_ITEMS = [
  { label: '👤 登錄 / 註冊', href: '#', action: 'login' },
  { label: '🔤 字體 ±', href: '#', action: 'font' },
  { label: '📋 使用說明', href: '#' },
  { label: '⚠️ 免責聲明', href: '#', action: 'disclaimer' },
  { label: 'ℹ️ 關於本站', href: '#', action: 'about' },
  { label: '📩 聯絡我們', href: '#', action: 'contact' },
]

interface Prescription {
  name: string
  page: number
  main: string
  paired: Record<string, string> | null
  zhifa: string
  fangyi: string | null
  caozuo: string | null
}

export default function SymptomsPage() {
  const [showMenu, setShowMenu] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)
  const [mode, setMode] = useState<'expert' | 'popular'>('expert')
  const [selectedExpertCat, setSelectedExpertCat] = useState('內科')
  const [selectedPopularCat, setSelectedPopularCat] = useState('身體部位')
  const [expandedQuick, setExpandedQuick] = useState<string | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [selectedSymptom, setSelectedSymptom] = useState<{name: string; desc: string; prescription?: Prescription} | null>(null)

  useEffect(() => {
    fetch('/data/symptom_prescriptions.json').then(r => r.json()).then((data: Prescription[]) => {
      setPrescriptions(data)
    })
  }, [])

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'font') {
      setFontSize(fontSize >= 20 ? 12 : fontSize + 2)
    } else if (action === 'disclaimer') {
      setModalContent({ title: '⚠️ 免責聲明', body: '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。\n\n本站所收錄的中醫藥知識來源於公開文獻整理，編者在編輯過程中已盡可能核實內容準確性，但不保證所有資訊完全正確、及時或完整。讀者依此行事需自行承擔風險。' })
    } else if (action === 'about') {
      setModalContent({ title: 'ℹ️ 關於本站', body: '📖 醫道中醫大全是一個開源的中醫藥知識庫，收錄了針灸穴位、經典方劑等中醫藥資料。\n\n🎯 目標：讓中醫藥知識更容易被查詢和學習。\n\n📊 目前收錄：\n• 374 個針灸穴位（WHO 國際標準）\n• 205 首經典方劑\n• 更多內容持續更新中\n\n❤️ 製作給所有中醫藥愛好者。' })
    } else if (action === 'contact') {
      setModalContent({ title: '📩 聯絡我們', body: '如有問題或建議，歡迎透過以下方式聯絡：\n\n📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base\n\n我們會盡快回覆您。' })
    }
  }

  const activeExpert = EXPERT_CATEGORIES.find(c => c.key === selectedExpertCat) || EXPERT_CATEGORIES[0]
  const activePopularCat = POPULAR_CATEGORIES.find(c => c.key === selectedPopularCat) || POPULAR_CATEGORIES[0]

  const getPrescription = (symptomName: string) => {
    return prescriptions.find(p => p.name === symptomName)
  }

  const handleSymptomClick = (symptom: { name: string; desc: string }) => {
    const rx = getPrescription(symptom.name)
    setSelectedSymptom({ ...symptom, prescription: rx })
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F7F5F0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif',
      fontSize: `${fontSize}px`,
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
            症狀大全
          </div>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
            <button
              onClick={() => setMode('expert')}
              style={{
                padding: '5px 10px', borderRadius: '14px', border: 'none',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                backgroundColor: mode === 'expert' ? '#FFFEF9' : '#E8E4DC',
                color: mode === 'expert' ? '#1a3A2C' : '#4A3A2C',
                border: mode === 'expert' ? '1.5px solid transparent' : '1.5px solid #D8D4CC',
              }}
            >專家</button>
            <button
              onClick={() => setMode('popular')}
              style={{
                padding: '5px 10px', borderRadius: '14px', border: 'none',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                backgroundColor: mode === 'popular' ? '#FFFEF9' : '#E8E4DC',
                color: mode === 'popular' ? '#1a3A2C' : '#4A3A2C',
                border: mode === 'popular' ? '1.5px solid transparent' : '1.5px solid #D8D4CC',
              }}
            >大眾</button>
          </div>

          {/* Menu */}
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

        {/* 3-Tab */}
        <div style={{ display: 'flex', padding: '12px 14px 0', gap: '7px' }}>
          {[
            { href: '/acu', label: '針灸大全', emoji: '💉', active: false },
            { href: '/db', label: '方劑大全', emoji: '🍵', active: false },
            { href: '/symptoms', label: '症狀大全', emoji: '🩺', active: true },
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
      </div>

      {/* Category Pills */}
      {mode === 'popular' && (
        <>
          <div style={{ padding: '14px 14px 0' }}>
            <div style={{ display: 'flex', gap: '7px', overflowX: 'auto', paddingBottom: '4px' }}>
              {POPULAR_QUICK.map(q => (
                <button
                  key={q.name}
                  onClick={() => setExpandedQuick(expandedQuick === q.name ? null : q.name)}
                  style={{
                    flexShrink: 0, padding: '8px 14px',
                    borderRadius: '20px', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 700,
                    backgroundColor: expandedQuick === q.name ? '#1a3A2C' : '#FFFEF9',
                    color: expandedQuick === q.name ? '#FFFEF9' : '#1a3A2C',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ marginRight: '5px' }}>{q.emoji}</span>
                  {q.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '10px 14px 0' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {POPULAR_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedPopularCat(cat.key)}
                  style={{
                    flexShrink: 0, padding: '7px 13px',
                    borderRadius: '20px', border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 700,
                    backgroundColor: selectedPopularCat === cat.key ? '#FFFEF9' : '#E8E4DC',
                    color: selectedPopularCat === cat.key ? '#1a3A2C' : '#4A3A2C',
                    whiteSpace: 'nowrap',
                    border: selectedPopularCat === cat.key ? '1.5px solid transparent' : '1.5px solid #D8D4CC',
                  }}
                >
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {mode === 'expert' && (
        <div style={{ padding: '12px 14px 0' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {EXPERT_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedExpertCat(cat.key)}
                style={{
                  flexShrink: 0, padding: '7px 13px',
                  borderRadius: '20px', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 700,
                  backgroundColor: selectedExpertCat === cat.key ? '#FFFEF9' : '#E8E4DC',
                  color: selectedExpertCat === cat.key ? '#1a3A2C' : '#4A3A2C',
                  whiteSpace: 'nowrap',
                  border: selectedExpertCat === cat.key ? '1.5px solid transparent' : '1.5px solid #D8D4CC',
                }}
              >
                <span style={{ fontSize: '14px', marginRight: '4px' }}>{cat.emoji}</span>
                {cat.label}
                <span style={{ marginLeft: '4px', opacity: 0.7 }}>({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '14px 14px 100px' }}>
        {mode === 'expert' && (
          <>
            <div style={{ fontSize: '12px', color: '#7A7A6A', marginBottom: '12px' }}>
              {activeExpert.count} 個症狀
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeExpert.symptoms.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSymptomClick(s)}
                  style={{
                    backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC',
                    borderRadius: '14px', padding: '13px 16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', width: '100%',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24', marginBottom: '3px' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: '#8A8A7A' }}>{s.desc}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getPrescription(s.name) && (
                        <span style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                          backgroundColor: '#EEF4F0', color: '#2C4A3E', fontWeight: 700,
                        }}>針灸</span>
                      )}
                      <span style={{ color: '#8A8A7A', fontSize: '14px' }}>›</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'popular' && (
          <>
            {expandedQuick && (
              <div style={{
                backgroundColor: '#EEF4F0', border: '1.5px solid #D8E4DC',
                borderRadius: '14px', padding: '14px 16px', marginBottom: '14px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a3A2C', marginBottom: '10px' }}>
                  🔍 搜尋「{expandedQuick}」的相關症狀
                </div>
                {prescriptions
                  .filter(p => p.name.includes(expandedQuick) || (p.paired && JSON.stringify(p.paired).includes(expandedQuick)))
                  .map(p => (
                    <button
                      key={p.name}
                      onClick={() => setSelectedSymptom({ name: p.name, desc: '', prescription: p })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 0', borderBottom: '1px solid #D8E4DC', width: '100%',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>💉</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2C24' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#5A8A6A' }}>主穴 {p.main.slice(0, 15)}...</div>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#7A7A6A', marginBottom: '12px' }}>
              {activePopularCat.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activePopularCat.children.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const match = prescriptions.find(p => p.name.includes(c.name) || c.name.includes(p.name))
                    if (match) {
                      setSelectedSymptom({ name: match.name, desc: c.desc, prescription: match })
                    }
                  }}
                  style={{
                    backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC',
                    borderRadius: '14px', padding: '13px 16px',
                    cursor: 'pointer', textAlign: 'left',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', width: '100%',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24', marginBottom: '3px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>{c.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Symptom Detail Bottom Sheet */}
      {selectedSymptom && (
        <>
          <div
            onClick={() => setSelectedSymptom(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
            backgroundColor: '#FFFEF9', borderRadius: '20px 20px 0 0',
            padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
          }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a2C24', marginBottom: '4px' }}>
                  {selectedSymptom.name}
                </div>
                {selectedSymptom.desc && (
                  <div style={{ fontSize: '12px', color: '#8A8A7A' }}>{selectedSymptom.desc}</div>
                )}
              </div>
              <button
                onClick={() => setSelectedSymptom(null)}
                style={{
                  background: '#E8E4DC', border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px', cursor: 'pointer',
                  fontSize: '14px', color: '#7A7A6A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Treatment Data */}
            {selectedSymptom.prescription ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 治法 */}
                {selectedSymptom.prescription.zhifa && (
                  <div style={{ backgroundColor: '#F7F5F0', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#5A8A6A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>治法</div>
                    <div style={{ fontSize: '13px', color: '#1a2C24', lineHeight: 1.5 }}>{selectedSymptom.prescription.zhifa}</div>
                  </div>
                )}

                {/* 主穴 */}
                <div style={{ backgroundColor: '#EEF4F0', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2C4A3E', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>主穴</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a2C24', lineHeight: 1.5 }}>
                    {selectedSymptom.prescription.main.split(/(?=[A-Z\u4e00-\u9fa5])/).join('、')}
                  </div>
                </div>

                {/* 配穴 */}
                {selectedSymptom.prescription.paired && Object.keys(selectedSymptom.prescription.paired).length > 0 && (
                  <div style={{ backgroundColor: '#FDF3E7', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A5A3A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>配穴</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {Object.entries(selectedSymptom.prescription.paired).filter(([k]) => k).map(([condition, points]) => (
                        <div key={condition} style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#8A5A3A', minWidth: '60px' }}>{condition}</span>
                          <span style={{ fontSize: '13px', color: '#1a2C24', fontWeight: 600 }}>→ {points.split(',').join('、')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 方義 */}
                {selectedSymptom.prescription.fangyi && (
                  <div style={{ backgroundColor: '#F3EEF7', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6A4A8A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>方義</div>
                    <div style={{ fontSize: '12px', color: '#3A3A2A', lineHeight: 1.6 }}>{selectedSymptom.prescription.fangyi}</div>
                  </div>
                )}

                {/* 操作 */}
                {selectedSymptom.prescription.caozuo && (
                  <div style={{ backgroundColor: '#F0F4E0', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#5A6A1A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>操作</div>
                    <div style={{ fontSize: '12px', color: '#3A3A2A', lineHeight: 1.5 }}>{selectedSymptom.prescription.caozuo}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#8A8A7A' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔬</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#5A5A4A', marginBottom: '4px' }}>針灸治療方案研究中</div>
                <div style={{ fontSize: '12px' }}>敬請期待，更多症狀治療數據即將上線</div>
              </div>
            )}
          </div>
        </>
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
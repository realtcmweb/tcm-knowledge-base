'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const SYMPTOM_CATEGORIES = [
  { key: '內科', label: '內科', emoji: '🧠', count: 21, symptoms: [
    { name: '感冒', desc: '風寒/風熱感冒，惡寒發熱' },
    { name: '咳嗽', desc: '外感咳嗽、內傷咳嗽' },
    { name: '哮喘', desc: '支氣管哮喘、過敏性哮喘' },
    { name: '胃痛', desc: '胃炎、胃潰瘍、消化不良' },
    { name: '嘔吐', desc: '胃氣上逆、脾胃虛弱' },
    { name: '呃逆', desc: '打嗝、膈肌痙攣' },
    { name: '腹痛', desc: '腹部不適、腸痙攣' },
    { name: '腹瀉', desc: '急慢性腹瀉、腸炎' },
    { name: '便祕', desc: '排便困難、腸道功能紊亂' },
    { name: '不寐', desc: '失眠、多夢、易醒' },
    { name: '心悸', desc: '心慌、心律不整' },
    { name: '眩暈', desc: '頭暈、血壓異常' },
    { name: '頭痛', desc: '偏頭痛、緊張性頭痛' },
    { name: '郁證', desc: '抑鬱、焦慮、情緒問題' },
    { name: '癲病', desc: '癲癇發作、神志異常' },
    { name: '狂病', desc: '精神躁狂、神志失常' },
    { name: '癇病', desc: '癲癇抽搐、口吐白沫' },
    { name: '痴呆', desc: '認知障礙、老年癡呆' },
    { name: '嗜睡', desc: '過度睏倦、精神不振' },
    { name: '消渴', desc: '糖尿病、多飲多尿' },
    { name: '陽強', desc: '陰莖異常勃起' },
  ]},
  { key: '皮外科', label: '皮外科', emoji: '🦠', count: 15, symptoms: [
    { name: '痹病', desc: '關節疼痛、類風濕關節炎' },
    { name: '腰痛', desc: '腰肌勞損、腰椎間盤突出' },
    { name: '坐骨神經痛', desc: '下肢放射性疼痛' },
    { name: '肩周炎', desc: '五十肩、肩關節活動受限' },
    { name: '膝痛', desc: '膝關節炎、韌帶損傷' },
    { name: '踝扭傷', desc: '急性踝關節扭傷' },
    { name: '颈椎病', desc: '頸椎骨質增生、脖子僵硬' },
    { name: '面癱', desc: '面神經麻痺、口眼歪斜' },
    { name: '面痛', desc: '三叉神經痛、面部抽搐' },
    { name: '斑禿', desc: '脫髮、斑片狀脫髮' },
    { name: '神經性皮炎', desc: '慢性瘙癢性皮膚病' },
    { name: '扁平疣', desc: '病毒性疣狀增生' },
    { name: '癤瘡', desc: '毛囊炎、癤腫' },
    { name: '丹毒', desc: '鏈球菌感染、皮膚紅腫' },
    { name: '痔瘡', desc: '內外痔、肛門疾患' },
  ]},
  { key: '婦儿科', label: '婦儿科', emoji: '🤱', count: 17, symptoms: [
    { name: '月經不調', desc: '周期紊亂、經量異常' },
    { name: '痛經', desc: '經期腹痛、子宮內膜異位' },
    { name: '經閉', desc: '閉經、月經停止' },
    { name: '崩漏', desc: '功能性子宮出血' },
    { name: '經前期緊張综合征', desc: '經前情緒/身體症狀' },
    { name: '绝经前后诸症', desc: '更年期綜合徵' },
    { name: '妊娠恶阻', desc: '孕吐、妊娠反應' },
    { name: '胎位不正', desc: '胎兒臀位、横位' },
    { name: '難產', desc: '宮縮乏力、胎位異常' },
    { name: '恶露不尽', desc: '產後惡露持續' },
    { name: '缺乳', desc: '產後乳汁分泌不足' },
    { name: '陰挺', desc: '子宫脫垂、陰道壁脫垂' },
    { name: '陰癢', desc: '外陰瘙癢、陰道炎' },
    { name: '不孕症', desc: '原發/繼發性不孕' },
    { name: '小兒驚風', desc: '小兒高熱驚厥' },
    { name: '小兒疳積', desc: '營養不良、脾胃虛弱' },
    { name: '小兒遺尿', desc: '兒童尿床' },
  ]},
  { key: '五官科', label: '五官科', emoji: '👁️', count: 14, symptoms: [
    { name: '目赤腫痛', desc: '結膜炎、眼睛紅腫' },
    { name: '麥粒腫', desc: '瞼腺炎、眼瞼膿腫' },
    { name: '眼瞼下垂', desc: '重症肌無力眼型' },
    { name: '鼻炎', desc: '過敏性鼻炎、鼻塞' },
    { name: '鼻衄', desc: '鼻出血' },
    { name: '咽喉腫痛', desc: '急性扁桃體炎、咽炎' },
    { name: '牙痛', desc: '齲齒、牙髓炎' },
    { name: '口瘡', desc: '口腔潰瘍、鵝口瘡' },
    { name: '耳鳴耳聾', desc: '神經性耳鳴、聽力減退' },
    { name: '眩暈（五官）', desc: '梅尼埃病、前庭功能紊亂' },
    { name: '肥胖', desc: '單純性肥胖、代謝綜合徵' },
    { name: '陽痿', desc: '勃起功能障礙' },
    { name: '早泄', desc: '射精過早' },
    { name: '陽強', desc: '陰莖異常勃起' },
  ]},
  { key: '急症', label: '急症', emoji: '🚨', count: 7, symptoms: [
    { name: '暈厥', desc: '短暫意識喪失' },
    { name: '虛脫', desc: '循環衰竭、血壓下降' },
    { name: '高熱', desc: '高燒不退、體溫過高' },
    { name: '抽搐', desc: '癲癇大发作、破傷風' },
    { name: '內臟絞痛', desc: '心絞痛、膽絞痛、腎絞痛' },
    { name: '出血', desc: '吐血、咯血、便血、尿血' },
    { name: '溺水', desc: '窒息急救' },
  ]},
]

const MENU_ITEMS = [
  { label: '👤 登錄 / 註冊', href: '#', action: 'login' },
  { label: '🔤 字體 ±', href: '#', action: 'font' },
  { label: '📋 使用說明', href: '#' },
  { label: '⚠️ 免責聲明', href: '#', action: 'disclaimer' },
  { label: 'ℹ️ 關於本站', href: '#', action: 'about' },
  { label: '📩 聯絡我們', href: '#', action: 'contact' },
]

export default function SymptomsPage() {
  const [showMenu, setShowMenu] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [selectedCat, setSelectedCat] = useState('內科')
  const [modalContent, setModalContent] = useState<{title: string; body: string} | null>(null)

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    if (action === 'disclaimer') {
      setModalContent({ title: '⚠️ 免責聲明', body: '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的醫師，非中醫師請勿擅自處方服藥。\n\n本站所收錄的中醫藥知識來源於公開文獻整理，編者在編輯過程中已盡可能核實內容準確性，但不保證所有資訊完全正確、及時或完整。讀者依此行事需自行承擔風險。' })
    } else if (action === 'about') {
      setModalContent({ title: 'ℹ️ 關於本站', body: '📖 醫道中醫大全是一個開源的中醫藥知識庫，收錄了針灸穴位、經典方劑等中醫藥資料。\n\n🎯 目標：讓中醫藥知識更容易被查詢和學習。\n\n📊 目前收錄：\n• 374 個針灸穴位（WHO 國際標準）\n• 205 首經典方劑\n• 更多內容持續更新中\n\n❤️ 製作給所有中醫藥愛好者。' })
    } else if (action === 'font') {
      setFontSize(fontSize >= 20 ? 12 : fontSize + 2)
    } else if (action === 'contact') {
      setModalContent({ title: '📩 聯絡我們', body: '如有問題或建議，歡迎透過以下方式聯絡：\n\n📧 請在 GitHub 倉庫提交 Issue\n🔗 github.com/realtcmweb/tcm-knowledge-base\n\n我們會盡快回覆您。' })
    }
  }

  const activeCat = SYMPTOM_CATEGORIES.find(c => c.key === selectedCat) || SYMPTOM_CATEGORIES[0]

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
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {SYMPTOM_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCat(cat.key)}
              style={{
                flexShrink: 0, padding: '7px 13px',
                borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 700,
                backgroundColor: selectedCat === cat.key ? '#FFFEF9' : 'rgba(255,254,249,0.15)',
                color: selectedCat === cat.key ? '#1a3A2C' : 'rgba(255,254,249,0.75)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '14px', marginRight: '4px' }}>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 14px 100px' }}>
        {activeCat && (
          <>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', color: 'rgba(255,254,249,0.65)' }}>
                {activeCat.count} 個症狀
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeCat.symptoms.map((s, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#FFFEF9', border: '1.5px solid #E8E4DC',
                    borderRadius: '14px', padding: '13px 16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24', marginBottom: '4px' }}>
                    {s.name}
                  </div>
                  {s.desc && (
                    <div style={{ fontSize: '11px', color: '#8A8A7A', lineHeight: 1.5 }}>
                      {s.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

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

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SharedHeader from '@/components/SharedHeader'

interface Module {
  key: string
  emoji: string
  title: string
  titleCn: string
  desc: string
  descCn: string
  href: string | null
  status: 'ready' | 'coming'
  tags: string[]
}

const MODULES: Module[] = [
  {
    key: 'acupoint-stories',
    emoji: '📖',
    title: '穴位故事',
    titleCn: '穴位故事',
    desc: 'WHO 標準穴位，含定位、主治、養生小知識',
    descCn: 'WHO 标准穴位，含定位、主治、养生小知识',
    href: '/acu',
    status: 'ready',
    tags: ['374 穴位', 'WHO', '繁簡'],
  },
  {
    key: 'meridian-game',
    emoji: '🎯',
    title: '配穴練習',
    titleCn: '配穴练习',
    desc: '症狀 → 穴位配伍挑戰',
    descCn: '症状 → 穴位配伍挑战',
    href: null,
    status: 'coming',
    tags: ['配穴', '闖關'],
  },
  {
    key: 'formula-match',
    emoji: '⚗️',
    title: '方劑配伍',
    titleCn: '方剂配伍',
    desc: '君臣佐使配伍遊戲',
    descCn: '君臣佐使配伍游戏',
    href: null,
    status: 'coming',
    tags: ['方劑', '配伍'],
  },
  {
    key: 'case-study',
    emoji: '🩺',
    title: '臨床案例',
    titleCn: '临床案例',
    desc: '真實病例辯證練習',
    descCn: '真实病例辩证练习',
    href: null,
    status: 'coming',
    tags: ['辯證', '臨床'],
  },
]

export default function LearnPage() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'zh-TW'
  const isCN = locale === 'zh-CN'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif' }}>
      <SharedHeader
        title={isCN ? '学习大全' : '學習大全'}
        homeLink={isCN ? '/zh-CN' : '/zh-TW'}
      />

      <div style={{ padding: '16px 14px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1a2C24', marginBottom: '6px' }}>
            📚 {isCN ? '学习大全' : '學習大全'}
          </h1>
          <p style={{ fontSize: '13px', color: '#5A5A4A', lineHeight: 1.6 }}>
            {isCN
              ? '系统学习中醫知識，從穴位、配穴到方剂、临床。挑选感兴趣的模组开始。'
              : '系統學中醫知識，從穴位、配穴到方劑、臨床。挑選感興趣的模組開始。'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          {MODULES.map(m => {
            const inner = (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '32px', lineHeight: 1 }}>{m.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#1a2C24' }}>
                        {isCN ? m.titleCn : m.title}
                      </div>
                      {m.status === 'coming' && (
                        <span style={{ fontSize: '9px', color: '#8A8A7A', backgroundColor: 'rgba(138,138,122,0.15)', padding: '2px 7px', borderRadius: '8px', fontWeight: 600 }}>
                          {isCN ? '即将上线' : '即將上線'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#5A5A4A', lineHeight: 1.6, marginBottom: '10px', flex: 1 }}>
                  {isCN ? m.descCn : m.desc}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {m.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '9px', color: '#2C4A3E', backgroundColor: 'rgba(44,74,62,0.1)', padding: '2px 7px', borderRadius: '8px', fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )

            const baseStyle: React.CSSProperties = {
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 16px 14px',
              backgroundColor: m.status === 'ready' ? '#FFFEF9' : '#F5F2EB',
              borderRadius: '16px',
              border: '1.5px solid ' + (m.status === 'ready' ? '#E8E4DC' : '#E8E4DC'),
              textDecoration: 'none',
              opacity: m.status === 'ready' ? 1 : 0.6,
              cursor: m.status === 'ready' ? 'pointer' : 'not-allowed',
            }

            if (m.status === 'ready' && m.href) {
              return (
                <Link key={m.key} href={m.href} style={baseStyle}>
                  {inner}
                </Link>
              )
            }
            return (
              <div key={m.key} style={baseStyle}>
                {inner}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '24px', padding: '14px 16px', backgroundColor: '#FFFEF9', borderRadius: '14px', border: '1.5px solid #E8E4DC' }}>
          <div style={{ fontSize: '12px', color: '#8A8A7A', lineHeight: 1.7, textAlign: 'center' }}>
            {isCN
              ? '⚠️ 学习内容仅供学术参考，不作医疗用途。有病请寻求合法的医师。'
              : '⚠️ 學習內容僅供學術參考，不作醫療用途。有病請尋求合法的醫師。'}
          </div>
        </div>
      </div>
    </div>
  )
}

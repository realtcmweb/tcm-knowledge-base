'use client'

import React, { useState } from 'react'

interface FeedbackProps {
  step: string  // e.g. "chief", "freesearch", "questionnaire", "result"
  variant?: 'icon' | 'text' | 'fab'  // fab = floating action button
}

/* ── Common issues quick-select ── */
const QUICK_ISSUES = [
  '題目讀不懂 / 選項不清楚',
  '按鈕點擊沒反應',
  '頁面跑版 / 載入失敗',
  '中英文混亂',
  '想選的症狀不在列表裡',
  '分析結果不準確',
  '其他問題',
]

/* ── Step labels (Chinese) ── */
const STEP_LABELS: Record<string, string> = {
  mode: '首頁/模式選擇',
  chief: '主訴選擇',
  basic: '基本資料',
  freesearch: '自由輸入',
  free_basic: '基本資料(free)',
  symptom_priority: '症狀優先選擇',
  questionnaire: '問卷題目',
  tongue_guide: '舌象引導',
  tongue: '舌象拍攝',
  result: '分析結果',
}

export default function FeedbackButton({ step, variant = 'fab' }: FeedbackProps) {
  const [open, setOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState('')
  const [detail, setDetail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    const msg = [
      `🔔 頁面問題回報`,
      `頁面：${STEP_LABELS[step] || step}`,
      `問題：${selectedIssue || '（未選擇）'}`,
      detail ? `補充：${detail}` : '',
    ].filter(Boolean).join('\n')

    // Log locally for now, plus notify sub-agent
    const logEntry = `[${new Date().toLocaleString('zh-TW')}] [${step}] ${selectedIssue} ${detail ? '| ' + detail : ''}`
    const logs = JSON.parse(localStorage.getItem('tcm_feedback_logs') || '[]')
    logs.unshift(logEntry)
    localStorage.setItem('tcm_feedback_logs', JSON.stringify(logs.slice(0, 50)))

    // Try to notify sub-agent via their Telegram session
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, issue: selectedIssue, detail }),
      })
    } catch {}

    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setSelectedIssue(''); setDetail('') }, 2000)
  }

  if (variant === 'text') {
    return (
      <div className="inline-flex items-center">
        <button onClick={() => setOpen(true)} className="text-xs underline" style={{ color: '#A3B5A0' }}>
          回報問題
        </button>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
            <div className="bg-white rounded-2xl p-5 w-80 shadow-xl" onClick={e => e.stopPropagation()}>
              <p className="text-sm font-medium mb-3" style={{ color: '#2C4A3E' }}>回報問題：{STEP_LABELS[step] || step}</p>
              <div className="space-y-1.5 mb-3">
                {QUICK_ISSUES.map(q => (
                  <button key={q} onClick={() => setSelectedIssue(q)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                    style={{
                      background: selectedIssue === q ? 'rgba(44,74,62,0.08)' : '#F5F3EE',
                      color: selectedIssue === q ? '#2C4A3E' : '#4A4A42',
                      border: selectedIssue === q ? '1px solid #2C4A3E' : '1px solid transparent',
                    }}>
                    {q}
                  </button>
                ))}
              </div>
              <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={2}
                placeholder="補充說明（選填）"
                className="w-full px-3 py-2 text-xs rounded-lg border mb-3"
                style={{ border: '1px solid #E5E2DA', resize: 'none' }} />
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)} className="flex-1 py-2 text-xs rounded-lg" style={{ background: '#F0EDE6', color: '#8B6E5A' }}>取消</button>
                <button onClick={handleSend} disabled={!selectedIssue}
                  className="flex-1 py-2 text-xs rounded-lg font-medium"
                  style={{ background: selectedIssue ? '#2C4A3E' : '#E5E2DA', color: selectedIssue ? '#FFF' : '#A3B5A0' }}>
                  {sent ? '✅ 已送出' : '送出'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // FAB — floating bottom-right
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{ background: '#2C4A3E' }}
        title="回報問題"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#FAFAF7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 10h8M8 14h5" stroke="#FAFAF7" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-5 w-80 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: '#2C4A3E' }}>🔔 回報問題</p>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(44,74,62,0.08)', color: '#4A7C6A' }}>
                {STEP_LABELS[step] || step}
              </span>
            </div>

            <p className="text-xs mb-2" style={{ color: '#8B6E5A' }}>選擇問題類型</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUICK_ISSUES.map(q => (
                <button key={q} onClick={() => setSelectedIssue(q)}
                  className="px-2.5 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: selectedIssue === q ? '#2C4A3E' : 'rgba(44,74,62,0.06)',
                    color: selectedIssue === q ? '#FAFAF7' : '#4A4A42',
                    border: selectedIssue === q ? '1px solid #2C4A3E' : '1px solid rgba(44,74,62,0.12)',
                  }}>
                  {q}
                </button>
              ))}
            </div>

            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              rows={2}
              placeholder="補充說明（選填）"
              className="w-full px-3 py-2 text-sm rounded-xl border mb-4"
              style={{ border: '1px solid #E5E2DA', resize: 'none', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#2C4A3E'}
              onBlur={e => e.target.style.borderColor = '#E5E2DA'}
            />

            <div className="flex gap-2">
              <button onClick={() => setOpen(false)}
                className="flex-1 py-2.5 text-sm rounded-xl"
                style={{ background: '#F0EDE6', color: '#8B6E5A' }}>
                取消
              </button>
              <button onClick={handleSend} disabled={!selectedIssue}
                className="flex-1 py-2.5 text-sm rounded-xl font-medium transition-all"
                style={{
                  background: selectedIssue ? '#2C4A3E' : '#E5E2DA',
                  color: selectedIssue ? '#FAFAF7' : '#A3B5A0',
                }}>
                {sent ? '✅ 已送出' : '送出回報'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
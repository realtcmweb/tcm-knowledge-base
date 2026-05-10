'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import Head from 'next/head'
import Link from 'next/link'
import LanguageSelector from '../../components/LanguageSelector'
import { HerbRecommendation, getHerbTiming, SYNDROME_DATABASE, MERIDIAN_CLOCK } from '../../lib/tcm_knowledge'

// Input with unit toggle (used for height/weight)
function NumberInputWithUnit({ value, onChange, placeholder, isHeight }: {
  value: string; onChange: (v: string) => void; placeholder: string; isHeight?: boolean;
}) {
  const [localUnit, setLocalUnit] = useState(isHeight ? 'cm' : 'kg')
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 transition"
      style={{ border: '1px solid #E5E2DA' }}
      onFocus={e => e.currentTarget.style.borderColor = '#2C4A3E'}
      onBlur={e => e.currentTarget.style.borderColor = '#E5E2DA'}>
      <input type="text" inputMode="decimal" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 outline-none" style={{ color: '#1C2C24', letterSpacing: '0.04em' }} />
      {isHeight ? (
        <div className="flex gap-1">
          <button type="button" onClick={() => setLocalUnit('cm')}
            className="px-2.5 py-1 rounded text-xs transition-colors"
            style={{ background: localUnit === 'cm' ? '#2C4A3E' : '#F0EDE6', color: localUnit === 'cm' ? '#FAFAF7' : '#7A7A6A' }}>cm</button>
          <button type="button" onClick={() => setLocalUnit('inch')}
            className="px-2.5 py-1 rounded text-xs transition-colors"
            style={{ background: localUnit === 'inch' ? '#2C4A3E' : '#F0EDE6', color: localUnit === 'inch' ? '#FAFAF7' : '#7A7A6A' }}>inch</button>
        </div>
      ) : (
        <div className="flex gap-1">
          <button type="button" onClick={() => setLocalUnit('kg')}
            className="px-2.5 py-1 rounded text-xs transition-colors"
            style={{ background: localUnit === 'kg' ? '#2C4A3E' : '#F0EDE6', color: localUnit === 'kg' ? '#FAFAF7' : '#7A7A6A' }}>kg</button>
          <button type="button" onClick={() => setLocalUnit('lb')}
            className="px-2.5 py-1 rounded text-xs transition-colors"
            style={{ background: localUnit === 'lb' ? '#2C4A3E' : '#F0EDE6', color: localUnit === 'lb' ? '#FAFAF7' : '#7A7A6A' }}>lb</button>
        </div>
      )}
    </div>
  )
}
// ============================================
// 題目類型
// ============================================
interface QOption { value: string; label: string; labelKey?: string }
interface Question {
  id: string
  text: string
  textKey?: string
  type?: string
  required?: boolean
  options?: QOption[]
  placeholder?: string
  unit?: string
  hasCustomAgeInput?: boolean
  groupLabel?: string
}

// ============================================
// 歷史記錄儲存元件（localStorage）
// ============================================
interface SavedResult {
  type: string
  sub: string
  energy: number
  stress: number
  resilience: number
  innerEnergy: number
  lifestyle: { exercise: number; nutrition: number; environment: number; psychology: number; sleep: number; hormonal: number }
  savedAt: string
}

interface FollowupQuestion {
  id: string
  text: string
  options: Array<{ value: string; label: string }>
}

interface FreeSearchResult {
  loading?: string
  ok?: boolean
  answer?: string
  findings?: Array<{ source: string; text: string }>
  suggested_syndromes?: string[]
  suggested_herbs?: string[]
  need_followup?: boolean
  done?: boolean
  followup_questions?: FollowupQuestion[]
  from_graphdb?: { herbs: Array<{ name: string } | string>; acupoints: string[] }
  treatment?: { syndrome: string; suggested_herbs: string[]; suggested_formulas: string[] }
  context?: {
    suspected_syndromes: string[]
    confidence: number
    answered_count: number
  }
  result?: ResultData
  error?: string
}

function ResultSaveSection({ result }: { result: ResultData }) {
  const [history, setHistory] = useState<SavedResult[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const [saved, setSaved] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedOld, setSelectedOld] = useState<SavedResult | null>(null)


  useEffect(() => {
    const stored = localStorage.getItem('tcm_result_history')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {}
    }
  }, [])

  const saveResult = () => {
    const entry: SavedResult = {
      type: result.constitution.type,
      sub: result.constitution.sub,
      energy: result.constitution.energy,
      stress: result.constitution.stress,
      resilience: result.constitution.resilience,
      innerEnergy: result.constitution.innerEnergy,
      lifestyle: result.constitution.lifestyle,
      savedAt: new Date().toISOString(),
    }
    const updated = [entry, ...history].slice(0, 10)
    localStorage.setItem('tcm_result_history', JSON.stringify(updated))
    setHistory(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }


  const clearHistory = () => {
    localStorage.removeItem('tcm_result_history')
    setHistory([])
    setShowHistory(false)
    setCompareMode(false)
    setSelectedOld(null)
  }

  const lifestyleDiff = (cur: SavedResult['lifestyle'], old: SavedResult['lifestyle']) => {
    const keys = ['exercise', 'nutrition', 'environment', 'psychology', 'sleep', 'hormonal'] as const
    return keys.map(k => ({
      key: k,
      diff: cur[k] - old[k],
      icon: k === 'exercise' ? '🏃' : k === 'nutrition' ? '🥗' : k === 'environment' ? '🌤' : k === 'psychology' ? '🧘' : k === 'sleep' ? '😴' : '⚖️',
      label: { exercise: '運動', nutrition: '營養', environment: '環境', psychology: '心理', sleep: '睡眠', hormonal: '荷爾蒙' }[k],
    }))
  }

  return (
    <div className="mt-4">
      {!saved ? (
        <button onClick={saveResult}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-md">
          💾 儲存這次結果
        </button>
      ) : (
        <div className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-xl text-sm text-center font-medium">
          ✅ 已儲存！
        </div>
      )}

      <button onClick={() => setShowHistory(!showHistory)}
        className="w-full py-2.5 mt-2 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-xl bg-white hover:bg-stone-50 transition">
        📂 歷史記錄 ({history.length})
      </button>

      {showHistory && (
        <div className="mt-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-3">尚無記錄</p>
          ) : (
            <>
              <div className="flex gap-2 mb-2">
                <button onClick={() => { setCompareMode(false); setSelectedOld(null) }}
                  className={`text-xs px-3 py-1.5 rounded-full ${!compareMode ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                  📋 列表
                </button>
                <button onClick={() => setCompareMode(true)}
                  className={`text-xs px-3 py-1.5 rounded-full ${compareMode ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                  📊 對比模式
                </button>
                {history.length > 0 && (
                  <button onClick={clearHistory}
                    className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-500 ml-auto">
                    🗑 清除
                  </button>
                )}
              </div>

              {!compareMode ? (
                history.map((h, i) => {
                  const date = new Date(h.savedAt)
                  return (
                    <div key={i} className="bg-white border border-stone-200 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-700">{h.type}</p>
                          <p className="text-xs text-stone-400">{date.toLocaleDateString('zh-TW')} {date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-stone-500">能量 {h.energy}%</p>
                          <p className="text-xs text-stone-500">壓力 {h.stress}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : selectedOld ? (
                <div className="space-y-2">
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-500 mb-2">對比：{new Date(selectedOld.savedAt).toLocaleDateString('zh-TW')} vs 這次</p>
                    <div className="space-y-2">
                      {lifestyleDiff(result.constitution.lifestyle, selectedOld.lifestyle).map(item => (
                        <div key={item.key} className="flex items-center gap-2">
                          <span className="text-sm">{item.icon}</span>
                          <span className="text-xs text-stone-600 w-10">{item.label}</span>
                          <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div className="h-full bg-stone-400 rounded-full" style={{ width: `${selectedOld.lifestyle[item.key]}%` }} />
                          </div>
                          <span className="text-xs text-stone-400 w-6 text-center">→</span>
                          <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.diff > 0 ? 'bg-emerald-400' : item.diff < 0 ? 'bg-red-400' : 'bg-stone-400'}`}
                              style={{ width: `${result.constitution.lifestyle[item.key]}%` }} />
                          </div>
                          <span className={`text-xs w-10 text-right ${item.diff > 0 ? 'text-emerald-500' : item.diff < 0 ? 'text-red-500' : 'text-stone-400'}`}>
                            {item.diff > 0 ? '+' : ''}{item.diff}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSelectedOld(null)}
                    className="text-xs text-stone-400 hover:text-stone-600">← 重新選擇</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-stone-500 text-center">選擇一筆記錄來對比：</p>
                  {history.map((h, i) => {
                    const date = new Date(h.savedAt)
                    return (
                      <button key={i} onClick={() => setSelectedOld(h)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3 text-left hover:border-emerald-300 transition">
                        <p className="text-sm font-medium text-stone-700">{h.type}</p>
                        <p className="text-xs text-stone-400">{date.toLocaleDateString('zh-TW')} {date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}


      <p className="text-xs text-stone-400 mt-3 text-center">
        🔐 免費儲存10筆記錄。登入會員解鎖無限歷史 + 雲端同步
      </p>
    </div>
  )
}

// ============================================
// 問卷題目庫
// ============================================
const CHIEF_COMPLAINTS = [
  { value: '調養', label: '調養身體 / 健康檢查', icon: '🌱' },
  { value: '失眠', label: '失眠 / 睡不好', icon: '🌙' },
  { value: '疲倦', label: '疲倦 / 沒精神', icon: '😴' },
  { value: '消化', label: '腹瀉 / 便祕 / 胃脹', icon: '🔄' },
  { value: '冰冷', label: '手腳冰冷', icon: '🥶' },
  { value: '頭痛', label: '頭痛 / 頭暈', icon: '💫' },
  { value: '咳嗽', label: '咳嗽 / 喉嚨問題', icon: '🫁' },
  { value: '皮膚', label: '皮膚 / 過敏', icon: '🔴' },
  { value: '情緒', label: '情緒 / 壓力問題', icon: '💢' },
  { value: '月經', label: '月經失調（女性）', icon: '🌸' },
  { value: '疼痛', label: '腰酸 / 關節 / 各種痛', icon: '💉' },
  { value: '減肥', label: '減肥 / 控制體重', icon: '⚖️' },
  { value: '備孕', label: '備孕 / 調理不孕', icon: '🤰' },
  { value: '過敏', label: '過敏 / 鼻炎 / 氣喘', icon: '🤧' },
  { value: '其他', label: '其他問題', icon: '📋' },
]

// 年齡選項（全部顯示，上半部按鈕）
const AGE_OPTIONS = [
  { value: '0-6', label: '🧒 幼兒（0-6歲）' },
  { value: '7-11', label: '🎒 學齡（7-11歲）' },
  { value: '12-17', label: '🧑 青少年（12-17歲）' },
  { value: '18-30', label: '18 - 30 歲' },
  { value: '31-45', label: '31 - 45 歲' },
  { value: '46-60', label: '46 - 60 歲' },
  { value: '60-74', label: '👴 老年人（60-74歲）' },
  { value: '75-89', label: '🧓 高齡老人（75-89歲）' },
  { value: '90+', label: '🎂 長壽老人（90歲以上）' },
]

const BASIC_QUESTIONS: Question[] = [
  { id: 'gender', text: '您的性別是？', options: [
    { value: '男', label: '👨 男性' },
    { value: '女', label: '👩 女性' },
  ]},
  { id: 'age', text: '您的年齡是？', options: AGE_OPTIONS, hasCustomAgeInput: true },
  { id: 'height', text: '身高（選填）', type: 'input_number', placeholder: '例：170', unit: 'cm', groupLabel: '身體數據' },
  { id: 'weight', text: '體重（選填）', type: 'input_number', placeholder: '例：65', unit: 'kg' },
]

// 快速問診核心題（每主訴精選1題，共14題）
const FAST_QUESTIONS: Record<string, Question[]> = {
  '失眠': [
    { id: 'f_s1', text: '你睡覺的問題主要是什麼？', options: [
      { value: '難入睡', label: '睡不著（超過30分鐘）' },
      { value: '易醒', label: '容易醒、淺眠' },
      { value: '早醒', label: '早醒後再也睡不著' },
      { value: '多夢', label: '多夢，像沒睡過一樣' },
    ]},
  ],
  '疲倦': [
    { id: 'f_t1', text: '你疲勞的特點是什麼？', options: [
      { value: '早上累', label: '一起床就累、沒精神' },
      { value: '下午累', label: '下午3-5點最明顯' },
      { value: '整天累', label: '整天都累、提不起勁' },
      { value: '說話無力', label: '說話低弱無力' },
    ]},
  ],
  '消化': [
    { id: 'f_d1', text: '你的大便形態最接近哪種？', options: [
      { value: '正常', label: '成形正常' },
      { value: '乾硬', label: '乾硬、便秘（2-3天一次）' },
      { value: '稀軟', label: '偏軟、容易腹瀉' },
      { value: '黏', label: '黏膩、粘馬桶、冲不乾淨' },
    ]},
  ],
  '冰冷': [
    { id: 'f_c1', text: '你手腳冰冷的部位？', options: [
      { value: '手腳', label: '手腳都冷' },
      { value: '腳', label: '腳冷為主' },
      { value: '手', label: '手冷為主' },
      { value: '冷到手臂', label: '冷到手臂/大腿' },
    ]},
  ],
  '頭痛': [
    { id: 'f_h1', text: '你的頭痛主要在哪裡？', options: [
      { value: '兩側', label: '兩側太陽穴' },
      { value: '前額', label: '前額 / 眉心' },
      { value: '頭頂', label: '頭頂' },
      { value: '後腦', label: '後腦勺' },
    ]},
  ],
  '咳嗽': [
    { id: 'f_k1', text: '你是乾咳還是有痰？', options: [
      { value: '乾咳', label: '乾咳（沒有痰）' },
      { value: '有痰', label: '有痰（白/黃）' },
      { value: '痰多', label: '痰很多、喉嚨有異物' },
    ]},
  ],
  '皮膚': [
    { id: 'f_sk1', text: '皮膚問題最困擾你的是什麼？', options: [
      { value: '癢', label: '癢（尤其晚上/悶熱時）' },
      { value: '長痘', label: '長痘/瘡/囊腫' },
      { value: '過敏', label: '過敏/紅疹/蕁麻疹' },
      { value: '脫皮', label: '脫皮/乾燥/緊繃' },
    ]},
  ],
  '情緒': [
    { id: 'f_e1', text: '你的情緒主要是哪種狀態？', options: [
      { value: '焦慮', label: '焦慮 / 緊張 / 擔心' },
      { value: '低落', label: '低落 / 對什麼都沒興趣' },
      { value: '易怒', label: '易怒 / 脾氣大' },
      { value: '壓力', label: '壓力大 / 緊繃' },
    ]},
  ],
  '月經': [
    { id: 'f_m1', text: '你的月經週期正常嗎？', options: [
      { value: '正常', label: '正常（25-35天一次）' },
      { value: '提前', label: '提前（不到25天）' },
      { value: '推遲', label: '推遲（超過35天）' },
      { value: '不規律', label: '不規律、時早時遲' },
    ]},
  ],
  '疼痛': [
    { id: 'f_p1', text: '你哪裡最痛？', options: [
      { value: '腰', label: '腰痛 / 腰膝酸軟' },
      { value: '關節', label: '關節疼痛' },
      { value: '肩頸', label: '肩頸僵硬/酸痛' },
      { value: '肌肉', label: '肌肉酸痛 / 全身痛' },
    ]},
  ],
  '減肥': [
    { id: 'f_l1', text: '減肥困擾你多久了？', options: [
      { value: '輕微', label: '輕微（想稍微緊實）' },
      { value: '中等', label: '中等（已影響自信）' },
      { value: '嚴重', label: '嚴重（健康亮紅燈）' },
    ]},
  ],
  '備孕': [
    { id: 'f_b1', text: '備孕或不孕困擾你多久了？', options: [
      { value: '未開始', label: '還沒正式備孕' },
      { value: '半年內', label: '半年內' },
      { value: '半年到一年', label: '半年～1年' },
      { value: '一年以上', label: '超過1年' },
    ]},
  ],
  '過敏': [
    { id: 'f_a1', text: '過敏主要症狀是什麼？', options: [
      { value: '鼻', label: '鼻過敏 / 打噴嚏 / 鼻塞' },
      { value: '皮', label: '皮膚癢 / 蕁麻疹 / 濕疹' },
      { value: '眼', label: '眼睛癢 / 紅腫' },
      { value: '呼', label: '氣喘 / 呼吸困難' },
    ]},
  ],
  '調養': [
    { id: 'f_w1', text: '你最想改善的是什麼？', options: [
      { value: '免疫', label: '提升免疫力 / 少感冒' },
      { value: '疲勞', label: '改善慢性疲勞 / 沒精神' },
      { value: '睡眠', label: '改善睡眠品質' },
      { value: '消化', label: '腸胃功能調整' },
      { value: '情緒', label: '情緒壓力舒緩' },
    ]},
  ],
  '其他': [
    { id: 'f_o1', text: '不舒服主要在哪裡？', options: [
      { value: '頭部', label: '頭暈 / 頭痛' },
      { value: '胸腹', label: '胸悶 / 腹脹 / 胃痛' },
      { value: '四肢', label: '手腳麻木 / 關節痛' },
      { value: '全身', label: '全身性症狀' },
    ]},
  ],
}

// 詳細問診補充題（完整十問歌版本）
const DETAILED_EXTRA: Question[] = [
  // 一問寒熱
  { id: 'd_cold', text: '你容易怕冷還是怕熱？', options: [
    { value: '怕冷', label: '怕冷（手腳冰涼、喜歡熱）' },
    { value: '怕熱', label: '怕熱（想吃冰的、容易出汗）' },
    { value: '兩者', label: '兩者都有（上下半身溫差大）' },
    { value: '正常', label: '對溫度沒有特別偏好' },
  ]},
  { id: 'd_cold_2', text: '怕冷主要在身體哪個部位？', options: [
    { value: '手腳', label: '手腳冰冷' },
    { value: '腰背', label: '腰背冷痛/酸痛' },
    { value: '全身', label: '全身都怕冷' },
    { value: '無', label: '不怕冷' },
  ]},
  { id: 'd_heat', text: '怕熱的表現是什麼？', options: [
    { value: '手腳心', label: '手腳心發燙（下午/晚上明顯）' },
    { value: '全身', label: '全身燥熱、想吹風' },
    { value: '午後', label: '午後潮熱（下午3-5點最明顯）' },
    { value: '無', label: '不怕熱' },
  ]},
  // 二問汗
  { id: 'd_sweat', text: '你平時容易出汗嗎？', options: [
    { value: '不容易', label: '不容易出汗' },
    { value: '自汗', label: '稍微動一下就滿頭大汗（自汗）' },
    { value: '盜汗', label: '睡覺時出汗、醒來就停（盜汗）' },
    { value: '正常', label: '運動後正常出汗' },
  ]},
  { id: 'd_sweat_2', text: '出汗的主要部位？', options: [
    { value: '頭面', label: '頭面部為主' },
    { value: '手腳', label: '手腳心為主' },
    { value: '全身', label: '全身出汗' },
    { value: '局部', label: '只有特定部位（如胸口）' },
  ]},
  // 三問頭身
  { id: 'd_head', text: '你有頭暈或頭痛嗎？', options: [
    { value: '無', label: '沒有' },
    { value: '頭暈', label: '頭暈（昏沉、走路飄）' },
    { value: '頭痛', label: '頭痛（脹/刺/悶）' },
    { value: '兩者', label: '兩者都有' },
  ]},
  { id: 'd_body', text: '身體有沒有酸痛或乏力？', options: [
    { value: '無', label: '沒有' },
    { value: '腰酸', label: '腰酸/腰膝酸軟' },
    { value: '肩頸', label: '肩頸僵硬/酸痛' },
    { value: '全身', label: '全身乏力/沉重' },
  ]},
  // 四問便
  { id: 'd_stool', text: '大便形態？', options: [
    { value: '正常', label: '成形正常' },
    { value: '硬', label: '乾硬、便秘（2-3天一次）' },
    { value: '軟', label: '偏軟、容易腹瀉' },
    { value: '黏', label: '黏膩、粘馬桶、冲不乾淨' },
  ]},
  { id: 'd_urine', text: '小便情況？', options: [
    { value: '正常', label: '正常（白天4-6次，夜晚0-1次）' },
    { value: '清長', label: '尿清、量多（可能是氣虛/陽虛）' },
    { value: '短赤', label: '尿黃、量少、有灼熱感' },
    { value: '頻數', label: '尿頻、夜尿多（超過2次）' },
  ]},
  // 五問飲食
  { id: 'd_appetite', text: '食欲情況？', options: [
    { value: '正常', label: '正常' },
    { value: '不振', label: '吃不下東西' },
    { value: '過旺', label: '容易飢餓、吃很多' },
    { value: '胃脹', label: '吃一點就飽、容易胃脹' },
  ]},
  { id: 'd_thirst', text: '口渴情況？', options: [
    { value: '不渴', label: '不口渴、不想喝水' },
    { value: '冷飲', label: '想喝冷水/冰的' },
    { value: '熱飲', label: '想喝熱水/溫水' },
    { value: '不多', label: '口渴但不想喝水（可能陰虛）' },
  ]},
  // 六問胸腹
  { id: 'd_chest', text: '胸口或腹部有不舒服嗎？', options: [
    { value: '無', label: '沒有' },
    { value: '胸悶', label: '胸悶/心悸（氣機不暢）' },
    { value: '腹脹', label: '腹脹/消化不良' },
    { value: '脇痛', label: '脇肋脹痛（肝氣鬱結）' },
  ]},
  // 七問聽力
  { id: 'd_ear', text: '聽力或耳朵有問題嗎？', options: [
    { value: '無', label: '沒有' },
    { value: '耳鳴', label: '耳鳴（蟬叫/嗡嗡聲）' },
    { value: '聽力', label: '聽力下降' },
    { value: '耳塞', label: '耳朵悶塞感' },
  ]},
  // 八問口咽
  { id: 'd_mouth', text: '口腔/咽喉有什麼不適？', options: [
    { value: '無', label: '沒有' },
    { value: '口苦', label: '口苦（尤其早上）' },
    { value: '口乾', label: '口乾（喝水也不解渴）' },
    { value: '咽乾', label: '咽喉乾癢、異物感' },
  ]},
  // 九問舊病
  { id: 'd_history', text: '過去有哪些健康問題？（可多選）', options: [
    { value: '無', label: '沒有重大疾病' },
    { value: '消化', label: '腸胃問題（胃炎/潰痬/便秘）' },
    { value: '呼吸', label: '呼吸系統（氣喘/鼻炎/咳嗽）' },
    { value: '代謝', label: '代謝問題（三高/甲狀腺）' },
    { value: '情緒', label: '情緒問題（抑鬱/焦慮）' },
    { value: '手術', label: '有大手術史' },
  ]},
  // 十問病因
  { id: 'd_cause', text: '你認為引起不適的主要原因是什麼？', type: 'input_text', placeholder: '如：工作壓力大/飲食不正常/熬夜/感冒後遺症/情緒波動...' },
  // 經帶（女性）
  { id: 'd_menses', text: '月經情況？（女性填寫）', options: [
    { value: '正常', label: '正常（25-35天一次，4-7天結束）' },
    { value: '提前', label: '月經提前（不到25天）' },
    { value: '推遲', label: '月經推遲（超過35天）' },
    { value: '不規律', label: '不規律（時早時遲）' },
    { value: '停經', label: '已停經/更年期' },
  ]},
  { id: 'd_discharge', text: '白帶情況？', options: [
    { value: '正常', label: '正常（透明/乳白、無異味）' },
    { value: '多', label: '白帶多（顏色黃/綠/有異味）' },
    { value: '少', label: '陰道乾澀' },
    { value: '不適用', label: '不適用（男性/停經）' },
  ]},
]

// ============================================
// 中醫體質/證型分析引擎
// ============================================
// 辯證要點：每種體質的關鍵判定指標
const PATTERN_KEYS: Record<string, string[]> = {
  '陰虛': ['怕熱', '盜汗/自汗', '失眠/多夢/易醒'],
  '陽虛': ['怕冷', '腰酸/冷痛', '夜尿多/尿清'],
  '氣虛': ['疲倦乏力', '說話無力', '稍動即喘'],
  '痰濕': ['身體沉重', '大便黏膩', '舌苔厚膩'],
  '氣鬱': ['情緒波動大', '胸脅脹悶', '易怒/焦慮'],
  '脾虛': ['食欲不振', '大便異常', '飯後腹脹'],
  '需調理': ['陰陽偏頗', '輕度失衡', '需持續調養'],
}

// 中成藥用藥禁忌（通用版）
const HERB_CAUTIONS: Record<string, string[]> = {
  '六味地黃丸': ['脾胃虛弱、腹瀉者慎用', '孕婦慎用', '感冒期間停用'],
  '天王補心丹': ['脾胃虛寒、腹瀉者慎用', '孕婦慎用', '不宜與咖啡因同服'],
  '生脈飲': ['感冒發燒時停用', '有實熱證者慎用'],
  '理中丸': ['胃熱、胃潰疡者不宜', '孕婦慎用', '口乾咽燥者慎用'],
  '金匱腎氣丸': ['孕婦禁用', '有實熱證（口瘡、便秘）者慎用', '心悸失眠者慎用'],
  '四神湯': ['孕婦慎用', '胃潰疡急性期慎用', '對食材過敏者慎用'],
  '補中益氣丸': ['感冒發燒時停用', '血壓高者慎用', '不宜與蘿蔔同服'],
  '四君子湯': ['感冒發燒時停用', '有實熱證者慎用'],
  '平胃散': ['胃潰疡、胃酸過多者慎用', '孕婦慎用', '陰虛體質慎用'],
  '二陳湯': ['孕婦慎用', '胃酸過多者慎用', '乾咳無痰者慎用'],
  '溫膽湯': ['孕婦慎用', '胃潰疡者慎用', '心悸心慌者慎用'],
  '逍遙丸': ['感冒發燒時停用', '月經過多者慎用', '孕婦慎用'],
  '柴胡疏肝散': ['孕婦慎用', '肝陰不足（眩暈、口乾）者慎用', '胃潰疡者慎用'],
  '甘麥大棗湯': ['對小麥過敏者禁用', '血糖高者注意糖分'],
  '參苓白朮散': ['感冒發燒時停用', '有實熱證者慎用', '便秘者慎用'],
  '附子理中丸': ['孕婦禁用', '高血壓、心臟病者慎用', '胃潰疡出血者禁用'],
}

function getHerbCautions(herbs: string[]): string[] {
  return herbs.flatMap(h => HERB_CAUTIONS[h] || []).filter((v, i, a) => a.indexOf(v) === i)
}

function getPatternKeys(type: string): string[] {
  return PATTERN_KEYS[type] || PATTERN_KEYS['需調理']
}

// ============================================
// 分析引擎
// ============================================
// ============================================
// 智能問診：症狀分類（全開式多選）
// ============================================
const SMART_SECTIONS = [
  {
    id: 'general', title: '全身症狀', icon: '🌡️',
    symptoms: [
      { value: '疲倦', label: '疲倦乏力' },
      { value: '怕冷', label: '怕冷' },
      { value: '怕熱', label: '怕熱' },
      { value: '盜汗', label: '盜汗/自汗' },
      { value: '發燒', label: '發燒/發熱' },
      { value: '浮腫', label: '身體浮腫' },
      { value: '消瘦', label: '體重減輕' },
      { value: '沉重', label: '身體沉重' },
    ]
  },
  {
    id: 'head', title: '頭面部', icon: '🧠',
    symptoms: [
      { value: '頭暈', label: '頭暈' },
      { value: '頭痛', label: '頭痛' },
      { value: '耳鳴', label: '耳鳴' },
      { value: '眼花', label: '眼睛乾澀/眼花' },
      { value: '口乾', label: '口乾' },
      { value: '口苦', label: '口苦' },
      { value: '口臭', label: '口臭' },
      { value: '咽乾', label: '咽喉乾癢' },
    ]
  },
  {
    id: 'digestive', title: '消化系統', icon: '🫃',
    symptoms: [
      { value: '食欲不振', label: '食欲不振' },
      { value: '胃脹', label: '胃脹/腹脹' },
      { value: '胃痛', label: '胃痛' },
      { value: '反酸', label: '反酸/燒心' },
      { value: '噁心', label: '噁心嘔吐' },
      { value: '腹瀉', label: '腹瀉/稀軟' },
      { value: '便祕', label: '便祕/乾硬' },
      { value: '黏便', label: '大便黏膩' },
    ]
  },
  {
    id: 'sleep', title: '睡眠情緒', icon: '😴',
    symptoms: [
      { value: '失眠', label: '失眠/難入睡' },
      { value: '多夢', label: '多夢' },
      { value: '易醒', label: '容易醒' },
      { value: '嗜睡', label: '嗜睡/昏沉' },
      { value: '焦慮', label: '焦慮/緊張' },
      { value: '易怒', label: '易怒/脾氣大' },
      { value: '低落', label: '情緒低落' },
      { value: '壓力', label: '壓力大' },
    ]
  },
  {
    id: 'respiratory', title: '呼吸系統', icon: '🫁',
    symptoms: [
      { value: '咳嗽', label: '咳嗽' },
      { value: '鼻塞', label: '鼻塞' },
      { value: '流鼻涕', label: '流鼻涕/鼻水' },
      { value: '打噴嚏', label: '打噴嚏' },
      { value: '氣喘', label: '氣喘/呼吸困難' },
      { value: '痰多', label: '痰多' },
    ]
  },
  {
    id: 'skin', title: '皮膚問題', icon: '🔴',
    symptoms: [
      { value: '皮膚癢', label: '皮膚癢' },
      { value: '濕疹', label: '濕疹' },
      { value: '蕁麻疹', label: '蕁麻疹' },
      { value: '痘痘', label: '痘痘/瘡' },
      { value: '脫皮', label: '脫皮/乾燥' },
    ]
  },
  {
    id: 'pain', title: '疼痛問題', icon: '💢',
    symptoms: [
      { value: '腰痛', label: '腰痛' },
      { value: '關節痛', label: '關節疼痛' },
      { value: '肌肉酸', label: '肌肉酸痛' },
      { value: '神經痛', label: '神經痛/刺痛' },
      { value: '冷痛', label: '冷痛（遇冷加劇）' },
    ]
  },
  {
    id: 'urinary', title: '泌尿/生殖', icon: '💧',
    symptoms: [
      { value: '尿頻', label: '尿頻/夜尿多' },
      { value: '尿少', label: '尿少/尿黃' },
      { value: '尿痛', label: '尿痛' },
      { value: '性功能', label: '性功能問題' },
    ]
  },
  {
    id: 'cold', title: '寒熱表現', icon: '❄️',
    symptoms: [
      { value: '手腳冷', label: '手腳冰冷' },
      { value: '上熱下寒', label: '上熱下寒' },
      { value: '冷底', label: '冷底體質' },
      { value: '燥熱', label: '燥熱/虛火' },
    ]
  },
]

function analyzeCondition(answers: Record<string, string>): {
  type: string; sub: string; pattern: string; description: string
  suggestions: string[]; avoid: string[]; herbs: string[]; acupoints: string[]; diet: string[]
  energy: number; stress: number; resilience: number; innerEnergy: number
  lifestyle: { exercise: number; nutrition: number; environment: number; psychology: number; sleep: number; hormonal: number }
  meridianBalance: { left: number; right: number }
} {
  const vals = Object.values(answers).join('')

  if (vals.includes('怕熱') && (vals.includes('盜汗') || vals.includes('自汗')) && (vals.includes('難入睡') || vals.includes('多夢') || vals.includes('易醒'))) {
    return { type: '陰虛', sub: '心腎陰虛', pattern: '虛熱', description: '您屬於陰虛體質，虛火內擾，常見盜汗、失眠、口乾咽燥。調理以滋陰清熱、養心安神為主。', suggestions: ['少吃燒烤炸辣', '多吃百合、銀耳、麥冬、玉竹', '避免熬夜（23點前入睡）', '練習太極/冥想'], avoid: ['咖啡因', '酒精', '辛辣', '炸物'], herbs: ['六味地黃丸', '天王補心丹', '生脈飲'], acupoints: ['太溪穴（足內側）', '湧泉穴（足底）', '內關穴（手腕）'], diet: ['百合銀耳羹：百合30g + 銀耳20g + 冰糖', '麥冬玉竹茶：麥冬10g + 玉竹10g 熱水泡', '桑椹枸杞茶：桑椹15g + 枸杞10g'], energy: 68, stress: 3.8, resilience: 45, innerEnergy: 58, lifestyle: { exercise: 72, nutrition: 78, environment: 85, psychology: 65, sleep: 58, hormonal: 62 }, meridianBalance: { left: 1.42, right: 1.38 } }
  }
  if (vals.includes('怕冷') && (vals.includes('很怕') || vals.includes('極度')) && (vals.includes('腰') || vals.includes('冷痛') || vals.includes('夜尿') || vals.includes('清長'))) {
    return { type: '陽虛', sub: '脾腎陽虛', pattern: '虛寒', description: '您屬於陽虛體質，火力不足，畏寒怕冷，容易疲倦。調理以溫補脾腎、助陽驅寒為主。', suggestions: ['多吃溫熱食物（羊肉、龍眼、紅紅棗、薑）', '忌生冷冰品', '每天熱水泡腳（加生薑）', '適度運動（快走、太極）'], avoid: ['冰品', '生菜水果', '冷飲', '西瓜'], herbs: ['理中丸', '金匱腎氣丸', '四神湯'], acupoints: ['關元穴（肚臍下）', '命門穴（後腰）', '足三里（膝蓋下）'], diet: ['羊肉當歸湯：羊肉250g + 當歸10g + 薑3片', '桂圓紅棗茶：桂圓10顆 + 紅棗5顆', '生薑紅糖水：生薑3片 + 紅糖'], energy: 52, stress: 2.8, resilience: 55, innerEnergy: 62, lifestyle: { exercise: 65, nutrition: 70, environment: 88, psychology: 75, sleep: 68, hormonal: 58 }, meridianBalance: { left: 1.52, right: 1.54 } }
  }
  if ((vals.includes('疲倦') || vals.includes('整天') || vals.includes('早上')) && (vals.includes('輕微') || vals.includes('很弱') || vals.includes('說話') || vals.includes('正常') === false)) {
    return { type: '氣虛', sub: '脾肺氣虛', pattern: '虛', description: '您屬於氣虛體質，元氣不足，容易疲勞，說話無力，稍動即喘。調理以補氣健脾、益肺固表為主。', suggestions: ['多吃山藥、黃耆、黨參、紅棗', '忌耗氣食物（白蘿蔔、茶葉）', '保證充足睡眠（8小時）', '避免過度疲勞'], avoid: ['過度勞累', '熬夜', '劇烈運動', '減肥節食'], herbs: ['補中益氣丸', '四君子湯', '生脈飲'], acupoints: ['氣海穴（肚臍下）', '肺俞穴（背部）', '足三里（膝蓋下）'], diet: ['山藥粥：山藥200g + 粳米100g 煮粥', '黨參黃耆茶：黨參10g + 黃耆10g', '紅棗桂圓湯：紅棗10顆 + 桂圓15g'], energy: 44, stress: 2.2, resilience: 40, innerEnergy: 55, lifestyle: { exercise: 58, nutrition: 72, environment: 82, psychology: 70, sleep: 52, hormonal: 65 }, meridianBalance: { left: 1.35, right: 1.40 } }
  }
  if ((vals.includes('黏') || vals.includes('胃脹') || vals.includes('痰多') || vals.includes('渾身')) && (vals.includes('疲倦') || vals.includes('沉重'))) {
    return { type: '痰濕', sub: '痰濕困脾', pattern: '實', description: '您屬於痰濕體質，濕濁內蘊，身體沉重，容易長痘或出油。調理以燥濕化痰、健脾利濕為主。', suggestions: ['少吃甜食油膩', '多吃薏仁、赤小豆、冬瓜', '保持環境乾燥', '規律運動（微汗為佳）'], avoid: ['甜食', '油炸', '糯米', '奶製品', '酒'], herbs: ['平胃散', '二陳湯', '溫膽湯'], acupoints: ['陰陵泉（小腿內側）', '豐隆穴（小腿外側）', '中脘穴（肚臍上）'], diet: ['薏仁紅豆粥：薏仁30g + 赤小豆30g', '冬瓜排骨湯：冬瓜500g + 排骨250g', '陳皮普洱茶：陳皮5g + 普洱5g'], energy: 48, stress: 3.2, resilience: 42, innerEnergy: 60, lifestyle: { exercise: 55, nutrition: 58, environment: 78, psychology: 72, sleep: 62, hormonal: 68 }, meridianBalance: { left: 1.60, right: 1.45 } }
  }
  if ((vals.includes('易怒') || vals.includes('焦慮') || vals.includes('壓力')) && (vals.includes('胸悶') || vals.includes('胃') || vals.includes('腹脹'))) {
    return { type: '氣鬱', sub: '肝氣鬱結', pattern: '實', description: '您屬於氣鬱體質，肝氣不舒，情緒波動大，胸脅脹悶。調理以疏肝理氣、解鬱安神為主。', suggestions: ['多喝花茶（玫瑰花、菊花、茉莉花）', '找人傾訴', '按摩太衝穴', '規律作息'], avoid: ['過度壓抑情緒', '酒精', '熬夜', '生悶氣'], herbs: ['逍遙丸', '柴胡疏肝散', '甘麥大棗湯'], acupoints: ['太衝穴（足大趾旁）', '合谷穴（手虎口）', '膻中穴（胸口）'], diet: ['玫瑰花茶：玫瑰花5g 熱水泡', '茉莉花茶：茉莉花5g + 綠茶', '菊花枸杞茶：菊花5g + 枸杞10g'], energy: 55, stress: 4.2, resilience: 38, innerEnergy: 65, lifestyle: { exercise: 60, nutrition: 75, environment: 80, psychology: 55, sleep: 50, hormonal: 72 }, meridianBalance: { left: 1.30, right: 1.55 } }
  }
  if ((vals.includes('稀軟') || vals.includes('腹瀉') || vals.includes('不振') || vals.includes('胃脹') || vals.includes('吃一點'))) {
    return { type: '脾虛', sub: '脾胃虛弱', pattern: '虛', description: '您屬於脾虛體質，運化失常，大便異常，食慾不振。調理以健脾和胃、補中益氣為主。', suggestions: ['定時定量用餐', '多吃山藥、茯苓、蓮子', '飯後散步30分鐘', '少吃生冷油膩'], avoid: ['冰品', '空腹吃水果', '暴飲暴食', '甜食'], herbs: ['參苓白朮散', '四君子湯', '附子理中丸'], acupoints: ['足三里（膝蓋下3寸）', '中脘穴（肚臍上4寸）', '脾俞穴（背部）'], diet: ['山藥蓮子粥：山藥50g + 蓮子30g + 粳米100g', '茯苓餅：茯苓粉30g + 麵粉100g 煎', '四神豬肚湯：山藥/茯苓/蓮子/芡實 各15g + 豬肚'], energy: 50, stress: 2.5, resilience: 48, innerEnergy: 58, lifestyle: { exercise: 62, nutrition: 62, environment: 85, psychology: 78, sleep: 65, hormonal: 70 }, meridianBalance: { left: 1.48, right: 1.44 } }
  }
  return { type: '需調理', sub: '陰陽偏頗', pattern: 'mixed', description: '根據您的描述，您有陰陽氣血輕度偏頗。建議規律作息、均衡飲食、適度運動以維持健康平衡。', suggestions: ['保持規律作息', '均衡飲食', '每週運動3次', '保持心情愉快'], avoid: ['過度疲勞', '情緒大波動', '熬夜'], herbs: [], acupoints: [], diet: [], energy: 65, stress: 2.8, resilience: 60, innerEnergy: 70, lifestyle: { exercise: 70, nutrition: 75, environment: 82, psychology: 78, sleep: 72, hormonal: 75 }, meridianBalance: { left: 1.45, right: 1.45 } }
}

// ============================================
// 類型
// ============================================
type Step = 'mode' | 'basic' | 'chief' | 'smart' | 'freesearch' | 'questionnaire' | 'tongue_guide' | 'tongue' | 'result'
type Mode = 'fast' | 'detailed' | 'smart'

interface ResultData {
  constitution: ReturnType<typeof analyzeCondition>
  tongue?: Record<string, unknown>
  face?: Record<string, unknown>
  questionnaire_answers: Record<string, string>
  savedAt?: string // ISO date string for comparison
  tongueGuide?: { tongueColor?: string; coatingColor?: string; coatingTexture?: string; marks?: string[] }
}


// ============================================
// FAQ折疊元件
// ============================================
function FaqAccordion() {
  const faqs = [
    { q: '這個分析準確嗎？', a: '基於中醫十問歌、八綱辨證、臟腑辨證等千年臨床框架，AI模型由資深中醫師監督校準，準確率高於一般商業體質測驗。' },
    { q: '我的隱私安全嗎？', a: '您的舌苔、面容照片僅用於本次分析，不會保存或分享。問卷結果存在您自己的瀏覽器裡。' },
    { q: '和去看中醫有什麼不同？', a: '線上分析僅供參考，不能取代中醫師面診。如有明顯症狀，建議就近諮詢中醫師。' },
  ]
  return (
    <div className="mb-6">
      {/* Zen section header */}
      <div className="flex items-center gap-3 mb-4">
        <div style={{ width: '24px', height: '1px', background: '#E5E2DA' }} />
        <p className="text-xs tracking-widest" style={{ color: '#A3B5A0', letterSpacing: '0.15em' }}>常見問題</p>
        <div style={{ width: '24px', height: '1px', background: '#E5E2DA' }} />
      </div>
      {faqs.map((faq, i) => <FaqItem key={i} faq={faq} />)}
    </div>
  )
}

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-200 rounded-xl"
        style={{ background: open ? 'rgba(44,74,62,0.04)' : '#FFFFFF', border: open ? '1px solid #2C4A3E' : '1px solid #E5E2DA', color: open ? '#2C4A3E' : '#3A3A32' }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = '#A3B5A0' } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = '#E5E2DA' } }}>
        <span style={{ fontWeight: open ? '500' : '400', letterSpacing: '0.02em' }}>{faq.q}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ color: open ? '#2C4A3E' : '#A3B5A0', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="mt-1 px-4 py-3 rounded-xl text-sm leading-relaxed"
          style={{ background: '#FAFAF7', border: '1px solid #E5E2DA', color: '#4A4A42', letterSpacing: '0.02em' }}>
          {faq.a}
        </div>
      )}
    </div>
  )
}


// ============================================
// 主元件
// ============================================
export default function Home() {
  const t = useTranslations()
  const locale = useLocale()
  const [mode, setMode] = useState<Mode | null>(null)
  const [fontScale, setFontScale] = useState(100) // 100/115/130
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('mode')
  const [resultTab, setResultTab] = useState<'detail'|'herbs'|'food'|'acupoints'|'lifestyle'>('detail')
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [helpedCount] = useState(12847)
  const [freeText, setFreeText] = useState('')
  const [freeSearchLoading, setFreeSearchLoading] = useState(false)
  const [freeSearchResult, setFreeSearchResult] = useState<FreeSearchResult | null>(null)
  const [tongueGuideAnswers, setTongueGuideAnswers] = useState<Record<string, string>>({})
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customInput, setCustomInput] = useState('')
  const [smartAnswers, setSmartAnswers] = useState<Record<string, string[]>>({})
interface FollowupQuestion {
  id: string
  text: string
  options: Array<{ value: string; label: string }>
}

interface FreeSearchResult {
  loading?: string
  ok?: boolean
  answer?: string
  findings?: Array<{ source: string; text: string }>
  suggested_syndromes?: string[]
  suggested_herbs?: string[]
  need_followup?: boolean
  done?: boolean
  followup_questions?: FollowupQuestion[]
  from_graphdb?: { herbs: Array<{ name: string } | string>; acupoints: string[] }
  treatment?: { syndrome: string; suggested_herbs: string[]; suggested_formulas: string[] }
  context?: {
    suspected_syndromes: string[]
    confidence: number
    answered_count: number
  }
  result?: ResultData
  error?: string
}
  const [tongueGuideOpen, setTongueGuideOpen] = useState(false)
  const [freeSearchMode, setFreeSearchMode] = useState<'input' | 'questionnaire' | 'result'>('input')
  const [freeSearchAnswers, setFreeSearchAnswers] = useState<Record<string, string>>({})
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [reportPreview, setReportPreview] = useState<string | null>(null)

  // Reset free search when input becomes empty
  useEffect(() => {
    if (freeText.trim() === '' && freeSearchMode !== 'input') {
      setFreeSearchMode('input')
      setFreeSearchAnswers({})
      setFreeSearchResult(null)
    }
  }, [freeText, freeSearchMode])

  const reportFileRef = useRef<HTMLInputElement>(null)

  const TONGUE_COLOR_OPTIONS = [
    { value: '淡紅', label: '淡紅舌（健康/輕微氣虛）' },
    { value: '紅', label: '紅舌（實熱或陰虛火旺）' },
    { value: '深紅', label: '深紅舌（熱證嚴重）' },
    { value: '淡白', label: '淡白舌（氣虛/血虛）' },
    { value: '紫暗', label: '紫暗舌（血瘀或寒證）' },
    { value: '瘀斑', label: '有瘀斑/瘀點（血瘀）' },
  ]
  const COATING_COLOR_OPTIONS = [
    { value: '薄白苔', label: '薄白苔（健康或輕微寒證）' },
    { value: '白厚苔', label: '白厚苔（痰濕或寒濕）' },
    { value: '黃苔', label: '黃苔（熱證）' },
    { value: '黃厚苔', label: '黃厚苔（濕熱或實熱）' },
    { value: '灰黑苔', label: '灰黑苔（寒濕或熱極）' },
    { value: '少苔/剝苔', label: '少苔或剝苔（陰虛）' },
  ]
  const COATING_TEXTURE_OPTIONS = [
    { value: '濕潤', label: '濕潤（正常或痰濕）' },
    { value: '乾燥', label: '乾燥（熱證或陰虛）' },
    { value: '滑苔', label: '滑苔（水滑感，寒濕）' },
    { value: '糙苔', label: '糙苔（熱盛傷津）' },
  ]
  const TONGUE_MARKS_OPTIONS = [
    { value: '齒痕', label: '齒痕（脾虛濕盛）' },
    { value: '裂紋', label: '裂紋（陰虛或血虛）' },
    { value: '瘀點', label: '瘀點/瘀斑（血瘀）' },
    { value: '潰瘍', label: '潰瘍（熱證）' },
    { value: '無', label: '無特殊標記' },
  ]
  const [tongueFile, setTongueFile] = useState<File | null>(null)
  const [tonguePreview, setTonguePreview] = useState<string | null>(null)
  const [faceFile, setFaceFile] = useState<File | null>(null)
  const [facePreview, setFacePreview] = useState<string | null>(null)
  const [faceInfo, setFaceInfo] = useState<Record<string, unknown> | null>(null)
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultData | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const faceFileRef = useRef<HTMLInputElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  // 雲端同步狀態
  const { data: session } = useSession()
  const [savedRemotely, setSavedRemotely] = useState(false)
  const [saving, setSaving] = useState(false)

  async function saveToCloud() {
    if (!result) return
    setSaving(true)
    try {
      const res = await fetch('/api/diagnoses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tongue_image: '',
          questionnaire: answers,
          tongue_features: { color: (result.tongue as any)?.tongue_color, coating: (result.tongue as any)?.coating_color },
          syndrome: { type: result.constitution.type },
          result: result,
        })
      })
      if (res.ok) setSavedRemotely(true)
    } catch (e) {
      console.error('Failed to save to cloud:', e)
    } finally {
      setSaving(false)
    }
  }

  // 當前問卷題目列表
  const chief = answers.chief || '其他'
  const chiefQuestions: Question[] = FAST_QUESTIONS[chief] || FAST_QUESTIONS['其他'] || []
  const ageNum = parseInt(answers.age || '')
  const isMale = answers.gender === '男'
  const isFemale = answers.gender === '女'
  const excludeMenses = isMale || (!isNaN(ageNum) && (ageNum < 10 || ageNum > 65))
  // 動態過濾性別不合的題目
  const genderFilteredChiefQ = chiefQuestions.filter(q => {
    if (isMale && q.id === 'f_b3') return false // 月經相關，備孕章節中
    if (isMale && q.id === 'f_h3') return false // 頭痛-月經相關問題
    if (excludeMenses && q.id.startsWith('f_m')) return false // 月經章節題目
    return true
  })
  const filteredChiefQ = excludeMenses && chief === '月經' ? [] : genderFilteredChiefQ
  const allDetailedQuestions: Question[] = [...filteredChiefQ, ...DETAILED_EXTRA]
  const currentQuestions: Question[] = mode === 'detailed' ? allDetailedQuestions : filteredChiefQ

  const currentQ = currentQuestions[qIndex] as Question | undefined
  const totalQ = currentQuestions.length
  const progress = totalQ > 0 ? ((qIndex + 1) / totalQ) * 100 : 0

  const handleAnswer = useCallback((value: string) => {
    if (!currentQ) return
    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)
    setCustomInput('')
    setTimeout(() => {
      if (qIndex < totalQ - 1) {
        setQIndex(qIndex + 1)
      } else {
        setStep('tongue')
      }
    }, 350)
  }, [answers, qIndex, currentQ, totalQ])

  const handleInputSubmit = useCallback(() => {
    if (!customInput.trim() || !currentQ) return
    const newAnswers = { ...answers, [currentQ.id]: customInput }
    setAnswers(newAnswers)
    setCustomInput('')
    setTimeout(() => {
      if (qIndex < totalQ - 1) {
        setQIndex(qIndex + 1)
      } else {
        setStep('tongue')
      }
    }, 350)
  }, [answers, qIndex, customInput, currentQ, totalQ])

  const handleTongueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTongueFile(file)
    setImageLoaded(true) // createObjectURL is synchronous, preview always works
    const preview = URL.createObjectURL(file)
    setTonguePreview(preview)
  }

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFaceFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFacePreview(ev.target?.result as string)
  }

  const handleFreeSearch = async () => {
    if (!freeText.trim()) return
    setFreeSearchLoading(true)
    setFreeSearchResult({ loading: '正在搜尋中醫資料庫...' })
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: freeText.trim(),
          answers: freeSearchAnswers,
        }),
      })
      const data = await res.json()
      if (!data.ok && !data.answer) {
        setFreeSearchResult({ error: data.error || '搜尋失敗，請稍後再試' })
      } else {
        setFreeSearchResult(data)
        if (data.done) {
          setStep('result')
          setResult(data.result as ResultData)
        } else {
          setFreeSearchMode(data.followup_questions?.length > 0 ? 'questionnaire' : 'input')
        }
      }
    } catch (e) {
      setFreeSearchResult({ error: '網路錯誤，請檢查連線後再試' })
    } finally {
      setFreeSearchLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Call backend API for TCM analysis (uses 54-syndrome knowledge base)
      let backendResult: ReturnType<typeof analyzeCondition> | null = null
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            chief: answers.chief || '',
            // Enrich with tongue/face features + demographics
            tongue_features: { ...tongueGuideAnswers },
            face_features: faceInfo,
            gender: answers.gender,
            age: answers.age,
            language: locale,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.ok && data.result) {
            // Defensive: guard against unexpected backend response shapes
            const raw = data.result
            if (raw && typeof raw === 'object') {
              backendResult = ('type' in raw ? raw : raw.constitution) || null
            }
          }
        }
      } catch (e) {
        console.warn('Backend API unavailable, using local analysis:', e)
      }

      // Fall back to local analysis if backend unavailable
      const constitution = backendResult || analyzeCondition(answers)

      let tongueInfo: Record<string, unknown> | undefined
      if (tongueFile) {
        const formData = new FormData()
        formData.append('image', tongueFile)
        try {
          const res = await fetch('/api/tongue', { method: 'POST', body: formData })
          if (res.ok) tongueInfo = await res.json()
        } catch { /* silent */ }
      }
      let faceResult: Record<string, unknown> | undefined
      if (faceFile) {
        const formData2 = new FormData()
        formData2.append('image', faceFile)
        try {
          const res = await fetch('/api/face', { method: 'POST', body: formData2 })
          if (res.ok) faceResult = await res.json()
        } catch { /* silent */ }
      }
      setResult({ constitution, tongue: tongueInfo, face: faceResult, questionnaire_answers: answers, savedAt: new Date().toISOString(), tongueGuide: tongueGuideAnswers })
      setStep('result')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMode(null); setStep('mode'); setQIndex(0); setAnswers({})
    setCustomInput(''); setTongueFile(null); setTonguePreview(null)
    setFaceFile(null); setFacePreview(null); setFaceInfo(null); setShowFaceCapture(false)
    setResult(null); setImageLoaded(false)
    setReportFile(null); setReportPreview(null)
  }

  const isLastQ = qIndex === totalQ - 1

  // 選項按鈕渲染
  const renderOptions = (q: Question) => {
    if (!q.options) return null
    return q.options.map(opt => {
      const isSelected = answers[q.id] === opt.value
      return (
        <button
          key={opt.value}
          onClick={() => handleAnswer(opt.value)}
          className="w-full px-5 py-4 rounded-xl text-left text-sm transition-all duration-200"
          style={{
            background: isSelected ? 'rgba(44,74,62,0.08)' : '#FFFFFF',
            border: isSelected ? '1px solid #2C4A3E' : '1px solid #E5E2DA',
            color: isSelected ? '#2C4A3E' : '#3A3A32',
            fontWeight: isSelected ? '500' : '400',
            boxShadow: isSelected ? '0 1px 6px rgba(44,74,62,0.08)' : '0 1px 3px rgba(44,74,62,0.03)',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#A3B5A0'; e.currentTarget.style.background = '#FAFAF7' } }}
          onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#E5E2DA'; e.currentTarget.style.background = '#FFFFFF' } }}
        >
          {opt.label}
        </button>
      )
    })
  }

  return (
    <div className="min-h-screen text-stone-800" style={{ background: '#FAFAF7', fontFamily: "'Noto Serif TC', serif", fontSize: fontScale === 100 ? '17px' : fontScale === 115 ? '19px' : '21px' }}>
      <Head><title>{t('header.title')} | TCM AI</title></Head>

      {/* Header — Apple Zen Navigation Bar */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', height: '44px', padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left — TCMAI Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img
              src="/tcmai-logo.jpg"
              alt="TCMAI"
              style={{ width: '28px', height: 'auto', display: 'block' }}
            />
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#1C2C24', letterSpacing: '-0.01em' }}>
              {t('header.title')}
            </span>
          </a>

          {/* Right — Apple-style hamburger dropdown */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            {/* Hamburger / menu icon button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}
              aria-label="Menu"
            >
              <span style={{ display: 'block', width: '18px', height: '1.5px', background: '#1C2C24', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
              <span style={{ display: 'block', width: '18px', height: '1.5px', background: '#1C2C24', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: '18px', height: '1.5px', background: '#1C2C24', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                width: '220px',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E2DA',
                boxShadow: '0 8px 32px rgba(44,74,62,0.12)',
                overflow: 'hidden',
                zIndex: 100,
              }}>
                {/* Font size */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E2DA' }}>
                  <p style={{ fontSize: '11px', color: '#A3B5A0', letterSpacing: '0.08em', marginBottom: '8px' }}>字體大小</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => setFontScale(Math.max(100, fontScale - 15))}
                      style={{ background: 'none', border: '1px solid #E5E2DA', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '12px', color: '#1C2C24' }}>
                      A
                    </button>
                    <span style={{ fontSize: '11px', color: '#8B6E5A', minWidth: '30px', textAlign: 'center' }}>{fontScale}%</span>
                    <button onClick={() => setFontScale(Math.min(160, fontScale + 15))}
                      style={{ background: 'none', border: '1px solid #E5E2DA', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', color: '#1C2C24' }}>
                      A
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #E5E2DA' }}>
                  <p style={{ fontSize: '11px', color: '#A3B5A0', letterSpacing: '0.08em', marginBottom: '6px' }}>語言</p>
                  <LanguageSelector currentLocale={locale} />
                </div>

                {/* Menu items */}
                {[
                  { label: '關於中醫AI', href: '/#about', icon: 'ℹ️' },
                  { label: '常見問題', href: '/#faq', icon: '❓' },
                  { label: '醫療免責聲明', href: '/#disclaimer', icon: '⚠️' },
                ].map(item => (
                  <a key={item.label} href={item.href}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', textDecoration: 'none', color: '#1C2C24', fontSize: '13px', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span>{item.icon}</span>
                    {item.label}
                  </a>
                ))}

                <div style={{ borderTop: '1px solid #E5E2DA', padding: '8px 16px' }}>
                  <Link href="/login"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', textDecoration: 'none', color: '#2C4A3E', fontSize: '13px', fontWeight: 500 }}
                    onClick={() => setMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#2C4A3E' }}>
                      <path d="M7 6.5C5.9 6.5 5 7.4 5 8.5s.9 2 2 2 2-.9 2-2-.9-2-2-2zM9.5 3.5H4.5C4 3.5 3.5 4 3.5 4.5V5.5h7V4.5C10.5 4 10 3.5 9.5 3.5zM3.5 8.5h7V7H3.5v1.5zM2 9.5L1 11v2.5h12V11l-1-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    登入 / 註冊
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* ── 模式選擇 ── */}
      {step === 'mode' && (
        <main className="max-w-2xl mx-auto px-6 pt-20 pb-20 min-h-[90vh] flex flex-col justify-center">

          {/* ── Hero — Apple Zen with TCM imagery ── */}
          <div className="text-center mb-14">
            {/* Decorative TCM illustration — abstract bamboo/leaves SVG */}
            <div className="flex justify-center mb-8">
              <svg width="120" height="60" viewBox="0 0 120 60" fill="none" style={{ opacity: 0.7 }}>
                {/* Left bamboo stalks */}
                <line x1="20" y1="60" x2="20" y2="10" stroke="#A3B5A0" strokeWidth="1.2"/>
                <ellipse cx="20" cy="45" rx="6" ry="2.5" fill="none" stroke="#A3B5A0" strokeWidth="0.8"/>
                <ellipse cx="20" cy="30" rx="6" ry="2.5" fill="none" stroke="#A3B5A0" strokeWidth="0.8"/>
                <ellipse cx="20" cy="15" rx="6" ry="2.5" fill="none" stroke="#A3B5A0" strokeWidth="0.8"/>
                {/* Left leaves */}
                <path d="M20 30 Q10 25 5 30 Q10 35 20 30Z" fill="#A3B5A0" opacity="0.5"/>
                <path d="M20 20 Q10 15 5 20 Q10 25 20 20Z" fill="#A3B5A0" opacity="0.4"/>
                <path d="M20 40 Q10 35 5 40 Q10 45 20 40Z" fill="#A3B5A0" opacity="0.3"/>
                {/* Right bamboo stalks */}
                <line x1="100" y1="60" x2="100" y2="5" stroke="#A3B5A0" strokeWidth="1.2"/>
                <ellipse cx="100" cy="50" rx="6" ry="2.5" fill="none" stroke="#A3B5A0" strokeWidth="0.8"/>
                <ellipse cx="100" cy="35" rx="6" ry="2.5" fill="none" stroke="#A3B5A0" strokeWidth="0.8"/>
                <ellipse cx="100" cy="20" rx="6" ry="2.5" fill="none" stroke="#A3B5A0" strokeWidth="0.8"/>
                <ellipse cx="100" cy="8" rx="6" ry="2.5" fill="none" stroke="#A3B5A0" strokeWidth="0.8"/>
                {/* Right leaves */}
                <path d="M100 35 Q110 30 115 35 Q110 40 100 35Z" fill="#A3B5A0" opacity="0.5"/>
                <path d="M100 20 Q110 15 115 20 Q110 25 100 20Z" fill="#A3B5A0" opacity="0.4"/>
                <path d="M100 50 Q110 45 115 50 Q110 55 100 50Z" fill="#A3B5A0" opacity="0.3"/>
                {/* Center YinYang */}
                <circle cx="60" cy="35" r="14" stroke="#2C4A3E" strokeWidth="0.8" fill="none"/>
                <path d="M60 21 Q66 28 60 35 Q54 42 60 49" stroke="#2C4A3E" strokeWidth="0.8" fill="none"/>
                <path d="M60 49 Q54 42 60 35 Q66 28 60 21" stroke="#8B6E5A" strokeWidth="0.8" fill="none"/>
                <circle cx="60" cy="27" r="2.5" fill="#8B6E5A"/>
                <circle cx="60" cy="43" r="2.5" fill="#2C4A3E"/>
              </svg>
            </div>

            <h2 className="text-5xl font-light mb-3" style={{ color: '#1C2C24', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              {t('header.title')}
            </h2>
            <p className="text-lg font-light mb-1" style={{ color: '#8B6E5A', letterSpacing: '0.03em' }}>
              2分鐘了解你的體質
            </p>
            <p className="text-sm" style={{ color: '#A3B5A0', letterSpacing: '0.02em' }}>
              中醫智慧 · 量身調理
            </p>
          </div>

          {/* ── Improved Step Indicator (P0-2) ── */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[
              { n: '壹', title: '填寫問卷' },
              { n: '貳', title: '舌象拍攝' },
              { n: '參', title: 'AI 分析' },
            ].map((item, idx) => (
              <div key={item.n} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #E5E2DA',
                      color: '#A3B5A0',
                    }}>
                    {item.n}
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#A3B5A0', letterSpacing: '0.04em' }}>{item.title}</p>
                </div>
                {idx < 2 && <div style={{ width: '32px', height: '1px', background: '#E5E2DA', marginBottom: '16px' }} />}
              </div>
            ))}
          </div>

          {/* ── Free Text Search Input (快速輸入) ── */}
          <div className="mb-8 p-5 rounded-2xl" style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.15)' }}>
            <p className="text-xs mb-3" style={{ color: '#4A7C6A', letterSpacing: '0.08em' }}>自由輸入·AI 智能搜尋</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                placeholder="例如：容易疲勞、晚上睡不好、胃口差"
                className="flex-1 px-4 py-3 rounded-xl text-sm"
                style={{ 
                  border: '1px solid #D4E0D6',
                  background: '#FFFFFF',
                  color: '#1C2C24',
                  outline: 'none',
                  letterSpacing: '0.02em',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#2C4A3E'}
                onBlur={e => e.currentTarget.style.borderColor = '#D4E0D6'}
                onKeyDown={e => { if (e.key === 'Enter') handleFreeSearch() }}
              />
              <button
                onClick={handleFreeSearch}
                className="px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ 
                  background: freeText.trim() ? '#2C4A3E' : '#E5E2DA',
                  color: freeText.trim() ? '#FFFFFF' : '#A3B5A0',
                }}
                disabled={!freeText.trim() || freeSearchLoading}
              >
                {freeSearchLoading ? '分析中...' : '搜尋'}
              </button>
            </div>
            {freeSearchResult && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E5E2DA' }}>
                {freeSearchResult.loading ? (
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#8B6E5A' }}>
                    <span>🔍</span> {freeSearchResult.loading}
                  </div>
                ) : (
                  <>
                    {freeSearchResult.need_followup ? (
                      <div>
                        <p className="text-sm font-medium mb-2" style={{ color: '#2C4A3E' }}>{freeSearchResult.answer}</p>
                        <div className="space-y-2">
                          {freeSearchMode === 'questionnaire' && freeSearchResult.followup_questions?.map((q, i) => (
                            <div key={i} className="mt-3">
                              <p className="text-sm font-medium mb-3" style={{ color: '#2C4A3E' }}>{q.text}</p>
                              <div className="space-y-2">
                                {q.options.map(opt => (
                                  <button key={opt.value}
                                    onClick={() => {
                                      const newAnswers = { ...freeSearchAnswers, [q.id]: opt.value }
                                      setFreeSearchAnswers(newAnswers)
                                      setFreeText(opt.label)
                                      handleFreeSearch()
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                    style={{
                                      background: freeSearchAnswers[q.id] === opt.value ? 'rgba(44,74,62,0.10)' : 'rgba(44,74,62,0.04)',
                                      border: freeSearchAnswers[q.id] === opt.value ? '1px solid #2C4A3E' : '1px solid #E5E2DA',
                                      color: freeSearchAnswers[q.id] === opt.value ? '#2C4A3E' : '#3A3A32',
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                              {freeSearchResult.context?.suspected_syndromes && freeSearchResult.context.suspected_syndromes.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                  {freeSearchResult.context.suspected_syndromes.map(s => (
                                    <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                                      style={{ background: 'rgba(139,110,90,0.10)', color: '#8B6E5A' }}>
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium mb-2" style={{ color: '#2C4A3E' }}>{freeSearchResult.answer}</p>
                        {freeSearchResult.findings?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs" style={{ color: '#A3B5A0', letterSpacing: '0.06em' }}>📚 相關內容</p>
                            {freeSearchResult.findings.slice(0, 3).map((f, i) => (
                              <div key={i} className="text-xs p-2.5 rounded-lg" style={{ background: '#FAFAF7', color: '#4A4A42', lineHeight: 1.6 }}>{f.text?.slice(0, 200)}</div>
                            ))}
                          </div>
                        )}
                        {freeSearchResult.suggested_syndromes?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {freeSearchResult.suggested_syndromes.map(s => (
                              <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,110,90,0.10)', color: '#8B6E5A' }}>{s}</span>
                            ))}
                          </div>
                        )}
                        {freeSearchResult.from_graphdb?.herbs?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs mb-1" style={{ color: '#A3B5A0' }}>🌿 建議中藥</p>
                            <div className="flex flex-wrap gap-1">
                              {freeSearchResult.from_graphdb.herbs.map(h => (
                                <span key={h.name || h} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,124,106,0.10)', color: '#4A7C6A' }}>{h.name || h}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {freeSearchResult.treatment && (
                          <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(74,124,106,0.05)', border: '1px solid #D4E0D6' }}>
                            <p className="text-xs font-medium" style={{ color: '#2C4A3E' }}>💊 治療建議</p>
                            <p className="text-xs mt-1" style={{ color: '#4A4A42' }}>證型：{freeSearchResult.treatment.syndrome}</p>
                            {freeSearchResult.treatment.suggested_formulas?.length > 0 && (
                              <p className="text-xs mt-1" style={{ color: '#8B6E5A' }}>建議方劑：{freeSearchResult.treatment.suggested_formulas.join(' / ')}</p>
                            )}
                          </div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => { setMode('fast'); setStep('questionnaire'); setQIndex(0) }}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                            style={{ background: '#2C4A3E', color: '#FFFFFF' }}
                          >
                            開始完整問卷
                          </button>
                          <button
                            onClick={() => { setFreeText(''); setFreeSearchResult(null) }}
                            className="text-xs px-3 py-1.5 rounded-lg"
                            style={{ border: '1px solid #E5E2DA', color: '#A3B5A0' }}
                          >
                            清除
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <p className="text-xs mt-2" style={{ color: '#A3B5A0' }}>
              直接描述您的症狀，AI 會搜尋中醫資料庫為您分析
            </p>
          </div>

          {/* ── Mode Cards — with CTA label ── */}
          <div className="space-y-2 mb-10">
            <button onClick={() => { setMode('fast'); setStep('basic') }}
              className="w-full rounded-xl px-5 py-4 text-left transition-all duration-200"
              style={{ background: '#FFFFFF', border: '1px solid #E5E2DA' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2C4A3E'; e.currentTarget.style.background = '#FAFAF7' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DA'; e.currentTarget.style.background = '#FFFFFF' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: '#4A7C6A' }}>
                    <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  <div>
                    <p className="text-base font-medium" style={{ color: '#1C2C24', letterSpacing: '0.02em' }}>{t('mode.fast')}</p>
                    <p className="text-sm" style={{ color: '#8B6E5A' }}>{t('mode.fastDesc')}</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#C5D4C0' }}>
                  <path d="M4 8h8M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            <button onClick={() => { setMode('detailed'); setStep('basic') }}
              className="w-full rounded-xl px-5 py-4 text-left transition-all duration-200"
              style={{ background: '#FFFFFF', border: '1px solid #E5E2DA' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2C4A3E'; e.currentTarget.style.background = '#FAFAF7' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DA'; e.currentTarget.style.background = '#FFFFFF' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: '#4A7C6A' }}>
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M10 5.5v5l3.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <p className="text-base font-medium" style={{ color: '#1C2C24', letterSpacing: '0.02em' }}>{t('mode.detailed')}</p>
                    <p className="text-sm" style={{ color: '#8B6E5A' }}>{t('mode.detailedDesc')}</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#C5D4C0' }}>
                  <path d="M4 8h8M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            <button onClick={() => { setMode('smart'); setStep('basic') }}
              className="w-full rounded-xl px-5 py-4 text-left transition-all duration-200"
              style={{ background: '#FFFFFF', border: '1px solid #DDD5C8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B6E5A'; e.currentTarget.style.background = '#FAFAF7' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDD5C8'; e.currentTarget.style.background = '#FFFFFF' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: '#8B6E5A' }}>
                    <path d="M10 2C10 2 5 6.5 5 11a5 5 0 0010 0C15 6.5 10 2 10 2z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <circle cx="10" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium" style={{ color: '#1C2C24', letterSpacing: '0.02em' }}>智能問診</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,110,90,0.10)', color: '#8B6E5A' }}>實驗</span>
                    </div>
                    <p className="text-sm" style={{ color: '#8B6E5A' }}>勾選所有症狀，AI一次性分析</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#C5B8A8' }}>
                  <path d="M4 8h8M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>

          {/* ── Social Proof Counter ── */}
          <div className="text-center mb-8">
            <p className="text-xs" style={{ color: '#A3B5A0', letterSpacing: '0.06em' }}>
              已幫助 <span style={{ color: '#2C4A3E', fontWeight: 500 }}>{helpedCount.toLocaleString()}</span> 人了解自己的體質
            </p>
          </div>

          {/* ── Testimonials Carousel (P0-1) ── */}
          <div className="mb-8">
            <div
              className="rounded-2xl px-5 py-5 relative"
              style={{ background: '#FAFAF7', border: '1px solid #E5E2DA', minHeight: '120px' }}
            >
              {/* Testimonials data */}
              {[
                { text: '做了分析才知道自己是氣虛體質，照著建議調整了一個月，明顯覺得精神好多了。', author: '台北，陳小姐，42歲', rating: 5 },
                { text: '中醫師看完我的報告說很準！特別是氣鬱那一段，完全說中我的狀態。', author: '香港，周先生，35歲', rating: 5 },
                { text: '舌象拍攝功能很酷，沒想到看中醫也能那麼科技感，而且中藥建議真的適合我的體質。', author: '新加坡，林小姐，28歲', rating: 5 },
              ].map((t, idx) => (
                <div key={idx} style={{ display: idx === testimonialIndex ? 'block' : 'none', textAlign: 'center' }}>
                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <svg key={si} width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5l3.5-.5L6 1z" fill="#8B6E5A"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: '#4A4A42', lineHeight: 1.8 }}>
                    「{t.text}」
                  </p>
                  <p className="text-xs" style={{ color: '#A3B5A0' }}>— {t.author}</p>
                </div>
              ))}

              {/* Carousel dots */}
              <div className="flex justify-center gap-2 mt-4">
                {[0, 1, 2].map(idx => (
                  <button key={idx}
                    onClick={() => setTestimonialIndex(idx)}
                    style={{
                      width: testimonialIndex === idx ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: testimonialIndex === idx ? '#2C4A3E' : '#E5E2DA',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Privacy + Medical Disclaimer ── */}
          <div className="rounded-2xl px-4 py-3.5 mb-6"
            style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.08)' }}>
            <div className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#2C4A3E', marginTop: '1px', flexShrink: 0 }}>
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M7 4.5v2.5M7 9v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: '#4A4A42', lineHeight: 1.7 }}>
                本系統內容僅供健康參考，不構成醫療建議、診斷或治療。AI 分析結果可能與專業中醫師判斷有所不同。如有健康疑慮，請諮詢合資格的中醫師或醫療專業人員。
              </p>
            </div>
          </div>

          <FaqAccordion />
        </main>
      )}      {/* ── 基本資料 ── */}
      {step === 'basic' && BASIC_QUESTIONS[qIndex] && (
        <main className="max-w-2xl mx-auto px-6 pt-20 pb-16 min-h-[80vh] flex flex-col justify-center">

          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div style={{ width: '28px', height: '1px', background: '#E5E2DA' }} />
              <p className="text-xs tracking-widest" style={{ color: '#A3B5A0', letterSpacing: '0.18em' }}>基本資料</p>
              <div style={{ width: '28px', height: '1px', background: '#E5E2DA' }} />
            </div>
            <p className="text-base" style={{ color: '#8B6E5A' }}>
              {mode === 'fast' ? t('mode.fast') : mode === 'detailed' ? t('mode.detailed') : '智能問診'} · 協助精準判斷
            </p>
          </div>

          {(() => {
            const q = BASIC_QUESTIONS[qIndex]
            if (q.type === 'input_number') {
              const isHeight = q.id === 'height'
              return (
                <div className="space-y-4">
                  {q.groupLabel && <p className="text-xs text-center mb-1" style={{ color: '#A3B5A0', letterSpacing: '0.12em' }}>{q.groupLabel}</p>}
                  <h2 className="text-3xl font-light text-center mb-10" style={{ color: '#1C2C24', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{q.text}</h2>
                  <NumberInputWithUnit
                    value={answers[q.id] || ''}
                    onChange={v => setAnswers({ ...answers, [q.id]: v })}
                    placeholder={q.placeholder || ''}
                    isHeight={isHeight}
                  />
                  <button onClick={() => {
                    if (qIndex < BASIC_QUESTIONS.length - 1) setQIndex(qIndex + 1)
                    else (mode === 'smart' ? setStep('smart') : setStep('chief'))
                  }}
                    className="w-full py-4 rounded-2xl font-medium text-base transition-all duration-300"
                    style={{ background: '#1C2C24', color: '#FAFAF7', letterSpacing: '0.04em' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2C4A3E'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1C2C24'}>
                    確定
                  </button>
                  <button onClick={() => {
                    if (qIndex < BASIC_QUESTIONS.length - 1) setQIndex(qIndex + 1)
                    else (mode === 'smart' ? setStep('smart') : setStep('chief'))
                  }}
                    className="w-full py-3 text-sm transition-all duration-300"
                    style={{ color: '#A3B5A0' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#8B6E5A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#A3B5A0'}>
                    跳過（選填）
                  </button>
                  {qIndex > 0 && <button onClick={() => setQIndex(qIndex - 1)}
                    className="text-xs transition-all duration-300"
                    style={{ color: '#A3B5A0' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#8B6E5A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#A3B5A0'}>
                    ← 上一題
                  </button>}
                </div>
              )
            }
            return (
              <div className="space-y-3">
                <h2 className="text-3xl font-light text-center mb-10" style={{ color: '#1C2C24', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{q.text}</h2>
                {q.options && q.options.map(opt => (
                  <button key={opt.value} onClick={() => {
                    const newA = { ...answers, [q.id]: opt.value }
                    setAnswers(newA)
                    setTimeout(() => {
                      if (qIndex < BASIC_QUESTIONS.length - 1) setQIndex(qIndex + 1)
                      else (mode === 'smart' ? setStep('smart') : setStep('chief'))
                    }, 350)
                  }}
                    className="w-full py-4 px-5 rounded-2xl text-left text-base transition-all duration-300"
                    style={{
                      background: answers[q.id] === opt.value ? 'rgba(44,74,62,0.08)' : '#FFFFFF',
                      border: answers[q.id] === opt.value ? '1px solid #2C4A3E' : '1px solid #E5E2DA',
                      color: answers[q.id] === opt.value ? '#2C4A3E' : '#1C2C24',
                      fontWeight: answers[q.id] === opt.value ? '500' : '400',
                      letterSpacing: '0.02em',
                    }}
                    onMouseEnter={e => { if (answers[q.id] !== opt.value) { e.currentTarget.style.borderColor = '#A3B5A0'; e.currentTarget.style.background = '#FAFAF7' } }}
                    onMouseLeave={e => { if (answers[q.id] !== opt.value) { e.currentTarget.style.borderColor = '#E5E2DA'; e.currentTarget.style.background = '#FFFFFF' } }}>
                    {opt.label}
                  </button>
                ))}
                {q.hasCustomAgeInput && (
                  <div className="mt-5 pt-5" style={{ borderTop: '1px solid #E5E2DA' }}>
                    <p className="text-xs text-center mb-3" style={{ color: '#A3B5A0' }}>或直接輸入年齡</p>
                    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 transition"
                      style={{ border: '1px solid #E5E2DA' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#2C4A3E'}
                      onBlur={e => e.currentTarget.style.borderColor = '#E5E2DA'}>
                      <input type="number" placeholder="例：35"
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="flex-1 outline-none text-base" style={{ color: '#1C2C24' }} />
                      <span className="text-sm" style={{ color: '#A3B5A0' }}>歲</span>
                    </div>
                    <button onClick={() => {
                      if (qIndex < BASIC_QUESTIONS.length - 1) setQIndex(qIndex + 1)
                      else (mode === 'smart' ? setStep('smart') : setStep('chief'))
                    }}
                      className="w-full py-3 mt-3 rounded-2xl text-sm transition-all duration-300"
                      style={{ background: '#F0EDE6', color: '#7A7A6A' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#E5E2DA'; e.currentTarget.style.color = '#4A4A42' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F0EDE6'; e.currentTarget.style.color = '#7A7A6A' }}>
                      確定
                    </button>
                  </div>
                )}
                <button onClick={() => setQIndex(qIndex - 1)}
                  className="text-xs transition-all duration-300"
                  style={{ color: '#A3B5A0' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#8B6E5A'}
                  onMouseLeave={e => e.currentTarget.style.color = '#A3B5A0'}>
                  ← 上一題
                </button>
              </div>
            )
          })()}
        </main>
      )}      {step === 'chief' && (
        <main className="max-w-2xl mx-auto px-6 pt-20 pb-16 min-h-[80vh] flex flex-col justify-center">

          <div className="text-center mb-12">
            <p className="text-xs tracking-widest mb-3" style={{ color: '#A3B5A0', letterSpacing: '0.20em' }}>第 1 步</p>
            <h2 className="text-4xl font-light mb-3" style={{ color: '#1C2C24', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
              您今天想改善什麼？
            </h2>
            <p className="text-base" style={{ color: '#8B6E5A' }}>選一項，AI為您量身問診</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { value: '調養', label: '調養身體', desc: '健康保養', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4C12 4 7 9 7 13.5a5 5 0 0010 0C17 9 12 4 12 4z" stroke="#4A7C6A" strokeWidth="1.2" fill="none"/><path d="M12 9v3M10 13h4" stroke="#4A7C6A" strokeWidth="1.2" strokeLinecap="round"/></svg> },
              { value: '減肥', label: '減肥控重', desc: '體重管理', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#8B6E5A" strokeWidth="1.2"/><path d="M12 8v8M8 12h8" stroke="#8B6E5A" strokeWidth="1.2" strokeLinecap="round"/></svg> },
              { value: '失眠', label: '失眠問題', desc: '入睡困難', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 3L14 6M5.5 6.5L7 8M4 12h3M17 12h3M5.5 17.5L7 16M14 18v3" stroke="#4A7C6A" strokeWidth="1.2" strokeLinecap="round"/><path d="M12 8C9.5 8 7.5 10 7.5 12.5S9.5 17 12 17s4.5-2 4.5-4.5" stroke="#4A7C6A" strokeWidth="1.2" strokeLinecap="round"/></svg> },
              { value: '情緒', label: '情緒壓力', desc: '焦慮抑鬱', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#8B6E5A" strokeWidth="1.2"/><path d="M9 10c1-1 2.2-1.5 3 0M14.5 12.5c0 1.5-1.5 2.5-2.5 2.5" stroke="#8B6E5A" strokeWidth="1.2" strokeLinecap="round"/></svg> },
              { value: '疼痛', label: '腰酸關節痛', desc: '慢性疼痛', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 12h12M12 6v12" stroke="#8B6E5A" strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="12" r="3.5" stroke="#8B6E5A" strokeWidth="1.2"/></svg> },
              { value: '過敏', label: '過敏鼻炎', desc: '鼻皮膚', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M7 9l5-4 5 4M5 15h14" stroke="#4A7C6A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { value: '皮膚', label: '皮膚問題', desc: '濕疹痘痘', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="8" ry="6" stroke="#4A7C6A" strokeWidth="1.2" transform="rotate(-20 12 12)"/><circle cx="9" cy="11" r="1.2" fill="#4A7C6A"/><circle cx="14" cy="14" r="1.2" fill="#4A7C6A"/></svg> },
              { value: '月經', label: '月經婦科', desc: '經期調理', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#B5A0A0" strokeWidth="1.2"/><circle cx="12" cy="12" r="4" stroke="#B5A0A0" strokeWidth="1.2"/></svg>, femaleOnly: true },
              { value: '備孕', label: '備孕調理', desc: '不孕孕前', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4C12 4 7 9 7 14a5 5 0 0010 0C17 9 12 4 12 4z" stroke="#B5A0A0" strokeWidth="1.2" fill="none"/><path d="M9 14c0 1.5 1.5 2.5 3 2.5" stroke="#B5A0A0" strokeWidth="1.2" strokeLinecap="round"/></svg>, femaleOnly: true },
            ].map(c => {
              if (c.femaleOnly && answers.gender === '男') return null
              const isActive = answers.chief === c.value
              return (
                <button key={c.value}
                  onClick={() => { setAnswers({ ...answers, chief: c.value }); setStep('questionnaire'); setQIndex(0) }}
                  className="py-7 px-4 rounded-2xl text-center transition-all duration-300 active:scale-95"
                  style={{
                    background: isActive ? 'rgba(44,74,62,0.08)' : '#FFFFFF',
                    border: isActive ? '1.5px solid #2C4A3E' : '1px solid #E5E2DA',
                    boxShadow: isActive ? '0 4px 20px rgba(44,74,62,0.10)' : 'none',
                  }}>
                  <div className="mb-3 flex justify-center">{c.icon}</div>
                  <p className="text-base font-medium mb-0.5" style={{ color: isActive ? '#2C4A3E' : '#1C2C24', letterSpacing: '0.02em' }}>{c.label}</p>
                  <p className="text-xs" style={{ color: '#B5C4B8' }}>{c.desc}</p>
                </button>
              )
            })}
          </div>

          <button onClick={() => { setAnswers({ ...answers, chief: '其他' }); setStep('questionnaire'); setQIndex(0) }}
            className="w-full py-4 text-sm rounded-2xl transition-all duration-300"
            style={{ color: '#8B6E5A', border: '1px dashed #C5B8A8', background: 'transparent', letterSpacing: '0.04em' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B6E5A'; e.currentTarget.style.background = 'rgba(139,110,90,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#C5B8A8'; e.currentTarget.style.background = 'transparent' }}>
            + 其他健康問題
          </button>
        </main>
      )}      {step === 'smart' && (
        <main className="max-w-2xl mx-auto px-6 pt-20 pb-28 min-h-[80vh]">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(139,110,90,0.10)' }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1C6 1 2.5 4 2.5 6.5a3.5 3.5 0 007 0C9.5 4 6 1 6 1z" stroke="#8B6E5A" strokeWidth="0.8" fill="none"/><circle cx="6" cy="6.5" r="1.5" stroke="#8B6E5A" strokeWidth="0.8"/></svg>
              <span className="text-xs" style={{ color: '#8B6E5A', letterSpacing: '0.06em' }}>實驗功能</span>
            </div>
            <h2 className="text-4xl font-light mb-3" style={{ color: '#1C2C24', letterSpacing: '-0.01em', lineHeight: 1.15 }}>勾選您有的所有症狀</h2>
            <p className="text-base" style={{ color: '#8B6E5A' }}>可多選，越完整分析越準確</p>
          </div>

          <div className="space-y-4">
            {SMART_SECTIONS.map(section => {
              const selected = smartAnswers[section.id] || []
              return (
                <div key={section.id} className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E2DA' }}>
                  <h3 className="text-base font-medium mb-3 flex items-center gap-2" style={{ color: '#1C2C24', letterSpacing: '0.03em' }}>
                    <span style={{ color: '#A3B5A0' }}>{section.icon}</span> {section.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {section.symptoms.map(symptom => {
                      const isSelected = selected.includes(symptom.value)
                      return (
                        <button key={symptom.value}
                          onClick={() => {
                            const current = smartAnswers[section.id] || []
                            const next = isSelected
                              ? current.filter(v => v !== symptom.value)
                              : [...current, symptom.value]
                            setSmartAnswers({ ...smartAnswers, [section.id]: next })
                          }}
                          className="px-3 py-2 rounded-full text-sm transition-all"
                          style={{
                            background: isSelected ? 'rgba(44,74,62,0.08)' : 'rgba(44,74,62,0.04)',
                            border: isSelected ? '1px solid #2C4A3E' : '1px solid #E5E2DA',
                            color: isSelected ? '#2C4A3E' : '#6A6A5A',
                            fontWeight: isSelected ? '500' : '400',
                          }}>
                          {symptom.label}
                        </button>
                      )
                    })}
                  </div>
                  {selected.length > 0 && (
                    <p className="text-xs mt-2" style={{ color: '#2C4A3E' }}>已選：{selected.length} 項</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-6 py-5 max-w-2xl mx-auto" style={{ background: 'rgba(250,250,247,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(229,226,218,0.6)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: '#A3B5A0' }}>
                已選擇 {Object.values(smartAnswers).flat().length} 項症狀
              </span>
              {Object.values(smartAnswers).flat().length > 0 && (
                <button onClick={() => setSmartAnswers({})}
                  className="text-sm transition-colors"
                  style={{ color: '#A3B5A0' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#8B6E5A'}
                  onMouseLeave={e => e.currentTarget.style.color = '#A3B5A0'}>
                  清除全部
                </button>
              )}
            </div>
            <button
              onClick={() => {
                const flatAnswers: Record<string, string> = {}
                Object.entries(smartAnswers).forEach(([sectionId, values]) => {
                  values.forEach(v => { flatAnswers[`${sectionId}_${v}`] = v })
                })
                flatAnswers.chief = '調養'
                flatAnswers.gender = answers.gender
                flatAnswers.age = answers.age
                setAnswers(flatAnswers)
                setStep('tongue')
              }}
              disabled={Object.values(smartAnswers).flat().length === 0}
              className="w-full py-4 rounded-2xl font-medium text-base transition-all duration-300 disabled:opacity-40"
              style={{ background: Object.values(smartAnswers).flat().length > 0 ? '#1C2C24' : '#C5D4C0', color: '#FAFAF7', letterSpacing: '0.04em', boxShadow: '0 4px 20px rgba(44,74,62,0.15)' }}>
              {Object.values(smartAnswers).flat().length === 0
                ? '請先選擇症狀'
                : `智能分析（${Object.values(smartAnswers).flat().length}項）`}
            </button>
          </div>
        </main>
      )}      {/* ── 動態問卷 ── */}
      {step === 'questionnaire' && currentQ && (
        <main className="max-w-2xl mx-auto px-6 pt-20 pb-16 min-h-[80vh] flex flex-col justify-center">

          <div className="text-center mb-14">
            <div className="flex justify-center gap-1.5 mb-8">
              {currentQuestions.slice(0, 16).map((_, i) => (
                <button key={i} onClick={() => setQIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === qIndex ? '28px' : '6px',
                    height: '6px',
                    background: i === qIndex ? '#2C4A3E' : i < qIndex ? '#A3B5A0' : '#E5E2DA',
                  }} />
              ))}
              {totalQ > 16 && <span className="text-xs self-center ml-1" style={{ color: '#B5C4B8' }}>+{totalQ - 16}</span>}
            </div>

            <p className="text-xs tracking-widest mb-5" style={{ color: '#A3B5A0', letterSpacing: '0.20em' }}>
              {mode === 'detailed' ? '詳細問診' : '快速問診'} · {qIndex + 1} / {totalQ}
            </p>

            <h2 className="text-3xl font-light leading-tight px-2" style={{ color: '#1C2C24', letterSpacing: '-0.01em', lineHeight: 1.35 }}>
              {currentQ.text}
            </h2>
          </div>

          {currentQ.type === 'input_text' ? (
            <div className="space-y-4">
              <textarea value={customInput} onChange={e => setCustomInput(e.target.value)}
                placeholder={currentQ.placeholder} rows={3}
                className="w-full px-5 py-4 rounded-2xl text-base outline-none resize-none transition-colors"
                style={{ background: '#FFFFFF', border: '1px solid #E5E2DA', color: '#1C2C24', letterSpacing: '0.02em' }}
                onFocus={e => { e.target.style.borderColor = '#2C4A3E'; confirmBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
                onBlur={e => e.target.style.borderColor = '#E5E2DA'}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && customInput.trim()) { e.preventDefault(); handleInputSubmit() }}} />
              <button ref={confirmBtnRef} onClick={handleInputSubmit} disabled={!customInput.trim()}
                className="w-full py-4 rounded-2xl font-medium text-base transition-all duration-300 disabled:opacity-40"
                style={{ background: '#1C2C24', color: '#FAFAF7', letterSpacing: '0.04em' }}
                onMouseEnter={e => !customInput.trim() || (e.currentTarget.style.background = '#2C4A3E')}
                onMouseLeave={e => e.currentTarget.style.background = '#1C2C24'}>
                確定
              </button>
              <button onClick={() => { setCustomInput(''); if (qIndex < totalQ - 1) setQIndex(qIndex + 1); else setStep('tongue') }}
                className="w-full py-3 rounded-2xl text-sm transition-all duration-300"
                style={{ background: 'transparent', color: '#A3B5A0', border: '1px solid #E5E2DA' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#A3B5A0'; e.currentTarget.style.color = '#7A7A6A' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DA'; e.currentTarget.style.color = '#A3B5A0' }}>
                跳過（不填）
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {renderOptions(currentQ)}
              <button onClick={() => handleAnswer('其他')}
                className="w-full py-4 rounded-2xl text-sm transition-all duration-300"
                style={{
                  background: answers[currentQ.id] === '其他' ? 'rgba(44,74,62,0.08)' : 'transparent',
                  border: answers[currentQ.id] === '其他' ? '1px solid #2C4A3E' : '1px solid #E5E2DA',
                  color: answers[currentQ.id] === '其他' ? '#2C4A3E' : '#8B6E5A',
                  letterSpacing: '0.03em',
                }}>
                其他（自行描述）
              </button>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between px-1">
            {qIndex > 0 ? (
              <button onClick={() => setQIndex(qIndex - 1)}
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
                style={{ color: '#8B6E5A' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,110,90,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                上一題
              </button>
            ) : (
              <button onClick={() => { setStep('chief'); setQIndex(0) }}
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
                style={{ color: '#8B6E5A' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,110,90,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                重選主訴
              </button>
            )}
            {isLastQ && (
              <button onClick={() => setStep('tongue')}
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
                style={{ color: '#2C4A3E' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(44,74,62,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                跳過
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l4 5-4 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          </div>
        </main>
      )}      {/* ── 舌象引導（選填） ── */}
      {/* tongue_guide step removed — tremor question moved inline in tongue step */}

      {step === 'tongue' && (
        <main className="max-w-2xl mx-auto px-6 pt-20 pb-16 min-h-[70vh] flex flex-col justify-center">

          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div style={{ width: '36px', height: '1px', background: '#E5E2DA' }} />
              <p className="text-xs tracking-widest" style={{ color: '#A3B5A0', letterSpacing: '0.18em' }}>最後一步</p>
              <div style={{ width: '36px', height: '1px', background: '#E5E2DA' }} />
            </div>
            <h2 className="text-4xl font-light mb-3" style={{ color: '#1C2C24', letterSpacing: '-0.01em', lineHeight: 1.15 }}>拍攝舌苔</h2>
            <p className="text-base" style={{ color: '#8B6E5A' }}>舌苔能反映體內寒熱濕燥</p>
          </div>

          {/* ── 舌象拍攝引導（P0-3） ── */}
          <div className="mb-5">
            <button
              onClick={() => setTongueGuideOpen(!tongueGuideOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
              style={{
                background: tongueGuideOpen ? 'rgba(44,74,62,0.04)' : '#FFFFFF',
                border: `1px solid ${tongueGuideOpen ? '#2C4A3E' : '#E5E2DA'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#2C4A3E' }}>
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M8 5v3M8 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="text-sm" style={{ color: '#1C2C24', letterSpacing: '0.02em' }}>
                  如何拍出合格的舌象照片？
                </span>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ color: '#A3B5A0', transform: tongueGuideOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {tongueGuideOpen && (
              <div className="mt-2 rounded-2xl p-4"
                style={{ background: '#FAFAF7', border: '1px solid #E5E2DA' }}>
                
                {/* 四個指引要點 */}
                <div className="space-y-3">
                  {[
                    {
                      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>`,
                      title: '光線要求',
                      desc: '自然光最佳，避免直射陽光或昏暗環境。室內白燈也可以。'
                    },
                    {
                      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C8 2 5 5 5 8.5a3 3 0 006 0C11 5 8 2 8 2z" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="8" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1"/></svg>`,
                      title: '舌頭姿勢',
                      desc: '張嘴伸舌，舌頭自然下垂放鬆，不要緊張或捲曲。'
                    },
                    {
                      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1"/></svg>`,
                      title: '拍攝角度',
                      desc: '舌頭佔畫面主體，水平拍攝，不要俯視或仰視。'
                    },
                    {
                      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 8.5l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
                      title: '避免事項',
                      desc: '避免食物染色舌頭（如咖啡、藍莓），拍攝前漱口。'
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(44,74,62,0.06)' }}
                        dangerouslySetInnerHTML={{ __html: `<div style={{color:'#2C4A3E'}}>${item.icon}</div>` }} />
                      <div>
                        <p className="text-xs font-medium mb-0.5" style={{ color: '#1C2C24' }}>{item.title}</p>
                        <p className="text-xs" style={{ color: '#4A4A42', lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 示範對比圖（用 SVG 示意） */}
                <div className="mt-4 rounded-xl p-3" style={{ background: '#FFFFFF', border: '1px solid #E5E2DA' }}>
                  <p className="text-xs font-medium mb-3" style={{ color: '#1C2C24', letterSpacing: '0.04em' }}>正確 vs 範例</p>
                  <div className="flex gap-3">
                    {/* 正確示例 */}
                    <div className="flex-1 text-center">
                      <div className="rounded-xl overflow-hidden mb-2" style={{ background: '#F5F3EE' }}>
                        <svg width="100%" height="70" viewBox="0 0 100 70" fill="none">
                          <ellipse cx="50" cy="35" rx="28" ry="18" fill="#F5C9C9" stroke="#E5B5B5" strokeWidth="0.8"/>
                          <ellipse cx="50" cy="38" rx="22" ry="12" fill="#F2D0D0"/>
                          <path d="M50 32 Q56 36 50 42 Q44 36 50 32Z" fill="#E8A8A8" opacity="0.6"/>
                          <path d="M22 30 Q50 26 78 30" stroke="#D5C4B5" strokeWidth="0.8" fill="none"/>
                        </svg>
                      </div>
                      <span className="text-xs" style={{ color: '#4A7C6A' }}>✓ 合格</span>
                    </div>
                    {/* 不合格示例 */}
                    <div className="flex-1 text-center">
                      <div className="rounded-xl overflow-hidden mb-2" style={{ background: '#F5F3EE' }}>
                        <svg width="100%" height="70" viewBox="0 0 100 70" fill="none">
                          <ellipse cx="50" cy="35" rx="14" ry="10" fill="#F5C9C9" stroke="#E5B5B5" strokeWidth="0.8"/>
                          <ellipse cx="50" cy="37" rx="10" ry="7" fill="#F2D0D0"/>
                          <circle cx="70" cy="50" r="8" fill="#E8C8A8" stroke="#D4B090" strokeWidth="0.5"/>
                          <path d="M62 42 L78 58" stroke="#E8C8A8" strokeWidth="4" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="text-xs" style={{ color: '#C2544A' }}>✗ 舌頭太小/有遮擋</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 舌苔上傳區域 */}
          <div className="relative rounded-2xl overflow-hidden mb-5"
            style={{ border: tonguePreview ? 'none' : '1.5px dashed #C5B8A8', background: '#FFFFFF' }}>
            {tonguePreview ? (
              <div className="relative">
                <img src={tonguePreview} alt="舌苔預覽" className="w-full object-cover" style={{ aspectRatio: '4/3' }} />
                <div className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#2C4A3E', color: '#FAFAF7' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <button onClick={() => { setTonguePreview(null); setTongueFile(null) }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition"
                  style={{ background: 'rgba(0,0,0,0.45)', color: '#FAFAF7' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
              </div>
            ) : (
              <div className="aspect-[4/3] flex flex-col items-center justify-center cursor-pointer transition"
                style={{ background: '#FAFAF7' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F3EE'}
                onMouseLeave={e => e.currentTarget.style.background = '#FAFAF7'}>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="mb-3" style={{ color: '#A3B5A0' }}>
                  <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                  <path d="M22 9C22 9 14 15.5 14 22a8 8 0 0016 0C30 15.5 22 9 22 9z" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                </svg>
                <p className="text-base font-medium mb-1" style={{ color: '#4A4A42' }}>點擊拍攝 / 選擇檔案</p>
                <p className="text-sm" style={{ color: '#A3B5A0' }}>自然光 · 張嘴伸舌 · 舌頭放鬆</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleTongueUpload} />
            {!tonguePreview && (
              <div onClick={() => fileRef.current?.click()} className="absolute inset-0" />
            )}
          </div>

          <div className="rounded-2xl px-4 py-3.5 mb-5" style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.08)' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#4A4A42' }}>
              <span style={{ color: '#1C2C24', fontWeight: '500' }}>拍攝技巧：</span>自然光或室內光 · 張嘴伸舌自然下垂 · 舌頭佔據畫面主體
            </p>
          </div>

          <div className="rounded-2xl px-4 py-3.5 mb-6"
            style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.08)' }}>
            <div className="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: '#2C4A3E', flexShrink: 0 }}>
                <rect x="2" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/>
                <path d="M4 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <p className="text-sm leading-relaxed" style={{ color: '#4A4A42' }}>
                您的舌苔照片僅用於本次AI分析，不會保存或分享
              </p>
            </div>
          </div>

          {/* 舌頭抖動選項 */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-3" style={{ color: '#1C2C24', letterSpacing: '0.04em' }}>舌頭有沒有抖動？</p>
            <div className="grid grid-cols-2 gap-2">
              {[{value:'無',label:'正常不抖動'},{value:'輕微',label:'輕微顫動'},{value:'明顯',label:'明顯顫動'},{value:'不確定',label:'不確定'}].map(opt => (
                <button key={opt.value}
                  onClick={() => setTongueGuideAnswers(prev => ({...prev, tremor: opt.value}))}
                  className="px-3 py-3 rounded-xl text-sm text-left transition-all"
                  style={{
                    background: tongueGuideAnswers.tremor === opt.value ? 'rgba(44,74,62,0.08)' : '#FFFFFF',
                    border: tongueGuideAnswers.tremor === opt.value ? '1px solid #2C4A3E' : '1px solid #E5E2DA',
                    color: tongueGuideAnswers.tremor === opt.value ? '#2C4A3E' : '#3A3A32',
                    fontWeight: tongueGuideAnswers.tremor === opt.value ? '500' : '400',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {!showFaceCapture ? (
            <button onClick={() => setShowFaceCapture(true)}
              className="w-full py-3.5 rounded-2xl text-sm mb-5 transition-all duration-300"
              style={{ color: '#A3B5A0', border: '1px dashed #C5B8A8', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B6E5A'; e.currentTarget.style.color = '#8B6E5A' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#C5B8A8'; e.currentTarget.style.color = '#A3B5A0' }}>
              + 拍攝面容（面色分析 Beta）
            </button>
          ) : (
            <div className="mb-5">
              <p className="text-sm mb-3" style={{ color: '#8B6E5A', letterSpacing: '0.04em' }}>面色分析（Beta）</p>
              <div className="relative rounded-2xl overflow-hidden"
                style={{ border: facePreview ? 'none' : '1.5px dashed #C5B8A8', background: '#FFFFFF' }}>
                {facePreview ? (
                  <div className="relative">
                    <img src={facePreview} alt="面容預覽" className="w-full object-cover" style={{ aspectRatio: '4/3' }} />
                    <div className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: '#8B6E5A', color: '#FAFAF7' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <button onClick={() => { setFacePreview(null); setFaceFile(null) }}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition"
                      style={{ background: 'rgba(0,0,0,0.45)', color: '#FAFAF7' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex flex-col items-center justify-center cursor-pointer transition"
                    style={{ background: '#FAFAF7' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F3EE'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FAFAF7'}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-2" style={{ color: '#A3B5A0' }}>
                      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                      <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                    </svg>
                    <p className="text-base font-medium mb-1" style={{ color: '#4A4A42' }}>點擊拍攝 / 選擇檔案</p>
                    <p className="text-sm" style={{ color: '#A3B5A0' }}>正面、自然光拍攝</p>
                  </div>
                )}
                <input ref={faceFileRef} type="file" accept="image/*" className="hidden" onChange={handleFaceUpload} />
                {!facePreview && (
                  <div onClick={() => faceFileRef.current?.click()} className="absolute inset-0" />
                )}
              </div>
              <button onClick={() => { setShowFaceCapture(false); setFacePreview(null); setFaceFile(null) }}
                className="w-full py-2.5 mt-2 text-sm transition-all duration-300"
                style={{ color: '#A3B5A0' }}
                onMouseEnter={e => e.currentTarget.style.color = '#8B6E5A'}
                onMouseLeave={e => e.currentTarget.style.color = '#A3B5A0'}>
                取消面容分析
              </button>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 rounded-2xl font-medium text-base transition-all duration-300 disabled:opacity-40"
            style={{ background: loading ? '#2C4A3E' : '#1C2C24', color: '#FAFAF7', letterSpacing: '0.04em', boxShadow: '0 4px 20px rgba(44,74,62,0.15)' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2C4A3E' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1C2C24' }}>
            {loading ? '分析中...' : tongueFile ? '分析舌苔並送出' : '略過舌苔，直接分析'}
          </button>
          {!tongueFile && (
            <button onClick={() => {
              setResult({ constitution: analyzeCondition(answers), questionnaire_answers: answers, savedAt: new Date().toISOString() })
              setStep('result')
            }}
              className="w-full py-3 text-sm mt-2 transition-all duration-300"
              style={{ color: '#A3B5A0' }}
              onMouseEnter={e => e.currentTarget.style.color = '#8B6E5A'}
              onMouseLeave={e => e.currentTarget.style.color = '#A3B5A0'}>
              跳過舌苔分析
            </button>
          )}
        </main>
      )}      {/* ── 結果 ── */}
      {step === 'result' && result && (
        <main className="max-w-2xl mx-auto px-6 pt-16 pb-12">
          {/* ── Medical Disclaimer (P0) ── */}
          <div className="rounded-2xl px-4 py-3.5 mb-6 text-left"
            style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.10)' }}>
            <div className="flex items-start gap-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#2C4A3E', marginTop: '1px', flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: '#2C4A3E', letterSpacing: '0.04em' }}>
                  ⚠️ 醫療免責聲明
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#4A4A42', lineHeight: 1.7 }}>
                  本系統內容僅供健康參考，不構成醫療建議、診斷或治療。AI 分析結果可能與專業中醫師判斷有所不同，請勿取代醫師診療。如有健康疑慮，請諮詢合資格的中醫師或醫療專業人員。
                </p>
              </div>
            </div>
          </div>

          {/* ── Result Header ── */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#2C4A3E" strokeWidth="0.8" fill="none"/>
                <path d="M16 2 Q23 9 16 16 Q9 23 16 30" stroke="#2C4A3E" strokeWidth="0.8" fill="none"/>
                <path d="M16 30 Q9 23 16 16 Q23 9 16 2" stroke="#8B6E5A" strokeWidth="0.8" fill="none"/>
                <circle cx="16" cy="9" r="3" fill="#8B6E5A"/>
                <circle cx="16" cy="23" r="3" fill="#2C4A3E"/>
              </svg>
            </div>
            <p className="text-xs tracking-widest mb-2" style={{ color: '#A3B5A0', letterSpacing: '0.14em' }}>{t('result.title')}</p>
            <h2 className="text-4xl font-light" style={{ color: '#1C2C24', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {result.constitution.type}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#8B6E5A' }}>{result.constitution.sub}</p>
            <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(44,74,62,0.06)', color: '#2C4A3E', letterSpacing: '0.04em', border: '1px solid rgba(44,74,62,0.10)' }}>
              {t('result.pattern')}：{result.constitution.pattern}
            </span>
            {/* 需調理：列出體質分數排行榜 */}
            {result.constitution.type === '需調理' && result.constitution.constitution_scores && (
              <div className="mt-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(139,110,90,0.06)', border: '1px solid rgba(139,110,90,0.12)' }}>
                <p className="text-xs mb-2" style={{ color: '#8B6E5A' }}>體質排行</p>
                <div className="space-y-1.5">
                  {Object.entries(result.constitution.constitution_scores)
                    .sort(([,a],[,b]) => b - a)
                    .slice(0, 6)
                    .map(([type, score]) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-xs w-16" style={{ color: '#4A4A42' }}>{type}</span>
                        <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(44,74,62,0.08)' }}>
                          <div className="rounded-full h-1.5" style={{ width: `${Math.min((score/10)*100,100)}%`, background: score > 3 ? '#2C4A3E' : score > 1 ? '#8B6E5A' : '#A3B5A0' }} />
                        </div>
                        <span className="text-xs w-5 text-right" style={{ color: '#2C4A3E' }}>{score}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 身體狀況摘要 */}
          {(() => {
            const plain = result.constitution.plaintext_summary
            if (plain) {
              return (
                <div className="rounded-2xl px-5 py-5 mb-5"
                  style={{ background: '#FFFFFF', border: '1px solid #E5E2DA' }}>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2"
                    style={{ color: '#1C2C24', letterSpacing: '0.04em' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#2C4A3E' }}>
                      <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    身體狀況摘要
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#4A4A42', lineHeight: 1.8 }}>{plain}</p>
                </div>
              )
            }
            // Fallback for local analysis: short summary
            const s = result.constitution
            const fallbackSummaries: Record<string, string> = {
              '氣虛': `您屬於「氣虛」體質，元氣不足、臟腑功能減退。常見說話無力、容易疲倦、稍動即喘、免疫力較弱。建議健脾益氣，避免過度勞累，適度太極拳、八段錦。`,
              '陰虛': `您屬於「陰虛」體質，陰液不足、虛火內生。常見怕熱、手腳心燙、口乾、盜汗、失眠。建議滋陰清熱，少熬夜，多食百合、銀耳、麥冬。`,
              '陽虛': `您屬於「陽虛」體質，陽氣不足、虛寒內盛。常見怕冷、手腳冰涼、精神倦怠、腰膝酸軟、夜尿頻繁。建議溫陽補腎，忌生冷，熱水泡腳。`,
              '痰濕': `您屬於「痰濕」體質，濕濁內生、痰濕困脾。常見身體沉重、胃口不佳、大便黏膩、口黏。建議燥濕化痰，晚餐7點前，避免甜食油炸。`,
              '氣鬱': `您屬於「氣鬱」體質，肝氣不舒、情緒壓抑。常見易怒焦慮、胸悶、嘆氣多、睡眠不佳。建議疏肝解鬱，保持情緒平穩，每天快走6000步。`,
              '濕熱': `您屬於「濕熱」體質，濕熱內蘊。常見口苦、口乾、小便黃、易長痘。建議清熱利濕，忌辛辣油炸，晚上11點前入睡。`,
              '血瘀': `您屬於「血瘀」體質，血液運行不暢。常見身體刺痛、面色黯沉、唇色暗紫、月經有血塊。建議活血化瘀，多做促進血液循環的運動。`,
              '平和質': `恭喜！您屬於「平和質」，陰陽氣血調和，身體機能平衡。請继续保持規律作息、均衡飲食和適度運動。`,
            }
            const type = s.type || ''
            const fallback = fallbackSummaries[type] || `您的體質屬於「${type}」範疇，建議結合中醫師建議進行個人化調理，平時注意飲食均衡、情緒穩定、充足睡眠。`
            return (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 mb-5">
                <h3 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                  <span>📋</span> 身體狀況摘要
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">{fallback}</p>
              </div>
            )
          })()}

          {result.constitution.suggestions?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-5" style={{ display: resultTab === 'detail' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span>✅</span> {t('result.suggestions')}
              </h3>
              <div className="space-y-2">
                {result.constitution.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 新增：八綱辨證分析 ── */}
          {result.constitution.eight_principles && (
            <div className="rounded-2xl px-5 py-5 mb-4"
              style={{ background: '#FFFFFF', border: '1px solid #E5E2DA', display: resultTab === 'detail' ? 'block' : 'none' }}>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2"
                style={{ color: '#1C2C24', letterSpacing: '0.04em' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#2C4A3E' }}>
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                八綱辨證分析
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '陰陽', value: result.constitution.eight_principles.yin_yang },
                  { label: '表裏', value: result.constitution.eight_principles.exterior_interior },
                  { label: '寒熱', value: result.constitution.eight_principles.cold_heat },
                  { label: '虛實', value: result.constitution.eight_principles.deficiency_excess },
                ].map(item => (
                  <div key={item.label} className="rounded-xl px-3 py-2.5"
                    style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.08)' }}>
                    <p className="text-xs mb-0.5" style={{ color: '#A3B5A0' }}>{item.label}</p>
                    <p className="text-sm font-medium" style={{ color: '#1C2C24' }}>{item.value || '-'}</p>
                  </div>
                ))}
              </div>
              {result.constitution.eight_principles.qi_xue_jinye && (
                <div className="mt-3 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(139,110,90,0.05)', border: '1px solid rgba(139,110,90,0.10)' }}>
                  <p className="text-xs mb-0.5" style={{ color: '#A3B5A0' }}>氣血津液</p>
                  <p className="text-sm" style={{ color: '#4A4A42' }}>{result.constitution.eight_principles.qi_xue_jinye}</p>
                </div>
              )}
            </div>
          )}

          {/* ── 新增：經絡分析 ── */}
          {result.constitution.meridian_analysis && (
            <div className="rounded-2xl px-5 py-5 mb-4"
              style={{ background: '#FFFFFF', border: '1px solid #E5E2DA', display: resultTab === 'detail' || resultTab === 'acupoints' ? 'block' : 'none' }}>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2"
                style={{ color: '#1C2C24', letterSpacing: '0.04em' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#2C4A3E' }}>
                  <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                經絡分析
              </h3>
              {result.constitution.meridian_analysis.affected_meridians?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs mb-2" style={{ color: '#A3B5A0' }}>受影響經絡</p>
                  <div className="flex flex-wrap gap-2">
                    {result.constitution.meridian_analysis.affected_meridians.map((m, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(44,74,62,0.08)', color: '#2C4A3E', border: '1px solid rgba(44,74,62,0.12)' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.constitution.meridian_analysis.imbalance && (
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#4A4A42' }}>
                  {result.constitution.meridian_analysis.imbalance}
                </p>
              )}
              {result.constitution.meridian_analysis.recommended_acupoints?.length > 0 && (
                <div>
                  <p className="text-xs mb-2" style={{ color: '#A3B5A0' }}>建議穴位</p>
                  <div className="flex flex-wrap gap-2">
                    {result.constitution.meridian_analysis.recommended_acupoints.map((a, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(139,110,90,0.08)', color: '#8B6E5A', border: '1px solid rgba(139,110,90,0.12)' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 新增：方劑加減建議 ── */}
          {result.constitution.herbs_adjustment && (
            <div className="rounded-2xl px-5 py-5 mb-4"
              style={{ background: '#FFFFFF', border: '1px solid #E5E2DA', display: resultTab === 'herbs' ? 'block' : 'none' }}>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2"
                style={{ color: '#1C2C24', letterSpacing: '0.04em' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#2C4A3E' }}>
                  <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                方劑加減建議
              </h3>
              <div className="space-y-3">
                {result.constitution.herbs_adjustment.base && (
                  <div className="rounded-xl px-3 py-3"
                    style={{ background: 'rgba(44,74,62,0.06)', border: '1px solid rgba(44,74,62,0.10)' }}>
                    <p className="text-xs mb-1" style={{ color: '#A3B5A0' }}>基本方</p>
                    <p className="text-sm font-medium" style={{ color: '#2C4A3E' }}>{result.constitution.herbs_adjustment.base}</p>
                  </div>
                )}
                {result.constitution.herbs_adjustment.add?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs px-2 py-1 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(44,74,62,0.08)', color: '#2C4A3E' }}>加</span>
                    <p className="text-sm" style={{ color: '#4A4A42' }}>
                      {result.constitution.herbs_adjustment.add.join('、')}
                    </p>
                  </div>
                )}
                {result.constitution.herbs_adjustment.reduce?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs px-2 py-1 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(194,84,74,0.08)', color: '#C2544A' }}>減</span>
                    <p className="text-sm" style={{ color: '#4A4A42' }}>
                      {result.constitution.herbs_adjustment.reduce.join('、')}
                    </p>
                  </div>
                )}
                {result.constitution.herbs_adjustment.reason && (
                  <p className="text-xs leading-relaxed" style={{ color: '#8B6E5A', lineHeight: 1.7 }}>
                    {result.constitution.herbs_adjustment.reason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Result Tabs（P0-4） ── */}
          <div className="mb-5">
            {/* Tab bar */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #E5E2DA' }}>
              {[
                { id: 'detail', label: '體質解讀' },
                { id: 'herbs', label: '中藥建議' },
                { id: 'food', label: '食療方案' },
                { id: 'acupoints', label: '穴位按摩' },
                { id: 'lifestyle', label: '生活調整' },
              ].map(tab => (
                <button key={tab.id}
                  onClick={() => setResultTab(tab.id as any)}
                  className="flex-1 py-2.5 text-xs transition-all"
                  style={{
                    background: resultTab === tab.id ? '#1C2C24' : '#FFFFFF',
                    color: resultTab === tab.id ? '#FAFAF7' : '#8B6E5A',
                    borderRight: tab.id !== 'lifestyle' ? '1px solid #E5E2DA' : 'none',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 能量分析儀表板 ── */}
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-5 border border-stone-200 mb-5" style={{ display: resultTab === 'lifestyle' ? 'block' : 'none' }}>
            <h3 className="text-sm font-semibold text-stone-600 mb-4 flex items-center gap-2">
              <span>📊</span> 能量分析
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* 能量儀表 */}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-stone-400 mb-1">身體能量</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    result.constitution.energy >= 60 ? 'text-emerald-500' :
                    result.constitution.energy >= 45 ? 'text-amber-500' : 'text-red-500'
                  }`}>{result.constitution.energy}%</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                      style={{ width: `${result.constitution.energy}%` }} />
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {result.constitution.energy >= 60 ? '最佳' : result.constitution.energy >= 45 ? '正常' : '偏低'}
                </p>
              </div>
              {/* 壓力儀表 */}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-stone-400 mb-1">身心壓力</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    result.constitution.stress <= 3 ? 'text-emerald-500' :
                    result.constitution.stress <= 4 ? 'text-amber-500' : 'text-red-500'
                  }`}>{result.constitution.stress}</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      result.constitution.stress <= 3 ? 'bg-emerald-400' :
                      result.constitution.stress <= 4 ? 'bg-amber-400' : 'bg-red-400'
                    }`} style={{ width: `${result.constitution.stress * 10}%` }} />
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {result.constitution.stress <= 3 ? '正常' : result.constitution.stress <= 4 ? '略高' : '過高'}
                </p>
              </div>
              {/* 彈力 */}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-stone-400 mb-1">恢復彈力</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    result.constitution.resilience >= 50 ? 'text-emerald-500' : 'text-amber-500'
                  }`}>{result.constitution.resilience}%</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                      style={{ width: `${result.constitution.resilience}%` }} />
                  </div>
                </div>
              </div>
              {/* 內在能量 */}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-stone-400 mb-1">內在能量儲備</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    result.constitution.innerEnergy >= 60 ? 'text-emerald-500' : 'text-amber-500'
                  }`}>{result.constitution.innerEnergy}%</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                      style={{ width: `${result.constitution.innerEnergy}%` }} />
                  </div>
                </div>
              </div>
            </div>
            {/* 神經平衡 */}
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-stone-400 mb-2">交感/副交感神經平衡</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 bg-stone-100 rounded-full relative">
                    <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-stone-300 -translate-x-1/2" />
                    <div className={`absolute top-0 h-2 w-3 rounded-full -translate-x-1/2 ${
                      result.constitution.meridianBalance.left < 1.5 ? 'bg-emerald-400' :
                      result.constitution.meridianBalance.left < 2.0 ? 'bg-amber-400' : 'bg-red-400'
                    }`} style={{ left: `${Math.min(result.constitution.meridianBalance.left / 3 * 100, 90)}%` }} />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">左 {result.constitution.meridianBalance.left}</p>
                </div>
                <span className="text-xs text-stone-400">vs</span>
                <div className="flex-1">
                  <div className="h-2 bg-stone-100 rounded-full relative">
                    <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-stone-300 -translate-x-1/2" />
                    <div className={`absolute top-0 h-2 w-3 rounded-full -translate-x-1/2 ${
                      result.constitution.meridianBalance.right < 1.5 ? 'bg-emerald-400' :
                      result.constitution.meridianBalance.right < 2.0 ? 'bg-amber-400' : 'bg-red-400'
                    }`} style={{ left: `${Math.min(result.constitution.meridianBalance.right / 3 * 100, 90)}%` }} />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">右 {result.constitution.meridianBalance.right}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 經脈運行參考圖 ── */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200 mb-5" style={{ display: resultTab === 'lifestyle' ? 'block' : 'none' }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>🕐</span> 十二經脈運行時間
            </h3>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {Object.entries(MERIDIAN_CLOCK).map(([key, m]) => {
                const hour = parseInt(key.split('-')[0])
                const isStrong = result.constitution.type.includes('氣虛') && ['07-09','09-11'].includes(key)
                  || result.constitution.type.includes('陰虛') && ['17-19','11-13'].includes(key)
                  || result.constitution.type.includes('陽虛') && ['07-09','23-01'].includes(key)
                  || result.constitution.type.includes('氣鬱') && ['01-03','09-11'].includes(key)
                  || result.constitution.type.includes('痰濕') && ['09-11','15-17'].includes(key)
                  || result.constitution.type.includes('濕熱') && ['15-17','01-03'].includes(key)
                return (
                  <div key={key} className={`rounded-lg p-2 text-center transition-all ${
                    isStrong
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                      : 'bg-white border border-stone-100 text-stone-600'
                  }`}>
                    <div className="font-medium text-stone-800">{m.name}</div>
                    <div className="text-stone-400 text-xs">{m.time.split('-')[0]}</div>
                    {isStrong && <div className="text-emerald-500 text-xs mt-0.5">★ 最佳</div>}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-stone-400 mt-2 text-center">★ 標記為您的體質最旺盛時段，此時調理效果最佳</p>
          </div>

          {/* ── 生活方式雷達圖（用長條圖替代） ── */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 mb-5" style={{ display: resultTab === 'lifestyle' ? 'block' : 'none' }}>
            <h3 className="text-sm font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <span>🌿</span> 生活方式評分
            </h3>
            <div className="space-y-3">
              {[
                { key: 'exercise', label: '運動', icon: '🏃', value: result.constitution.lifestyle.exercise },
                { key: 'nutrition', label: '營養', icon: '🥗', value: result.constitution.lifestyle.nutrition },
                { key: 'environment', label: '環境', icon: '🌤', value: result.constitution.lifestyle.environment },
                { key: 'psychology', label: '心理', icon: '🧘', value: result.constitution.lifestyle.psychology },
                { key: 'sleep', label: '睡眠', icon: '😴', value: result.constitution.lifestyle.sleep },
                { key: 'hormonal', label: '荷爾蒙', icon: '⚖️', value: result.constitution.lifestyle.hormonal },
              ].map(item => {
                const color = item.value >= 75 ? 'bg-emerald-400' : item.value >= 60 ? 'bg-amber-400' : 'bg-red-400'
                const status = item.value >= 75 ? '理想' : item.value >= 60 ? '正常' : '偏低'
                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs text-stone-600 w-12">{item.label}</span>
                    <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-xs font-medium text-stone-600 w-8">{item.value}%</span>
                    <span className="text-xs text-stone-400 w-8">{status}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-stone-400 mt-4 text-center">依據您的調理進度，各項指標建議逐步提升至綠色區間</p>
          </div>

          {/* ══════════════════════════════════════════
              付費內容：十二經絡 + 脈輪
          ══════════════════════════════════════════ */}
          <div className="mt-5">
            {/* 付費解鎖提示 */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔐</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-violet-700">經絡與脈輪深度分析</p>
                  <p className="text-xs text-violet-500 mt-0.5">十二經絡能量 • 七大脈輪状态 • 身心連結解讀</p>
                </div>
                <div className="bg-violet-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  進階版專屬
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 py-2.5 bg-violet-600 text-white text-sm rounded-xl font-medium hover:bg-violet-700 transition">
                  解鎖完整報告
                </button>
                <button className="px-4 py-2.5 border border-violet-200 text-violet-600 text-sm rounded-xl hover:bg-violet-50 transition">
                  登入會員
                </button>
              </div>
            </div>

            {/* 十二經絡預覽（浮水印疊加） */}
            <div className="rounded-2xl border border-stone-200 mb-4">
              <div className="bg-white p-5">
                <h3 className="text-sm font-semibold text-stone-600 mb-4 flex items-center gap-2">
                  <span>🧘</span> 十二經絡能量圖
                </h3>
                {/* 12經絡能量條 */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: '肺經', element: '金', time: '3-5', energy: 72, side: 1.1, organ: '呼吸系統', emotion: '悲傷', color: 'bg-blue-400' },
                    { name: '大腸經', element: '金', time: '5-7', energy: 68, side: 1.15, organ: '消化系統', emotion: '沮喪', color: 'bg-blue-500' },
                    { name: '胃經', element: '土', time: '7-9', energy: 45, side: 0.88, organ: '消化系統', emotion: '焦慮', color: 'bg-amber-400' },
                    { name: '脾經', element: '土', time: '9-11', energy: 55, side: 0.92, organ: '免疫系統', emotion: '擔憂', color: 'bg-amber-500' },
                    { name: '心經', element: '火', time: '11-13', energy: 62, side: 1.05, organ: '心血管', emotion: '喜悅', color: 'bg-red-400' },
                    { name: '小腸經', element: '火', time: '13-15', energy: 58, side: 1.0, organ: '消化系統', emotion: '純真', color: 'bg-red-500' },
                    { name: '膀胱經', element: '水', time: '15-17', energy: 50, side: 0.78, organ: '泌尿系統', emotion: '恐懼', color: 'bg-cyan-400' },
                    { name: '腎經', element: '水', time: '17-19', energy: 48, side: 0.82, organ: '生殖系統', emotion: '匱乏', color: 'bg-cyan-500' },
                    { name: '心包經', element: '火', time: '19-21', energy: 65, side: 1.08, organ: '免疫系統', emotion: '連結', color: 'bg-rose-400' },
                    { name: '三焦經', element: '火', time: '21-23', energy: 60, side: 1.02, organ: '淋巴系統', emotion: '循環', color: 'bg-rose-500' },
                    { name: '膽經', element: '木', time: '23-1', energy: 52, side: 0.95, organ: '解毒系統', emotion: '決斷', color: 'bg-green-400' },
                    { name: '肝經', element: '木', time: '1-3', energy: 40, side: 0.85, organ: '解毒系統', emotion: '憤怒', color: 'bg-green-500' },
                  ].map((m, i) => {
                    const statusColor = m.energy >= 60 ? 'text-emerald-500' : m.energy >= 45 ? 'text-amber-500' : 'text-red-500'
                    return (
                      <div key={i} className="bg-stone-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-stone-700">{m.name}</span>
                          <span className="text-xs text-stone-400">{m.element} · {m.time}時</span>
                        </div>
                        <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-1">
                          <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.energy}%` }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${statusColor}`}>{m.energy}%</span>
                          <span className="text-xs text-stone-400">失衡 {Math.round((1 - m.side) * 100)}%</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-xs bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded">{m.organ}</span>
                          <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{m.emotion}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-stone-400 text-center mt-4">完整12經絡解讀，含經絡走向、穴位建議、保養時辰，僅限付費會員</p>
              </div>
            </div>

            {/* 七大脈輪預覽 */}
            <div className="rounded-2xl border border-stone-200">
              <div className="bg-white p-5">
                <h3 className="text-sm font-semibold text-stone-600 mb-4 flex items-center gap-2">
                  <span>⚡</span> 七大脈輪能量圖
                </h3>
                {/* 人形 + 脈輪位置 */}
                <div className="flex flex-col items-center">
                  {/* Zen-style SVG 人像 */}
                  <div className="relative w-36 h-52 mx-auto">
                    <svg viewBox="0 0 144 260" className="w-full h-full">
                      {/* 頭 */}
                      <ellipse cx="72" cy="22" rx="14" ry="16" fill="#e8e4df" stroke="#c4bfb8" strokeWidth="1.5"/>
                      {/* 頸 */}
                      <rect x="68" y="37" width="8" height="10" rx="2" fill="#e8e4df"/>
                      {/* 身體 - 簡化流線型 */}
                      <path d="M44 47 Q72 44 100 47 L96 108 Q72 112 48 108 Z" fill="#e8e4df" stroke="#c4bfb8" strokeWidth="1.2" strokeLinejoin="round"/>
                      {/* 左臂 */}
                      <path d="M48 52 Q32 60 26 78 Q22 90 24 100" fill="none" stroke="#c4bfb8" strokeWidth="7" strokeLinecap="round"/>
                      {/* 右臂 */}
                      <path d="M96 52 Q108 60 114 78 Q118 90 116 100" fill="none" stroke="#c4bfb8" strokeWidth="7" strokeLinecap="round"/>
                      {/* 左腿 */}
                      <path d="M58 110 Q52 140 50 180 Q48 200 52 220" fill="none" stroke="#c4bfb8" strokeWidth="8" strokeLinecap="round"/>
                      {/* 右腿 */}
                      <path d="M86 110 Q92 140 94 180 Q96 200 92 220" fill="none" stroke="#c4bfb8" strokeWidth="8" strokeLinecap="round"/>
                      
                      {/* 7脈輪 - 中醫經脈走向（紅橙黃綠藍靛紫） */}
                      <g>
                        <circle cx="72" cy="12" r="6.5" fill="#7c3aed" fillOpacity="0.3" stroke="#7c3aed" strokeWidth="1.5"/>
                        <circle cx="72" cy="12" r="3.2" fill="#7c3aed" fillOpacity="0.7"/>
                        <text x="72" y="22" textAnchor="middle" fontSize="5.5" fill="#6d28d9" fontFamily="serif">頂輪</text>
                      </g>
                      <g>
                        <circle cx="72" cy="28" r="6" fill="#4f46e5" fillOpacity="0.3" stroke="#4f46e5" strokeWidth="1.5"/>
                        <circle cx="72" cy="28" r="3" fill="#4f46e5" fillOpacity="0.7"/>
                        <text x="72" y="38" textAnchor="middle" fontSize="5.5" fill="#4338ca" fontFamily="serif">眉心輪</text>
                      </g>
                      <g>
                        <circle cx="72" cy="42" r="6" fill="#2563eb" fillOpacity="0.3" stroke="#2563eb" strokeWidth="1.5"/>
                        <circle cx="72" cy="42" r="3" fill="#2563eb" fillOpacity="0.7"/>
                        <text x="72" y="52" textAnchor="middle" fontSize="5.5" fill="#1d4ed8" fontFamily="serif">喉輪</text>
                      </g>
                      <g>
                        <circle cx="72" cy="54" r="7" fill="#16a34a" fillOpacity="0.3" stroke="#16a34a" strokeWidth="1.5"/>
                        <circle cx="72" cy="54" r="3.5" fill="#16a34a" fillOpacity="0.7"/>
                        <text x="72" y="64" textAnchor="middle" fontSize="5.5" fill="#15803d" fontFamily="serif">心輪</text>
                      </g>
                      <g>
                        <circle cx="72" cy="66" r="6.5" fill="#ca8a04" fillOpacity="0.3" stroke="#ca8a04" strokeWidth="1.5"/>
                        <circle cx="72" cy="66" r="3.2" fill="#ca8a04" fillOpacity="0.7"/>
                        <text x="72" y="76" textAnchor="middle" fontSize="5.5" fill="#a16207" fontFamily="serif">太陽輪</text>
                      </g>
                      <g>
                        <circle cx="72" cy="82" r="6.5" fill="#ea580c" fillOpacity="0.3" stroke="#ea580c" strokeWidth="1.5"/>
                        <circle cx="72" cy="82" r="3.2" fill="#ea580c" fillOpacity="0.7"/>
                        <text x="72" y="92" textAnchor="middle" fontSize="5.5" fill="#c2410c" fontFamily="serif">臍輪</text>
                      </g>
                      <g>
                        <circle cx="72" cy="100" r="7" fill="#dc2626" fillOpacity="0.3" stroke="#dc2626" strokeWidth="1.5"/>
                        <circle cx="72" cy="100" r="3.5" fill="#dc2626" fillOpacity="0.7"/>
                        <text x="72" y="110" textAnchor="middle" fontSize="5.5" fill="#b91c1c" fontFamily="serif">海底輪</text>
                      </g>
                      {/* 能量中線 */}
                      <line x1="72" y1="8" x2="72" y2="102" stroke="#c4bfb8" strokeWidth="0.5" strokeDasharray="2,3" opacity="0.4"/>
                    </svg>
                  </div>


                  {/* 脈輪狀態列表 */}
                  <div className="w-full space-y-2">
                    {[
                      { name: '頂輪', jp: 'Sahasrara', color: '#7c3aed', desc: '大腦・智慧・靈性連結', area: '頭頂' },
                      { name: '眉心輪', jp: 'Ajna', color: '#4f46e5', desc: '腦下垂體・直覺・洞察力', area: '眉心' },
                      { name: '喉輪', jp: 'Vishuddha', color: '#2563eb', desc: '甲狀腺・溝通・表達', area: '咽喉' },
                      { name: '心輪', jp: 'Anahata', color: '#16a34a', desc: '心臟・呼吸・愛與寬恕', area: '胸部' },
                      { name: '太陽輪', jp: 'Manipura', color: '#ca8a04', desc: '胰腺・自信・行動力', area: '胃部' },
                      { name: '臍輪', jp: 'Svadhisthana', color: '#ea580c', desc: '腹部・情感・創造力', area: '腹部' },
                      { name: '海底輪', jp: 'Muladhara', color: '#dc2626', desc: '生殖泌尿・生存本能・安全感', area: '骨盆底' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-stone-50 rounded-xl px-3 py-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-sm font-medium text-stone-600 w-12">{c.name}</span>
                        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `65%`, backgroundColor: c.color }} />
                        </div>
                        <span className="text-xs text-stone-400 w-16 text-right">{c.area}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-stone-400 text-center mt-4">完整脈輪解讀含打開/關閉原因、調理建議，僅限付費會員</p>
                </div>
              </div>
          </div>

          </div>
          {/* 辯證要點 */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 mb-4" style={{ display: resultTab === 'detail' ? 'block' : 'none' }}>
            <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <span>🔑</span> 辯證要點
            </h3>
            <p className="text-xs text-stone-500 mb-3">判定為 {result.constitution.type} 體質的核心指標：</p>
            <div className="space-y-2">
              {getPatternKeys(result.constitution.type).map((key, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs flex-shrink-0 font-medium">{i + 1}</span>
                  {key}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4" style={{ display: resultTab === 'detail' ? 'block' : 'none' }}>
            <p className="text-sm text-stone-700 leading-relaxed">{result.constitution.description}</p>
          </div>

          {result.tongue && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4" style={{ display: resultTab === 'detail' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span>👅</span> {t('tongue.title') || '舌苔特徵'}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: t('tongue.color') || '舌色', value: (result.tongue.tongue_color as string) || '—' },
                  { label: t('tongue.coating') || '苔色', value: (result.tongue.coating_color as string) || '—' },
                  { label: t('tongue.teeth') || '齒痕', value: ['無', '輕微', '明顯'][(result.tongue.teeth_mark as number) || 0] },
                  { label: t('tongue.cracks') || '裂紋', value: ['無', '輕微', '明顯'][(result.tongue.cracks as number) || 0] },
                ].map(item => (
                  <div key={item.label} className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-400 mb-1">{item.label}</p>
                    <p className="text-stone-700 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
              {/* 中醫舌象解讀 */}
              {(result.tongue.tongue_color || result.tongue.coating_color) && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <p className="text-xs text-stone-400 mb-1">中醫解讀</p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {(() => {
                      const tc = (result.tongue.tongue_color as string) || '';
                      const cc = (result.tongue.coating_color as string) || '';
                      const tm = (result.tongue.teeth_mark as number) || 0;
                      const ck = (result.tongue.cracks as number) || 0;
                      const parts: string[] = [];
                      if (tc.includes('淡紅') || tc === '淡紅') parts.push('舌色淡紅為正常或偏虛（氣血不足）。');
                      if (tc.includes('紅') && !tc.includes('淡紅')) parts.push('舌紅主熱，可能有內熱或陰虛火旺。');
                      if (tc.includes('深紅')) parts.push('舌深紅主熱盛，可能有實熱或陰虛火旺。');
                      if (tc.includes('淡白')) parts.push('舌淡白主血虛或陽虛，氣血不足。');
                      if (tc.includes('紫暗')) parts.push('舌紫暗主血瘀，血液循環不暢。');
                      if (cc.includes('薄白')) parts.push('苔薄白為正常或偏虛。');
                      if (cc.includes('黃')) parts.push('苔黃主熱證，常見濕熱或實熱。');
                      if (cc.includes('白厚') || cc === '白厚苔') parts.push('苔白厚主寒濕或痰濕內盛。');
                      if (cc.includes('少苔') || cc.includes('剝苔')) parts.push('少苔或剝苔主胃氣虛或陰虛。');
                      if (tm >= 2) parts.push('齒痕明顯常見於脾虛濕盛、運化失常。');
                      if (ck >= 2) parts.push('舌裂紋明顯常見於陰虛或血虛，津液不足。');
                      return parts.length > 0 ? parts.join(' ') : null;
                    })()}
                  </p>
                </div>
              )}
            </div>
          )}

          {result.face && (result.face as any).face_detected && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-4" style={{ display: resultTab === 'detail' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <span>😊</span> 面色分析（Beta）
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">面色</p>
                  <p className="text-stone-700 font-medium">{(result.face as any).complexion || '—'}</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">臉型</p>
                  <p className="text-stone-700 font-medium">{(result.face as any).face_shape || '—'}</p>
                </div>
              </div>
              <p className="text-sm text-stone-700 mb-3">{(result.face as any).description}</p>
              {((result.face as any).suggestions as string[])?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-amber-600 font-medium">面色調理建議：</p>
                  {((result.face as any).suggestions as string[]).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                      {s}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-amber-500 mt-3">Beta 功能僅供參考，精確分析請諮詢中醫師</p>
            </div>
          )}



          {result.constitution.herbs.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-4" style={{ display: resultTab === 'herbs' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <span>💊</span> {t('result.herbs')}
              </h3>
              <div className="space-y-3">
                {result.constitution.herbs.map((h, i) => {
                  const timing = getHerbTiming(h)
                  return (
                    <div key={i} className="bg-white rounded-xl p-3 border border-amber-100">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 flex-shrink-0 mt-0.5">◆</span>
                          <div>
                            <span className="font-medium text-stone-800">{h}</span>
                            {timing && (
                              <span className="ml-2 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                {timing.effect}
                              </span>
                            )}
                          </div>
                        </div>
                        {timing && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {timing.beforeOrAfterMeal}
                          </span>
                        )}
                      </div>
                      {timing ? (
                        <div className="ml-6 space-y-0.5">
                          <p className="text-xs text-stone-600 flex items-center gap-1">
                            <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded mr-1">🕐</span>
                            <strong>建議：</strong>{timing.timing}
                          </p>
                          <p className="text-xs text-stone-500 flex items-center gap-1">
                            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded mr-1">📍</span>
                            {timing.meridianNote}
                          </p>
                          {timing.note && (
                            <p className="text-xs text-amber-600 flex items-center gap-1">
                              <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded mr-1">💡</span>
                              {timing.note}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400 ml-6">請諮詢中醫師確認服用時間</p>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-amber-500 mt-3 leading-relaxed">
                ⚠️ {t('result.herbsNote')}
              </p>
            </div>
          )}

          {/* 中成藥（中成藥） */}
          {Array.isArray(result.constitution.chinese_patent_medicines) && result.constitution.chinese_patent_medicines.length > 0 && (
            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 mb-4" style={{ display: resultTab === 'herbs' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                <span>💊</span> 中成藥建議
              </h3>
              <div className="space-y-3">
                {result.constitution.chinese_patent_medicines.slice(0, 3).map((cpm: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl p-3 border border-purple-100">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 flex-shrink-0 mt-0.5">◆</span>
                      <div>
                        <span className="font-medium text-stone-800">{typeof cpm === 'string' ? cpm : cpm.name}</span>
                        {typeof cpm === 'object' && cpm.effect && (
                          <span className="ml-2 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                            {cpm.effect}
                          </span>
                        )}
                      </div>
                    </div>
                    {typeof cpm === 'object' && cpm.indications && (
                      <p className="text-xs text-stone-500 ml-6 mt-1">適應症：{cpm.indications}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-purple-500 mt-3">
                參考來源：中醫教材 vector DB + GraphDB（SymMap v2.0）
              </p>
            </div>
          )}

          {/* 中成藥用藥禁忌 */}
          {result.constitution.herbs.length > 0 && getHerbCautions(result.constitution.herbs).length > 0 && (
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4" style={{ display: resultTab === 'herbs' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <span>⚠️</span> 服用禁忌（重要）
              </h3>
              <div className="space-y-2">
                {getHerbCautions(result.constitution.herbs).map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.constitution.diet.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4" style={{ display: resultTab === 'food' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span>🍲</span> {t('result.diet')}
              </h3>
              <div className="space-y-3">
                {result.constitution.diet.map((d, i) => (
                  <div key={i} className="border-l-2 border-emerald-300 pl-3">
                    <p className="text-sm text-stone-700 leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 經方（古典方劑） */}
          {Array.isArray(result.constitution.classical_formulas) && result.constitution.classical_formulas.length > 0 && (
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mb-4" style={{ display: resultTab === 'herbs' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <span>🏛️</span> 經方建議
              </h3>
              <div className="space-y-3">
                {result.constitution.classical_formulas.slice(0, 3).map((cf: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl p-3 border border-blue-100">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 flex-shrink-0 mt-0.5">◆</span>
                      <div>
                        <span className="font-medium text-stone-800">{typeof cf === 'string' ? cf : cf.name}</span>
                        {typeof cf === 'object' && cf.effect && (
                          <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            {cf.effect}
                          </span>
                        )}
                      </div>
                    </div>
                    {typeof cf === 'object' && cf.ingredients && (
                      <p className="text-xs text-stone-500 ml-6 mt-1">組成：{cf.ingredients}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.constitution.acupoints.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4" style={{ display: resultTab === 'acupoints' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <span>🦶</span> {t('result.acupoints')}
              </h3>
              <div className="space-y-2">
                {result.constitution.acupoints.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="text-stone-400 flex-shrink-0">{i + 1}.</span>
                    {a}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-2">每天每穴按摩 2-3 分鐘，以酸脹為度</p>
            </div>
          )}

          {result.constitution.avoid.length > 0 && (
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4" style={{ display: resultTab === 'food' ? 'block' : 'none' }}>
              <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <span>⚠️</span> {t('result.avoid')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.constitution.avoid.map((a, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-full">✕ {a}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── Empty States ── */}
          {resultTab === 'herbs' && result.constitution.herbs.length === 0 && (
            <div className="rounded-2xl px-5 py-8 text-center" style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.08)' }}>
              <p className="text-sm" style={{ color: '#8B6E5A' }}>此分析未包含中藥建議</p>
              <p className="text-xs mt-1" style={{ color: '#A3B5A0' }}>建議諮詢中醫師獲取個人化中藥方案</p>
            </div>
          )}
          {resultTab === 'food' && result.constitution.diet.length === 0 && result.constitution.avoid.length === 0 && (
            <div className="rounded-2xl px-5 py-8 text-center" style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.08)' }}>
              <p className="text-sm" style={{ color: '#8B6E5A' }}>此分析未包含食療方案</p>
              <p className="text-xs mt-1" style={{ color: '#A3B5A0' }}>建議保持均衡飲食，諮詢中醫師獲取個人化方案</p>
            </div>
          )}
          {resultTab === 'acupoints' && result.constitution.acupoints.length === 0 && (
            <div className="rounded-2xl px-5 py-8 text-center" style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.08)' }}>
              <p className="text-sm" style={{ color: '#8B6E5A' }}>此分析未包含穴位建議</p>
              <p className="text-xs mt-1" style={{ color: '#A3B5A0' }}>可自行按摩常見保健穴位，或諮詢中醫師</p>
            </div>
          )}

          {/* ── 結果操作區 ── */}
          <button onClick={reset}
            className="w-full py-3 border-2 border-stone-200 rounded-xl text-sm text-stone-500 hover:border-emerald-400 hover:text-emerald-600 transition">
            {t('result.retake')}
          </button>
          {/* 分享按鈕 */}
          <button onClick={() => {
            if (navigator.share) {
              navigator.share({ title: '中醫體質分析', text: `我是「${result.constitution.type}」體質，調理建議：${result.constitution.suggestions.slice(0,2).join('、')}` })
            } else {
              navigator.clipboard.writeText(`我是「${result.constitution.type}」體質，調理建議：${result.constitution.suggestions.join('、')}`)
              alert('已複製到剪貼簿！')
            }
          }} className="w-full py-3 text-sm text-emerald-600 hover:text-emerald-700 mt-2">
            📤 分享給家人朋友
          </button>
          {/* 雲端同步 UI */}
          <div className="mt-4 text-center">
            {session?.user ? (
              <div>
                {savedRemotely ? (
                  <p className="text-sm" style={{ color: '#4A7C6A' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', verticalAlign: 'middle' }}>
                      <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    已保存到雲端
                  </p>
                ) : (
                  <button
                    onClick={saveToCloud}
                    disabled={saving}
                    className="text-sm px-4 py-2 rounded-full transition-all"
                    style={{
                      background: saving ? '#A3B5A0' : '#2C4A3E',
                      color: '#FAFAF7',
                      border: 'none',
                    }}>
                    {saving ? '儲存中...' : '💾 儲存到雲端'}
                  </button>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-sm" style={{ color: '#8B6E5A' }}>
                登入會員解鎖雲端歷史 →
              </Link>
            )}
          </div>
          {/* 結果保存/對比提示 */}
          <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm font-medium text-emerald-700">7天後回來對比</p>
              <p className="text-xs text-emerald-600 leading-relaxed mt-1">
                中醫調理需要時間，建議<strong>7天後重新做一次問卷</strong>，觀察體質變化
              </p>
            </div>

            <ResultSaveSection result={result} />
          </div>

          {/* ── 醫療免責聲明（顯眼位置）── */}
          <div className="mt-6 rounded-2xl px-4 py-4 text-center" style={{ background: 'rgba(139,110,90,0.06)', border: '1px solid rgba(139,110,90,0.15)' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#8B6E5A' }}>
              {t('disclaimer.line1')}<br/>
              {t('disclaimer.line2')}<br/>
              {t('disclaimer.line3')}
            </p>
          </div>
        </main>
      )}

      <footer className="text-center py-6 text-xs text-stone-400 border-t border-stone-200 mt-4">
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  )
}

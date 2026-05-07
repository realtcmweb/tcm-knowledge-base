'use client'

import { useState, useRef, useCallback } from 'react'
import Head from 'next/head'

// ============================================
// 問卷題目（10題核心版）
// ============================================
const QUESTIONS = [
  {
    id: 'S1',
    text: '您今天最困擾的問題是什麼？',
    type: 'single',
    required: true,
    options: [
      { value: '失眠', label: '失眠 / 睡不好' },
      { value: '疲倦', label: '疲倦 / 沒精神' },
      { value: '消化', label: '腹瀉 / 便祕 / 胃脹' },
      { value: '冰冷', label: '手腳冰冷' },
      { value: '頭痛', label: '頭痛 / 頭暈' },
      { value: '咳嗽', label: '咳嗽 / 喉嚨問題' },
      { value: '皮膚', label: '皮膚 / 過敏' },
      { value: '疼痛', label: '腰酸 / 關節痛' },
      { value: '情緒', label: '情緒 / 壓力問題' },
      { value: '其他', label: '其他' },
    ]
  },
  {
    id: 'S2',
    text: '這個問題持續多久了？',
    type: 'single',
    required: true,
    options: [
      { value: 'days', label: '几天内' },
      { value: 'weeks', label: '几週' },
      { value: 'months', label: '几个月' },
      { value: 'years', label: '一年以上' },
    ]
  },
  {
    id: 'S3',
    text: '您整體比較怕冷還是怕熱？',
    type: 'single',
    required: true,
    options: [
      { value: 'fear_cold', label: '很怕冷（冬天離不開被子）' },
      { value: 'fear_heat', label: '很怕熱（夏天離不開冷氣）' },
      { value: 'both', label: '既怕冷又怕熱' },
      { value: 'neutral', label: '沒有特別' },
    ]
  },
  {
    id: 'S4',
    text: '您是否容易出汗？',
    type: 'single',
    required: true,
    options: [
      { value: 'little', label: '很少出汗' },
      { value: 'normal', label: '正常活動時才出' },
      { value: 'easy', label: '稍微動一下就滿頭大汗' },
      { value: 'night_sweat', label: '睡覺時盜汗' },
      { value: 'spontaneous', label: '不動也出汗' },
    ]
  },
  {
    id: 'S5',
    text: '大便形態？',
    type: 'single',
    required: true,
    options: [
      { value: 'normal', label: '成形正常' },
      { value: '硬', label: '大便偏硬' },
      { value: '稀', label: '大便偏稀' },
      { value: '黏', label: '大便黏膩' },
      { value: '先硬後稀', label: '先硬後稀' },
    ]
  },
  {
    id: 'S6',
    text: '小便情況？',
    type: 'single',
    required: true,
    options: [
      { value: '正常', label: '正常' },
      { value: '清長', label: '尿清長（量多色淡）' },
      { value: '短赤', label: '尿短赤（量少色深）' },
      { value: '頻數', label: '尿頻' },
      { value: '夜尿', label: '夜尿多' },
    ]
  },
  {
    id: 'S7',
    text: '胃口情況？',
    type: 'single',
    required: true,
    options: [
      { value: '正常', label: '正常' },
      { value: '不振', label: '食慾不振' },
      { value: '亢進', label: '食慾亢進' },
      { value: '胃脹', label: '吃一點就飽' },
      { value: '飢餓感', label: '容易飢餓' },
    ]
  },
  {
    id: 'S8',
    text: '睡眠情況？',
    type: 'single',
    required: true,
    options: [
      { value: '正常', label: '正常' },
      { value: '失眠', label: '失眠難入睡' },
      { value: '早醒', label: '早醒' },
      { value: '多夢', label: '多夢' },
      { value: '嗜睡', label: '白天嗜睡' },
    ]
  },
  {
    id: 'S9',
    text: '情緒/壓力狀態？',
    type: 'single',
    required: true,
    options: [
      { value: '平穩', label: '平穩' },
      { value: '焦慮', label: '焦慮 / 緊張' },
      { value: '抑鬱', label: '抑鬱 / 低落' },
      { value: '易怒', label: '易怒 / 脾氣大' },
      { value: '壓力', label: '壓力大' },
    ]
  },
  {
    id: 'S10',
    text: '舌苔外觀（若知道）？',
    type: 'single',
    required: false,
    options: [
      { value: '不知道', label: '不知道' },
      { value: '薄白', label: '薄白苔' },
      { value: '白苔', label: '白厚苔' },
      { value: '黃苔', label: '黃苔' },
      { value: '少苔', label: '少苔 / 無苔' },
      { value: '其他', label: '其他' },
    ]
  },
]

// ============================================
// 體質分析函式（前端規則引擎）
// ============================================
function analyzeConstitution(answers: Record<string, string>) {
  const { S1, S3, S4, S5, S6, S7, S8, S9 } = answers

  // 陰虛
  if (S3 === 'fear_heat' && (S4 === 'night_sweat' || S4 === 'spontaneous') && S8 === '失眠') {
    return {
      type: '陰虛體質',
      sub: '心腎陰虛',
      description: '您屬於陰虛體質，虛火內擾，夜間盜汗，睡眠不安。調理应以滋陰清熱、養心安神為主。',
      suggestions: ['少吃燒烤油炸辛辣', '多吃百合、銀耳、麥冬', '避免熬夜', '練習太極拳或冥想'],
      avoid: ['咖啡因', '酒精', '辛辣刺激']
    }
  }

  // 陽虛
  if (S3 === 'fear_cold' && S6 === '清長' && S7 === '不振') {
    return {
      type: '陽虛體質',
      sub: '脾腎陽虛',
      description: '您屬於陽虛體質，火力不足，畏寒怕冷，容易疲倦。調理应以溫補脾腎、助陽驅寒為主。',
      suggestions: ['多吃溫熱食物（羊肉、龍眼、紅棗）', '忌生冷冰品', '每天熱水泡腳', '適度運動提升陽氣'],
      avoid: ['冰品', '生菜水果', '冷飲']
    }
  }

  // 氣虛
  if (S4 === 'easy' || S4 === 'spontaneous' && S7 === '不振' && S8 === '嗜睡') {
    return {
      type: '氣虛體質',
      sub: '脾肺氣虛',
      description: '您屬於氣虛體質，元氣不足，容易疲勞，說話無力。調理应以補氣健脾、益肺固表為主。',
      suggestions: ['多吃山藥、黃耆、黨參', '適度運動（散步、太極）', '保證充足睡眠', '少吃耗氣食物（白蘿蔔、茶葉）'],
      avoid: ['過度勞累', '熬夜', '劇烈運動']
    }
  }

  // 痰濕
  if (S5 === '黏' && S7 === '胃脹' && S1 === '疲倦') {
    return {
      type: '痰濕體質',
      sub: '痰濕困脾',
      description: '您屬於痰濕體質，濕濁內蘊，身體沉重，易長痘。調理应以燥濕化痰、健脾利濕為主。',
      suggestions: ['少吃甜食油膩', '多吃薏仁、赤小豆、冬瓜', '保持環境乾燥', '規律運動排汗'],
      avoid: ['甜食', '油炸', '糯米', '奶製品']
    }
  }

  // 肝氣鬱結
  if (S9 === '焦慮' || S9 === '易怒' && S8 === '失眠' && S1 === '情緒') {
    return {
      type: '氣鬱體質',
      sub: '肝氣鬱結',
      description: '您屬於氣鬱體質，肝氣不舒，情緒波動大，胸脅脹悶。調理应以疏肝理氣、解鬱安神為主。',
      suggestions: ['多喝花茶（玫瑰花、菊花）', '規律作息', '找人傾訴', '按摩太衝穴'],
      avoid: ['過度壓抑情緒', '酒精', '熬夜']
    }
  }

  // 脾胃虛弱
  if (S5 === '稀' || S5 === '先硬後稀' && S7 === '不振') {
    return {
      type: '脾虛體質',
      sub: '脾胃虛弱',
      description: '您屬於脾虛體質，運化失常，大便異常，食慾不振。調理应以健脾和胃、補中益氣為主。',
      suggestions: ['定時定量用餐', '多吃山藥、茯苓、蓮子', '飯後散步', '少吃生冷油膩'],
      avoid: ['冰品', '空腹吃水果', '暴飲暴食']
    }
  }

  // 默認平和
  return {
    type: '偏頗體質',
    sub: '需進一步調理',
    description: '根據您的回答，屬於輕度偏頗體質，建議規律作息、均衡飲食、適度運動以維持健康。',
    suggestions: ['保持規律作息', '均衡飲食', '每週運動3次', '保持心情愉快'],
    avoid: ['過度疲勞', '情緒大波動']
  }
}

// ============================================
// 類型定義
// ============================================
type Step = 'welcome' | 'questionnaire' | 'tongue' | 'result'

interface AnalysisResult {
  constitution: { type: string; sub: string; description: string; suggestions: string[]; avoid: string[] }
  tongue?: { tongue_color: string; coating_color: string; teeth_mark: number; cracks: number; confidence: number }
  rag_results?: any[]
  questionnaire_answers: Record<string, string>
}

// ============================================
// 主元件
// ============================================
export default function Home() {
  const [step, setStep] = useState<Step>('welcome')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [tongueFile, setTongueFile] = useState<File | null>(null)
  const [tonguePreview, setTonguePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // 選擇問卷選項 → 自動跳下一題
  const handleAnswer = useCallback((value: string) => {
    const q = QUESTIONS[qIndex]
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)

    // 選完後自動跳下一題，延遲 400ms 讓用戶看到選中效果
    setTimeout(() => {
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex(qIndex + 1)
      } else {
        // 問卷完成 → 舌苔步驟
        setStep('tongue')
      }
    }, 400)
  }, [answers, qIndex])

  // 舌苔上傳
  const handleTongueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTongueFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setTonguePreview(ev.target?.result as string)
  }

  // 提交分析
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const constitution = analyzeConstitution(answers)

      let tongueInfo: AnalysisResult['tongue'] = undefined
      let rag_results: any[] = []

      // 如果有上傳舌苔圖片，分析它
      if (tongueFile) {
        const formData = new FormData()
        formData.append('image', tongueFile)

        const res = await fetch('/api/tongue', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          const data = await res.json()
          tongueInfo = data
        }
      }

      // RAG 搜尋相關中醫知識
      try {
        const chiefComplaint = answers['S1'] || '一般養生'
        const searchRes = await fetch(`/api/search?q=${encodeURIComponent(chiefComplaint)}&k=3`)
        if (searchRes.ok) {
          const searchData = await searchRes.json()
          rag_results = searchData.results || []
        }
      } catch { /* RAG 失敗不影響 */ }

      setResult({ constitution, tongue: tongueInfo, rag_results, questionnaire_answers: answers })
      setStep('result')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const currentQ = QUESTIONS[qIndex]
  const progress = ((qIndex + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800" style={{ fontFamily: "'Noto Serif TC', serif" }}>
      <Head><title>中醫智能問診 | TCM AI</title></Head>

      {/* ── Header ── */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-light tracking-wide text-stone-700">中醫智能問診</h1>
            <p className="text-xs text-stone-400 tracking-widest">AI 輔助養生參考</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
            診
          </div>
        </div>
        {/* Progress bar for questionnaire */}
        {step === 'questionnaire' && (
          <div className="h-0.5 bg-stone-100">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      {/* ── Welcome ── */}
      {step === 'welcome' && (
        <main className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="text-6xl mb-6">🌿</div>
          <h2 className="text-2xl font-light text-stone-700 mb-3 tracking-wide">中醫智能問診</h2>
          <p className="text-sm text-stone-500 leading-relaxed mb-10 max-w-xs">
            填寫問卷 + 拍攝舌苔<br />AI 為您分析體質與調養建議
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => setStep('questionnaire')}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-medium shadow-lg shadow-emerald-200 hover:shadow-xl transition-all text-base"
            >
              開始問診
            </button>
            <p className="text-xs text-stone-400 mt-3">
              約需 2 分鐘 · 僅供養生參考，不作為醫療診斷
            </p>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 text-center">
            {[
              { icon: '📋', label: '10 題精選問卷' },
              { icon: '👅', label: '舌苔 AI 分析' },
              { icon: '📚', label: '51 本中醫典籍' },
            ].map(f => (
              <div key={f.label} className="text-xs text-stone-500">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div>{f.label}</div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── 問卷（每次一題，彈出式） ── */}
      {step === 'questionnaire' && (
        <main className="max-w-lg mx-auto px-4 py-8 min-h-[70vh] flex flex-col justify-center">
          <div className="text-center mb-6">
            <p className="text-xs text-stone-400 tracking-widest mb-1">第 {qIndex + 1} / {QUESTIONS.length} 題</p>
            <h2 className="text-xl font-light text-stone-700 leading-relaxed">{currentQ.text}</h2>
          </div>

          {/* 選項卡片 */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className={`w-full px-5 py-4 rounded-xl text-sm text-left transition-all border-2
                  ${answers[currentQ.id] === opt.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium shadow-sm'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 跳過按鈕 */}
          {qIndex < QUESTIONS.length - 1 && (
            <button
              onClick={() => {
                const newAnswers = { ...answers }
                delete newAnswers[currentQ.id]
                setAnswers(newAnswers)
                setQIndex(qIndex + 1)
              }}
              className="mt-4 text-xs text-stone-400 hover:text-stone-600 transition"
            >
              跳過 →
            </button>
          )}

          {/* 上一題 */}
          {qIndex > 0 && (
            <button
              onClick={() => setQIndex(qIndex - 1)}
              className="mt-3 text-xs text-stone-400 hover:text-stone-600 transition"
            >
              ← 上一題
            </button>
          )}
        </main>
      )}

      {/* ── 舌苔拍照 ── */}
      {step === 'tongue' && (
        <main className="max-w-lg mx-auto px-4 py-8 min-h-[70vh] flex flex-col justify-center">
          <div className="text-center mb-6">
            <p className="text-xs text-emerald-600 tracking-widest mb-2 font-medium">步驟 2 / 2</p>
            <h2 className="text-xl font-light text-stone-700">拍攝舌苔</h2>
            <p className="text-xs text-stone-500 mt-2">協助 AI 更準確判斷體質</p>
          </div>

          {/* 拍攝引導 */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 overflow-hidden mb-4">
            {tonguePreview ? (
              <div className="relative">
                <img src={tonguePreview} alt="舌苔預覽" className="w-full object-cover aspect-[4/3]" />
                <button
                  onClick={() => { setTonguePreview(null); setTongueFile(null) }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full text-white text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-[4/3] flex flex-col items-center justify-center text-stone-400 cursor-pointer hover:bg-stone-50 transition"
              >
                <div className="text-5xl mb-3">👅</div>
                <p className="text-sm font-medium">點擊拍攝舌苔</p>
                <p className="text-xs mt-1 text-stone-400">或從相簿選擇</p>
                <p className="text-xs mt-3 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                  💡 建議：自然光、張嘴伸舌、舌頭放鬆
                </p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleTongueUpload} />
          </div>

          {/* 提示 */}
          <div className="bg-stone-100 rounded-xl p-4 mb-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              <span className="font-medium text-stone-700">拍攝技巧：</span><br />
              ① 自然光或室內光，避免閃光燈<br />
              ② 張嘴伸舌，舌頭自然下垂<br />
              ③ 舌頭自然放鬆，不要用力<br />
              ④ 確保舌頭佔據畫面主要區域
            </p>
          </div>

          {/* 按鈕 */}
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-medium shadow-lg shadow-emerald-200 disabled:opacity-60 transition text-base"
            >
              {loading ? (
                <span>分析中...</span>
              ) : (
                <span>✨ {tongueFile ? '開始分析舌苔' : '略過舌苔，直接分析'}</span>
              )}
            </button>
            {!tongueFile && (
              <button
                onClick={() => {
                  setResult({
                    constitution: analyzeConstitution(answers),
                    questionnaire_answers: answers,
                    rag_results: []
                  })
                  setStep('result')
                }}
                className="w-full py-3 text-sm text-stone-500 hover:text-stone-700 transition"
              >
                跳過舌苔分析
              </button>
            )}
          </div>
        </main>
      )}

      {/* ── 結果 ── */}
      {step === 'result' && result && (
        <main className="max-w-lg mx-auto px-4 py-8">
          {/* 體質判定 */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-xs text-emerald-600 tracking-widest mb-1">體質分析結果</p>
            <h2 className="text-2xl font-light text-stone-700">{result.constitution.type}</h2>
            <p className="text-sm text-emerald-600 mt-1">{result.constitution.sub}</p>
          </div>

          {/* 體質描述 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
            <p className="text-sm text-stone-700 leading-relaxed">{result.constitution.description}</p>
          </div>

          {/* 舌苔分析結果（如果有） */}
          {result.tongue && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span>👅</span> 舌苔特徵
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">舌色</p>
                  <p className="text-stone-700 font-medium">{result.tongue.tongue_color || '未檢測'}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">苔色</p>
                  <p className="text-stone-700 font-medium">{result.tongue.coating_color || '未檢測'}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">齒痕</p>
                  <p className="text-stone-700 font-medium">
                    {result.tongue.teeth_mark === 0 ? '無' : result.tongue.teeth_mark === 1 ? '輕微' : '明顯'}
                  </p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">裂紋</p>
                  <p className="text-stone-700 font-medium">
                    {result.tongue.cracks === 0 ? '無' : result.tongue.cracks === 1 ? '輕微' : '明顯'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 調養建議 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
            <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <span>✅</span> 調養建議
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

          {/* 禁忌 */}
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4">
            <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
              <span>⚠️</span> 應避免
            </h3>
            <div className="space-y-2">
              {result.constitution.avoid.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <span className="text-red-400 flex-shrink-0">✕</span>
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* 中醫典籍參考（如果有） */}
          {result.rag_results && result.rag_results.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
              <h3 className="text-sm font-semibold text-stone-600 mb-3 flex items-center gap-2">
                <span>📖</span> 中醫典籍參考
              </h3>
              <div className="space-y-3">
                {result.rag_results.slice(0, 2).map((r: any, i: number) => (
                  <div key={i} className="border-l-2 border-emerald-300 pl-3">
                    <p className="text-xs text-emerald-600 font-medium mb-0.5">{r.book_title}</p>
                    <p className="text-xs text-stone-500">{r.chapter}</p>
                    <p className="text-sm text-stone-700 mt-1 leading-relaxed">{r.content?.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 免責聲明 */}
          <div className="text-center py-4">
            <p className="text-xs text-stone-400 leading-relaxed">
              本系統基於中醫理論與古籍文獻分析<br />
              僅供養生參考，不作為醫療診斷依據<br />
              如有不適請諮詢中醫師
            </p>
          </div>

          {/* 重新開始 */}
          <button
            onClick={() => {
              setStep('welcome')
              setQIndex(0)
              setAnswers({})
              setTongueFile(null)
              setTonguePreview(null)
              setResult(null)
            }}
            className="w-full py-3 border-2 border-stone-200 rounded-xl text-sm text-stone-500 hover:border-emerald-400 hover:text-emerald-600 transition"
          >
            重新問診
          </button>
        </main>
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-stone-400 border-t border-stone-200 mt-4">
        <p>本系統僅供養生參考，不作為醫療診斷依據</p>
        <p className="mt-1">中醫藥知識庫 © 2026 · 51 本中醫藥教材</p>
      </footer>
    </div>
  )
}

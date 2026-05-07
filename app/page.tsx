'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [tab, setTab] = useState<'tongue' | 'chat' | 'search'>('tongue')
  const [tongueFile, setTongueFile] = useState<File | null>(null)
  const [tonguePreview, setTonguePreview] = useState<string | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleTongueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTongueFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setTonguePreview(ev.target?.result as string)
  }

  const handleTongueSubmit = async () => {
    if (!tongueFile) return
    setLoading(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 1500))
    setResult({
      type: 'tongue',
      result: '舌苔偏淡，略有齒痕。提示：脾胃功能偏弱，建議清淡飲食，適量運動。',
      suggestions: ['少吃生冷油膩', '多吃山藥、茯苓', '保持規律作息']
    })
    setLoading(false)
  }

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return
    const userMsg = chatMessage
    setChatMessage('')
    setChatHistory(h => [...h, { role: 'user', text: userMsg }])
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setChatHistory(h => [...h, { role: 'ai', text: '根據您的描述，建議進一步觀察症狀持續時間。若有不適，請諮詢中醫師獲取個人化調理方案。' }])
    setLoading(false)
  }

  const handleSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&k=3`)
      const data = await res.json()
      setResult({ type: 'search', query: q, results: data.results || [] })
    } catch {
      setResult({ type: 'error', message: '搜尋服務暫時無法使用' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800" style={{ fontFamily: "'PingFang TC', 'Microsoft JhengHei', serif" }}>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-wide text-stone-700">中醫智能問診</h1>
            <p className="text-xs text-stone-400 tracking-widest">AI 輔助養生參考</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">
            診
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-lg mx-auto px-4 py-3 flex gap-1 bg-white/60 backdrop-blur-sm">
        {[
          { id: 'tongue', label: '舌苔拍照', icon: '👅' },
          { id: 'chat',   label: '智能問診', icon: '💬' },
          { id: 'search', label: '知識庫',   icon: '📖' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id as any); setResult(null); setTongueFile(null); setTonguePreview(null) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5
              ${tab === t.id ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-100'}`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">

        {/* ── 舌苔拍照 ── */}
        {tab === 'tongue' && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-stone-500 leading-relaxed">
                拍攝舌苔照片，AI 將根據圖像提供養生參考建議。
                <br /><span className="text-xs text-stone-400">本系統僅供養生參考，不作為醫療診斷依據。</span>
              </p>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-stone-300 rounded-2xl overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors aspect-[4/3] flex items-center justify-center bg-white"
            >
              {tonguePreview ? (
                <img src={tonguePreview} alt="舌苔預覽" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-stone-400">
                  <div className="text-5xl mb-3">👅</div>
                  <p className="text-sm font-medium">點擊上傳舌苔照片</p>
                  <p className="text-xs mt-1">建議在自然光下拍攝</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleTongueUpload} />
            </div>

            {tonguePreview && (
              <button
                onClick={handleTongueSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-medium shadow-lg shadow-emerald-200 disabled:opacity-60 transition"
              >
                {loading ? '分析中...' : '✨ 開始分析'}
              </button>
            )}

            {/* Result */}
            {result?.type === 'tongue' && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 animate-fade-in">
                <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <span>✨</span> AI 分析結果
                </h3>
                <p className="text-stone-700 leading-relaxed mb-4">{result.result}</p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-stone-500">📋 養生建議</p>
                  {result.suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 智能問診 ── */}
        {tab === 'chat' && (
          <div className="space-y-4">
            {/* Chat history */}
            <div className="space-y-3 min-h-[40vh]">
              {chatHistory.length === 0 && (
                <div className="text-center py-12 text-stone-400">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-sm">描述您的症狀，AI 將提供養生參考</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-stone-800 text-white rounded-br-sm'
                      : 'bg-white text-stone-700 border border-stone-200 rounded-bl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                placeholder="描述您的症狀，如：失眠、胃口不好..."
                className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-emerald-400 transition"
              />
              <button
                onClick={handleChatSubmit}
                disabled={loading || !chatMessage.trim()}
                className="px-5 py-3 bg-stone-800 text-white rounded-xl disabled:opacity-50 transition"
              >
                送出
              </button>
            </div>
          </div>
        )}

        {/* ── 知識庫搜尋 ── */}
        {tab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder="搜尋中醫藥知識，如：桂枝湯功效"
                className="w-full px-4 py-3.5 pr-12 bg-white border border-stone-200 rounded-2xl text-sm outline-none focus:border-emerald-400 transition"
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-emerald-600 transition"
              >
                🔍
              </button>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2">
              {['桂枝湯', '針灸失眠', '溫病學', '中藥配伍', '脾胃調理'].map(s => (
                <button
                  key={s}
                  onClick={() => { setSearchQuery(s); handleSearch(s) }}
                  className="text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-full text-stone-500 hover:border-emerald-400 hover:text-emerald-600 transition"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Results */}
            {result?.type === 'search' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400">{result.results.length} 個結果</p>
                {result.results.map((r: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
                    <div className="text-xs text-emerald-600 font-medium mb-1">
                      {r.book_title} · {r.chapter}
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">{r.content?.slice(0, 120)}...</p>
                  </div>
                ))}
              </div>
            )}

            {result?.type === 'error' && (
              <div className="text-center py-8 text-stone-400 text-sm">{result.message}</div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-stone-400 border-t border-stone-200 mt-8">
        <p>本系統僅供養生參考，不作為醫療診斷依據</p>
        <p className="mt-1">中醫藥知識庫 © 2026</p>
      </footer>
    </div>
  )
}

'use client'

import { useState } from 'react'
import SearchBox from '@/components/SearchBox'
import SubjectGrid from '@/components/SubjectGrid'
import RecentSearches from '@/components/RecentSearches'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setQuery(q)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
      setShowResults(true)
    } catch (e) {
      console.error(e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-emerald-800 text-white py-6 px-8 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold tracking-wide">中醫藥知識庫</h1>
          <p className="text-emerald-200 text-sm mt-1">
            十三五中醫藥高等教育叢書 · 智能問答系統
          </p>
        </div>
      </header>

      {/* Hero Search */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-2 text-center">
          中醫臨床問題，隨時解答
        </h2>
        <p className="text-gray-500 text-center mb-10">
          基於 51 本中醫藥教材的 RAG 智能問答系統
        </p>
        <SearchBox onSearch={handleSearch} loading={loading} />
      </section>

      {/* Results */}
      {showResults && (
        <section className="max-w-5xl mx-auto px-8 pb-16">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              搜尋結果：<span className="text-emerald-700">「{query}」</span>
              <span className="text-gray-400 text-sm ml-2">({results.length} 個結果)</span>
            </h3>
            <button
              onClick={() => setShowResults(false)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              清除
            </button>
          </div>
          <div className="space-y-4">
            {results.map((r: any, i: number) => (
              <ResultCard key={i} result={r} />
            ))}
          </div>
        </section>
      )}

      {/* Subject Navigation */}
      {!showResults && (
        <section className="max-w-5xl mx-auto px-8 pb-16">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">📚 科目導航</h3>
          <SubjectGrid />
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-8 text-center text-gray-400 text-sm">
        TCM Knowledge Base · Powered by RAG + ChromaDB
      </footer>
    </main>
  )
}

function ResultCard({ result }: { result: any }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
          {result.book_title} · {result.chapter}
        </span>
        {result.score !== undefined && (
          <span className="text-xs text-gray-400">
            {typeof result.score === 'number' ? (result.score * 100).toFixed(0) + '%' : ''}
          </span>
        )}
      </div>
      <p className="text-gray-700 leading-relaxed">{result.content}</p>
      {result.formula && (
        <span className="inline-block mt-2 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
          方劑：{result.formula}
        </span>
      )}
    </div>
  )
}

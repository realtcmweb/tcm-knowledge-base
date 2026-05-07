'use client'

import { useState, useRef } from 'react'

interface SearchBoxProps {
  onSearch: (q: string) => void
  loading: boolean
}

export default function SearchBox({ onSearch, loading }: SearchBoxProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loading) onSearch(value)
  }

  const suggestions = [
    '小兒發熱怎麼治療？',
    '桂枝湯的功效與組成',
    '針灸治療失眠',
    '溫病學衛氣營血辯證',
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="例如：小兒腹瀉中醫治療、桂枝湯適應症..."
          className="w-full text-lg px-6 py-4 rounded-2xl border-2 border-emerald-200
                     focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100
                     outline-none transition shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2
                     bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300
                     text-white px-5 py-2 rounded-xl font-medium transition"
        >
          {loading ? '搜尋中...' : '🔍 搜尋'}
        </button>
      </form>

      {/* Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => { setValue(s); onSearch(s) }}
            className="text-sm text-gray-500 bg-white border border-gray-200
                       px-3 py-1.5 rounded-full hover:border-emerald-400 hover:text-emerald-600 transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const languages = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-CN', label: '簡體中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
]

// Detect browser language, return best match
function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'zh-TW'
  const nav = navigator.language || ''
  const lang = nav.toLowerCase()

  if (lang.startsWith('zh-tw') || lang.startsWith('zh-hk')) return 'zh-TW'
  if (lang.startsWith('zh')) return 'zh-CN'
  if (lang.startsWith('en')) return 'en'
  if (lang.startsWith('ja')) return 'ja'
  if (lang.startsWith('ko')) return 'ko'
  if (lang.startsWith('pt')) return 'pt'
  if (lang.startsWith('es')) return 'es'
  return 'zh-TW'
}

interface LanguageSelectorProps {
  currentLocale: string
}

export default function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const currentLang = languages.find(l => l.code === currentLocale) || languages[0]

  useEffect(() => {
    // Auto-detect browser language on first visit (only for root path)
    const stored = localStorage.getItem('locale_auto_detected')
    if (!stored && pathname === '/') {
      const detected = detectBrowserLanguage()
      if (detected !== currentLocale) {
        localStorage.setItem('locale_auto_detected', 'true')
        router.replace(`/${detected}`)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchLocale(newLocale: string) {
    setOpen(false)
    localStorage.setItem('locale_auto_detected', 'true')
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:text-emerald-600 transition-colors border border-stone-200 rounded-lg hover:border-emerald-300"
      >
        <span className="text-stone-500">🌐</span>
        <span>{currentLang.label}</span>
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg py-2 z-50 min-w-[160px]">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                lang.code === currentLocale ? 'text-emerald-600 font-medium bg-emerald-50' : 'text-stone-600'
              }`}
            >
                <span>{lang.label}</span>
              {lang.code === currentLocale && <span className="ml-auto text-emerald-500">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

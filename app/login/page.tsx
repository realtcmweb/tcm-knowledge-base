'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LanguageSelector from '../../components/LanguageSelector'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: mode === 'register' ? name : undefined }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      // Store token and redirect
      localStorage.setItem('tcm_token', data.token)
      localStorage.setItem('tcm_user', JSON.stringify(data.user))
      router.push('/')
    } catch {
      setError('伺服器連線失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      // Initiate Google OAuth
      await signIn('google', { callbackUrl: '/' })
    } catch {
      setError('Google 登入失敗，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-50 flex flex-col">
      {/* Language selector top right */}
      <div className="absolute top-4 right-4">
        <LanguageSelector currentLocale="zh" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🌿</div>
            <h1 className="text-2xl font-semibold text-stone-700">中醫體質分析</h1>
            <p className="text-sm text-stone-500 mt-1">登入以保存您的診斷記錄</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100">
            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-stone-200 rounded-2xl text-sm font-medium text-stone-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-50 mb-6"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              使用 Google 帳戶登入
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 border-t border-stone-200" />
              <span className="text-xs text-stone-400">或</span>
              <div className="flex-1 border-t border-stone-200" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">姓名（選填）</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="王小明"
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">密碼</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '至少6位數' : '輸入密碼'}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? '處理中...' : mode === 'login' ? '登入' : '註冊'}
              </button>
            </form>

            {/* Toggle mode */}
            <div className="mt-4 text-center">
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                className="text-xs text-emerald-600 hover:text-emerald-700 transition"
              >
                {mode === 'login'
                  ? '還沒有帳戶？立即註冊 →'
                  : '已有帳戶？登入 →'}
              </button>
            </div>
          </div>

          {/* Privacy note */}
          {/* ── Medical Disclaimer ── */}
          <div className="rounded-2xl px-4 py-3.5 mt-6"
            style={{ background: 'rgba(44,74,62,0.04)', border: '1px solid rgba(44,74,62,0.08)' }}>
            <div className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#2C4A3E', marginTop: '1px', flexShrink: 0 }}>
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M7 4.5v2.5M7 9v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: '#2C4A3E', letterSpacing: '0.04em' }}>⚠️ 醫療免責聲明</p>
                <p className="text-xs leading-relaxed" style={{ color: '#4A4A42', lineHeight: 1.7 }}>
                  本系統內容僅供健康參考，不構成醫療建議、診斷或治療。AI 分析結果可能與專業中醫師判斷有所不同，請勿取代醫師診療。如有健康疑慮，請諮詢合資格的中醫師。
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-400 text-center mt-4 leading-relaxed">
            登入即表示您同意我們的隱私政策。<br />
            您的資料僅用於個人健康記錄，不會分享給第三方。
          </p>
        </div>
      </div>
    </div>
  )
}
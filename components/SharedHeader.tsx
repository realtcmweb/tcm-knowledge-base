'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export interface MenuItem {
  label: string
  icon?: string
  action?: string
}

interface SharedHeaderProps {
  title?: string
  homeLink?: string
  menuItems?: MenuItem[]
  searchValue?: string
  onSearchChange?: (v: string) => void
  onSearchKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
  loading?: boolean
  extraContent?: React.ReactNode
  /** Dispatch menu action events to parent page for handling */
  onMenuAction?: (action: string) => void
}

export default function SharedHeader({
  title = '醫道中醫大全',
  homeLink = '/',
  menuItems,
  searchValue = '',
  onSearchChange,
  onSearchKeyDown,
  placeholder,
  loading = false,
  extraContent,
  onMenuAction,
}: SharedHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'zh-TW'
  const isCN = locale === 'zh-CN'
  const [showMenu, setShowMenu] = useState(false)

  const DEFAULT_MENU_ITEMS: MenuItem[] = [
    { label: '🌐', icon: '🌐', action: 'lang' },
    { label: '字體 ±', icon: '🔤', action: 'font' },
    { label: '使用說明', icon: '📋', action: 'guide' },
    { label: '免責聲明', icon: '⚠️', action: 'disclaimer' },
    { label: '關於本站', icon: 'ℹ️', action: 'about' },
    { label: '聯絡我們', icon: '📩', action: 'contact' },
  ]

  const finalMenuItems = menuItems ?? DEFAULT_MENU_ITEMS

  const handleSearch = () => {
    const q = searchValue.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleMenuClick = (action: string) => {
    setShowMenu(false)
    if (action === 'lang') {
      router.push(locale === 'zh-TW' ? '/zh-CN' : '/zh-TW')
      return
    }
    if (onMenuAction) {
      onMenuAction(action)
    } else {
      window.dispatchEvent(new CustomEvent('shared-header-menu', { detail: { action } }))
    }
  }

  const defaultPlaceholder = isCN ? '搜尋穴位、方劑、中藥...' : '搜尋穴位、方劑、中藥...'

  return (
    <>
      <div style={{
        background: '#1a3A2C', color: '#FFFEF9',
        padding: '0 0 16px', borderRadius: '0 0 20px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 0 4px', height: '50px' }}>
          <Link href={homeLink} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '8px 12px', color: '#FFFEF9', textDecoration: 'none',
            fontSize: '13px', fontWeight: 600, opacity: 0.9,
          }}>
            <span style={{ fontSize: '15px' }}>🏠</span>
            <span>{isCN ? '首页' : '首頁'}</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700 }}>
            {title}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '7px 12px', color: '#FFFEF9',
                backgroundColor: showMenu ? 'rgba(255,254,249,0.2)' : 'rgba(255,254,249,0.12)',
                border: 'none', borderRadius: '20px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
              }}
            >
              ☰ <span style={{ fontSize: '11px' }}>{isCN ? '選單' : '選單'}</span>
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: '220px', backgroundColor: '#FFFEF9', borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC',
              }}>
                {finalMenuItems.map((item, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={e => { e.preventDefault(); handleMenuClick(item.action || '') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '13px 16px', color: '#1a2C24', textDecoration: 'none',
                      fontSize: '13px', fontWeight: 600,
                      borderBottom: i < finalMenuItems.length - 1 ? '1px solid #F0EDE5' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F2EB')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon || item.label.slice(0, 1)}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 16px' }}>
          <label htmlFor="shared-search-input" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,254,249,0.15)',
            borderRadius: '14px', padding: '12px 14px',
            border: '1.5px solid rgba(255,254,249,0.25)',
            cursor: 'text',
          }} onClick={() => document.getElementById('shared-search-input')?.focus()}>
            <span style={{ fontSize: '16px', opacity: 0.7, flexShrink: 0, userSelect: 'none' }}>🔍</span>
            <input
              id="shared-search-input"
              type="text"
              placeholder={loading ? (isCN ? '載入中...' : '載入中...') : (placeholder ?? defaultPlaceholder)}
              value={searchValue}
              onChange={e => onSearchChange?.(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch()
                else onSearchKeyDown?.(e)
              }}
              disabled={loading}
              style={{
                flex: 1, border: 'none', backgroundColor: 'transparent',
                outline: 'none', fontSize: '14px', color: '#FFFEF9',
                caretColor: '#FFFEF9',
              }}
            />
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,254,249,0.7)', flexShrink: 0 }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,254,249,0.4)', borderTopColor: '#FFFEF9', borderRadius: '50%' }} className="animate-spin-fast" />
                {isCN ? '搜尋中' : '搜尋中'}
              </span>
            ) : searchValue ? (
              <button
                onClick={e => { e.stopPropagation(); onSearchChange?.(''); document.getElementById('shared-search-input')?.focus() }}
                style={{
                  background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: '50%',
                  width: '20px', height: '20px', cursor: 'pointer',
                  fontSize: '10px', color: '#FFFEF9', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >✕</button>
            ) : null}
            {!loading && (
              <button
                onClick={handleSearch}
                disabled={!searchValue.trim()}
                style={{
                  padding: '7px 16px',
                  backgroundColor: searchValue.trim() ? '#FFFEF9' : 'rgba(255,254,249,0.3)',
                  color: '#1a3A2C', border: 'none', borderRadius: '20px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: searchValue.trim() ? 'pointer' : 'default',
                  flexShrink: 0,
                }}
              >搜尋</button>
            )}
          </label>
        </div>

        {extraContent}
      </div>

      {showMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />
      )}
    </>
  )
}
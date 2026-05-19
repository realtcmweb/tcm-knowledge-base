'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface MenuItem {
  label: string
  href?: string
  action?: string
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { label: '🔤 字體 ±', action: 'font' },
  { label: '📋 使用說明', action: 'guide' },
  { label: '⚠️ 免責聲明', action: 'disclaimer' },
  { label: 'ℹ️ 關於本站', action: 'about' },
  { label: '📩 聯絡我們', action: 'contact' },
]

interface SearchExtra {
  /** Extra content shown below search bar (e.g. tabs, category pills) */
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
}

export default function SharedHeader({
  title = '醫道中醫大全',
  homeLink = '/',
  menuItems = DEFAULT_MENU_ITEMS,
  searchValue = '',
  onSearchChange,
  onSearchKeyDown,
  placeholder = '搜尋穴位、方劑...',
  loading = false,
  extraContent,
}: SharedHeaderProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleSearch = () => {
    const q = searchValue.trim()
    if (!q) return
    router.push(`/db?q=${encodeURIComponent(q)}`)
  }

  const handleMenuItemAction = (action: string) => {
    setShowMenu(false)
    // Dispatch custom event so page can handle via listener
    window.dispatchEvent(new CustomEvent('header-menu-action', { detail: { action } }))
  }

  return (
    <>
      {/* Header */}
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
            <span>首頁</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 700 }}>
            {title}
          </div>

          {/* Menu Button */}
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
              ☰ <span style={{ fontSize: '11px' }}>選單</span>
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: '220px', backgroundColor: '#FFFEF9', borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                overflow: 'hidden', zIndex: 300, border: '1px solid #E8E4DC',
              }}>
                {menuItems.map((item, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={e => { e.preventDefault(); handleMenuItemAction(item.action || '') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '13px 16px', color: '#1a2C24', textDecoration: 'none',
                      fontSize: '13px', fontWeight: 600,
                      borderBottom: i < menuItems.length - 1 ? '1px solid #F0EDE5' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F2EB')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ fontSize: '15px' }}>{item.label.split(' ')[0]}</span>
                    <span style={{ flex: 1 }}>{item.label.split(' ').slice(1).join(' ')}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,254,249,0.15)',
            borderRadius: '14px', padding: '12px 14px',
            border: '1.5px solid rgba(255,254,249,0.25)',
          }}>
            <span style={{ fontSize: '16px', opacity: 0.8 }}>🔍</span>
            <input
              type="text"
              placeholder={loading ? '載入中...' : placeholder}
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
              }}
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.('')}
                style={{
                  background: 'rgba(255,254,249,0.2)', border: 'none', borderRadius: '50%',
                  width: '20px', height: '20px', cursor: 'pointer',
                  fontSize: '10px', color: '#FFFEF9', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            )}
            <button
              onClick={handleSearch}
              disabled={loading || !searchValue.trim()}
              style={{
                padding: '7px 16px',
                backgroundColor: searchValue.trim() ? '#FFFEF9' : 'rgba(255,254,249,0.3)',
                color: '#1a3A2C', border: 'none', borderRadius: '20px',
                fontSize: '13px', fontWeight: 700,
                cursor: searchValue.trim() ? 'pointer' : 'default',
              }}
            >搜尋</button>
          </div>
        </div>

        {extraContent}
      </div>

      {showMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  )
}
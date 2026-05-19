'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  emoji: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: '首頁', emoji: '🏠' },
  { href: '/acu', label: '針灸', emoji: '💉' },
  { href: '/db', label: '方劑', emoji: '🍵' },
  { href: '/herbs', label: '中藥', emoji: '🌿' },
  { href: '/symptoms', label: '症狀', emoji: '🩺' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFEF9',
      borderTop: '1.5px solid #E8E4DC',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
      zIndex: 500,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '6px 8px',
              textDecoration: 'none',
              minWidth: '52px',
            }}
          >
            <span style={{
              fontSize: '20px',
              opacity: isActive ? 1 : 0.55,
              transition: 'opacity 0.15s',
            }}>{item.emoji}</span>
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 700 : 600,
              color: isActive ? '#1a3A2C' : '#8A8A7A',
              transition: 'color 0.15s',
            }}>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
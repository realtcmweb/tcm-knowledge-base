import React from 'react'
import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'

interface Formula {
  id: number
  name: string
  pinyin: string
  categoryLabel: string
  source: string
  effects: string
  indications: string
  composition: string
  usage: string
  formulaSong: string
}

function buildHerbNameSet(): Set<string> {
  try {
    const herbsData = JSON.parse(
      require('fs').readFileSync(path.join(process.cwd(), 'public', 'data', 'herbs.json'), 'utf-8')
    )
    return new Set(herbsData.map((h: { name: string }) => h.name))
  } catch {
    return new Set()
  }
}

/**
 * Render composition string with herb names as clickable links.
 * Algorithm:
 * 1. Remove whitespace from composition → textNS
 * 2. Find all herb match positions in textNS (longest-first, no overlaps)
 * 3. Map positions back to original text by counting non-whitespace chars
 * 4. Output: plain text fragments + Link elements for each herb
 */
function renderCompositionWithLinks(
  composition: string,
  herbSet: Set<string>,
  locale: string,
  isCN: boolean,
  toTraditional: (s: string) => string
): React.ReactNode[] {
  if (!composition) return []

  const textNS = composition.replace(/\s+/g, '')
  const sortedHerbs = Array.from(herbSet).sort((a, b) => b.length - a.length)

  // Find all herb occurrences in the no-space text
  const matches: Array<{ start: number; end: number; name: string }> = []
  for (const herb of sortedHerbs) {
    let pos = 0
    while (true) {
      const idx = textNS.indexOf(herb, pos)
      if (idx === -1) break
      const overlaps = matches.some(m => idx < m.end && idx + herb.length > m.start)
      if (!overlaps) {
        matches.push({ start: idx, end: idx + herb.length, name: herb })
      }
      pos = idx + 1
    }
  }
  matches.sort((a, b) => a.start - b.start)

  // Build result: iterate matches, emit text between them
  const result: React.ReactNode[] = []
  let lastNSIdx = 0  // last position in no-space text we've consumed

  for (let mi = 0; mi < matches.length; mi++) {
    const m = matches[mi]
    const herbStartNS = m.start
    const herbEndNS = m.end
    const herbName = m.name

    // Find the position in original text corresponding to herbStartNS
    // by counting non-whitespace characters in original
    let nsCount = 0
    let origStart = 0
    for (let i = 0; i < composition.length; i++) {
      if (/\s/.test(composition[i])) continue
      if (nsCount === herbStartNS) { origStart = i; break }
      nsCount++
    }

    // Find the position in original text corresponding to herbEndNS
    nsCount = 0
    let origEnd = origStart
    for (let i = origStart; i < composition.length; i++) {
      if (/\s/.test(composition[i])) { origEnd = i; continue }
      if (nsCount === herbEndNS - herbStartNS) { origEnd = i + 1; break }
      nsCount++
    }

    // Text before this herb (plain)
    if (lastNSIdx < herbStartNS) {
      // Need to find original slice for NS positions [lastNSIdx, herbStartNS)
      let ns = 0
      let textStart = lastNSIdx === 0 ? 0 : -1
      let textEnd = -1
      for (let i = 0; i < composition.length; i++) {
        if (/\s/.test(composition[i])) continue
        if (ns === lastNSIdx && textStart < 0) textStart = i
        if (ns === herbStartNS) { textEnd = i; break }
        ns++
      }
      if (textStart >= 0 && textEnd > textStart) {
        const plainText = composition.substring(textStart, textEnd)
        result.push(plainText)
      }
    }

    // Emit herb as Link
    const herbTextInOriginal = composition.substring(origStart, origEnd)
    const displayName = isCN ? herbName : toTraditional(herbName)
    result.push(
      <Link
        key={`herb-${mi}-${herbName}`}
        href={`/${locale}/herbs?q=${encodeURIComponent(herbName)}`}
        style={{
          color: '#2C6B3A',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          fontWeight: 700,
        }}
      >
        {displayName}
      </Link>
    )

    lastNSIdx = herbEndNS
  }

  // Remaining text after last herb
  if (lastNSIdx < textNS.length) {
    // Find original slice for remaining NS positions
    let ns = 0
    let textStart = -1
    for (let i = 0; i < composition.length; i++) {
      if (/\s/.test(composition[i])) continue
      if (ns === lastNSIdx) { textStart = i; break }
      ns++
    }
    if (textStart >= 0) {
      result.push(composition.substring(textStart))
    }
  }

  return result
}

export default async function FormulaDetailPage({ params }: { params: Promise<{ locale: string; name: string }> }) {
  const resolved = await params
  const locale = resolved.locale || 'zh-TW'
  const isCN = locale === 'zh-CN'

  let toTraditional: (s: string) => string = (s: string) => s
  let toSimplified: (s: string) => string = (s: string) => s

  if (!isCN) {
    try {
      const mod = await import('@/lib/toTraditional')
      toTraditional = mod.toTraditional
    } catch { toTraditional = (s: string) => s }
  }
  try {
    const mod = await import('@/lib/toSimplified')
    toSimplified = mod.toSimplified
  } catch { toSimplified = (s: string) => s }

  const herbSet = buildHerbNameSet()

  const formulaNameRaw = decodeURIComponent(resolved.name)
  const formulaNameSC = toSimplified(formulaNameRaw)
  const formulaNameDisplay = isCN ? formulaNameSC : toTraditional(formulaNameSC)

  let formula: Formula | null = null
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'formulas.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const formulas: Formula[] = JSON.parse(fileContent)
    formula = formulas.find(f => f.name === formulaNameSC || f.name === formulaNameRaw) || null
  } catch (e) {
    console.error('Failed to load formulas:', e)
  }

  const navLabel = isCN ? '方剂大全' : '方劑大全'
  const backLabel = isCN ? '← 返回列表' : '← 返回列表'
  const notFound = `找不到「${formulaNameDisplay}」`
  const labelEffects = '💡 功效'
  const labelIndications = '📋 主治'
  const labelComposition = '🌿 組成'
  const labelUsage = '📖 用法'
  const labelSong = '🎵 方歌'
  const disclaimer = isCN
    ? '本资料库内容仅供学术参考，不作商业用途。有病请寻求合法的中医师，非中医师请勿擅自处方服药。'
    : '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的中醫師，非中醫師請勿擅自處方服藥。'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F0E8', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#1a3A2C', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <a href={`/${locale}/db`} style={{ background: 'rgba(255,254,249,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}>←</a>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#FFFEF9', flex: 1 }}>{formulaNameDisplay}</div>
        <a href={`/${locale}/db`} style={{ color: 'rgba(255,254,249,0.8)', textDecoration: 'none', fontSize: 13 }}>{navLabel}</a>
      </div>

      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {!formula ? (
            <div style={{ fontSize: 14, color: '#7A7A6A', textAlign: 'center', padding: '40px 0' }}>{notFound}</div>
          ) : (
            <>
              <div style={{ backgroundColor: '#FFFEF9', borderRadius: 20, padding: '20px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a2C24', marginBottom: 4 }}>{formulaNameDisplay}</h1>
                    <div style={{ fontSize: 13, color: '#7A9A6A' }}>{formula.pinyin}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#5A8A5A', backgroundColor: '#EEF4EE', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>{isCN ? formula.categoryLabel : toTraditional(formula.categoryLabel)}</span>
                    <span style={{ fontSize: 12, color: '#7A7A6A' }}>📚 {isCN ? '《' : '《'}{isCN ? formula.source : toTraditional(formula.source)}{isCN ? '》' : '》'}</span>
                  </div>
                </div>

                {formula.effects && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>{labelEffects}</div>
                    <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{isCN ? formula.effects : toTraditional(formula.effects)}</div>
                  </div>
                )}
                {formula.indications && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>{labelIndications}</div>
                    <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{isCN ? formula.indications : toTraditional(formula.indications)}</div>
                  </div>
                )}
                {formula.composition && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>{labelComposition}</div>
                    <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 2 }}>
                      {renderCompositionWithLinks(formula.composition, herbSet, locale, isCN, toTraditional)}
                    </div>
                  </div>
                )}
                {formula.usage && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>{labelUsage}</div>
                    <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{isCN ? formula.usage : toTraditional(formula.usage)}</div>
                  </div>
                )}
                {formula.formulaSong && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>{labelSong}</div>
                    <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{isCN ? formula.formulaSong : toTraditional(formula.formulaSong)}</div>
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 16px', backgroundColor: '#F5F2EB', borderRadius: 14, fontSize: 12, color: '#7A7A6A', lineHeight: 1.7, border: '1px solid #E8E4DC' }}>
                ⚠️ {disclaimer}
              </div>
              <a href={`/${locale}/db`} style={{ marginTop: 16, width: '100%', display: 'block', padding: 14, backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>{backLabel}</a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
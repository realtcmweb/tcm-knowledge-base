import { promises as fs } from 'fs'
import path from 'path'

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

export default async function FormulaDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name: nameParam } = await params
  const formulaName = decodeURIComponent(nameParam)

  let formula: Formula | null = null

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'formulas.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const formulas: Formula[] = JSON.parse(fileContent)
    formula = formulas.find(f => f.name === formulaName) || null
  } catch (e) {
    console.error('Failed to load formulas:', e)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F0E8', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1a3A2C', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/db" style={{ background: 'rgba(255,254,249,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}>←</a>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#FFFEF9', flex: 1 }}>{formulaName}</div>
        <a href="/db" style={{ color: 'rgba(255,254,249,0.8)', textDecoration: 'none', fontSize: 13 }}>方劑大全</a>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {!formula ? (
            <div style={{ fontSize: 14, color: '#7A7A6A', textAlign: 'center', padding: '40px 0' }}>找不到「{formulaName}」</div>
          ) : (
            <div style={{ backgroundColor: '#FFFEF9', borderRadius: 20, padding: '20px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a2C24', marginBottom: 4 }}>{formula.name}</h1>
                  <div style={{ fontSize: 13, color: '#7A9A6A' }}>{formula.pinyin}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#5A8A5A', backgroundColor: '#EEF4EE', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>{formula.categoryLabel}</span>
                  <span style={{ fontSize: 12, color: '#7A7A6A' }}>📚 《{formula.source}》</span>
                </div>
              </div>

              {formula.effects && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>💡 功效</div>
                  <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{formula.effects}</div>
                </div>
              )}
              {formula.indications && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>📋 主治</div>
                  <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{formula.indications}</div>
                </div>
              )}
              {formula.composition && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>🌿 組成</div>
                  <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{formula.composition}</div>
                </div>
              )}
              {formula.usage && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>📖 用法</div>
                  <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{formula.usage}</div>
                </div>
              )}
              {formula.formulaSong && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7A9A6A', marginBottom: 3 }}>🎵 方歌</div>
                  <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{formula.formulaSong}</div>
                </div>
              )}
            </div>
          )}

          <div style={{ padding: '14px 16px', backgroundColor: '#F5F2EB', borderRadius: 14, fontSize: 12, color: '#7A7A6A', lineHeight: 1.7, border: '1px solid #E8E4DC' }}>
            ⚠️ 本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的中醫師，非中醫師請勿擅自處方服藥。
          </div>
          <a href="/db" style={{ marginTop: 16, width: '100%', display: 'block', padding: 14, backgroundColor: '#1a3A2C', color: '#FFFEF9', border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>← 返回列表</a>
        </div>
      </div>
    </div>
  )
}
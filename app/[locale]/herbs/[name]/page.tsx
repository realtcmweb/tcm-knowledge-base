import { promises as fs } from 'fs'
import path from 'path'

interface Herb {
  name: string
  pinyin: string
  chapter: string
  nature: string
  efficacy: string
  applications: string
  usage: string
  contraindication: string
  identification: string
}

function getCategory(chapter: string): string {
  if (!chapter) return '其他'
  const parts = chapter.split('　')
  const map: Record<string, string> = {
    '解表药': '解表藥', '清热药': '清熱藥', '泻下药': '瀉下藥',
    '祛风湿药': '祛風濕', '利水渗湿药': '利水滲濕', '温里药': '溫里藥',
    '理气药': '理氣藥', '补虚药': '補虛藥', '安神药': '安神藥',
    '活血化瘀药': '活血化瘀', '化痰止咳平喘药': '化痰止咳',
    '平肝息风药': '平肝息風', '化湿药': '化濕藥', '驱虫药': '驅蟲藥',
    '消食药': '消食藥', '止血药': '止血藥', '收涩药': '收澀藥',
    '开窍药': '開竅藥', '攻毒杀虫止痒药': '攻毒殺蟲',
    '拔毒化腐生肌药': '拔毒生肌', '涌吐药': '湧吐藥',
  }
  const first = parts[0].trim()
  return map[first] || first || '其他'
}

function formatSection(label: string, value: string) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#7A9A6A', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8 }}>{value}</div>
    </div>
  )
}

function HerbContent({ herb, herbName }: { herb: Herb | null; herbName: string }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F0E8', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#1a3A2C', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/herbs" style={{ background: 'rgba(255,254,249,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}>←</a>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#FFFEF9', flex: 1 }}>{herbName}</div>
        <a href="/herbs" style={{ color: 'rgba(255,254,249,0.8)', textDecoration: 'none', fontSize: 13 }}>中藥大全</a>
      </div>

      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {!herb ? (
            <div style={{ fontSize: 14, color: '#7A7A6A', textAlign: 'center', padding: '40px 0' }}>找不到「{herbName}」</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a2C24', marginBottom: 4, lineHeight: 1.2 }}>{herb.name}</h1>
                  <div style={{ fontSize: 14, color: '#7A9A6A' }}>{herb.pinyin}</div>
                </div>
                <span style={{ fontSize: 12, color: '#5A8A5A', backgroundColor: '#EEF4EE', padding: '5px 12px', borderRadius: 8, fontWeight: 700 }}>{getCategory(herb.chapter)}</span>
              </div>
              {formatSection('💊 药性', herb.nature)}
              {formatSection('✨ 功效', herb.efficacy)}
              {formatSection('📋 应用', herb.applications)}
              {formatSection('📖 用法用量', herb.usage)}
              {formatSection('⚠️ 使用注意', herb.contraindication)}
              {formatSection('🔍 辨藥特徵', herb.identification)}
            </>
          )}
          <div style={{ marginTop: 24, padding: '14px 16px', backgroundColor: '#F5F2EB', borderRadius: 14, fontSize: 12, color: '#7A7A6A', lineHeight: 1.7, border: '1px solid #E8E4DC' }}>
            ⚠️ 本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的中醫師，非中醫師請勿擅自處方服藥。
          </div>
          <a href="/herbs" style={{ marginTop: 20, width: '100%', display: 'block', padding: 14, backgroundColor: '#1a3A2C', color: '#FFFEF9', borderRadius: 14, fontSize: 15, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>← 返回列表</a>
        </div>
      </div>
    </div>
  )
}

export default async function HerbDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const resolved = await params
  // Log for debugging
  console.log('[HerbDetail] raw params.name:', resolved.name)
  const herbName = decodeURIComponent(resolved.name)
  console.log('[HerbDetail] decoded herbName:', herbName)

  let herb: Herb | null = null

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'herbs.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const herbs: Herb[] = JSON.parse(fileContent)
    herb = herbs.find(h => h.name === herbName) || null
    console.log('[HerbDetail] found herb:', herb?.name ?? null)
  } catch (e) {
    console.error('[HerbDetail] error:', e)
  }

  return <HerbContent herb={herb} herbName={herbName} />
}
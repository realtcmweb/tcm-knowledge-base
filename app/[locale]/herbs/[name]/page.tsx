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
  const first = parts[0].trim()
  return first || '其他'
}

const SC_TO_TC_CAT: Record<string, string> = {
  '解表药': '解表藥', '清热药': '清熱藥', '泻下药': '瀉下藥',
  '祛风湿药': '祛風濕', '利水渗湿药': '利水滲濕', '温里药': '溫里藥',
  '理气药': '理氣藥', '补虚药': '補虛藥', '安神药': '安神藥',
  '活血化瘀药': '活血化瘀', '化痰止咳平喘药': '化痰止咳',
  '平肝息风药': '平肝息風', '化湿药': '化濕藥', '驱虫药': '驅蟲藥',
  '消食药': '消食藥', '止血药': '止血藥', '收涩药': '收澀藥',
  '开窍药': '開竅藥', '攻毒杀虫止痒药': '攻毒殺蟲',
  '拔毒化腐生肌药': '拔毒生肌', '涌吐药': '湧吐藥',
}

function getCategoryTC(chapter: string): string {
  return SC_TO_TC_CAT[getCategory(chapter)] || getCategory(chapter)
}

function formatSectionDisplay(label: string, value: string, toTraditional: (t: string) => string, isCN: boolean) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#7A9A6A', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1a2C24', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{isCN ? value : toTraditional(value)}</div>
    </div>
  )
}

export default async function HerbDetailPage({ params }: { params: Promise<{ locale: string; name: string }> }) {
  const resolved = await params
  const locale = resolved.locale || 'zh-TW'
  const isCN = locale === 'zh-CN'
  const herbNameRaw = decodeURIComponent(resolved.name)

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

  const herbNameSC = toSimplified(herbNameRaw)
  const herbNameDisplay = isCN ? herbNameSC : toTraditional(herbNameSC)

  let herb: Herb | null = null
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'herbs.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const herbs: Herb[] = JSON.parse(fileContent)
    herb = herbs.find(h => h.name === herbNameSC || h.name === herbNameRaw) || null
  } catch (e) {
    console.error('[HerbDetail] error:', e)
  }

  const labelNature = '💊 药性'
  const labelEfficacy = '✨ 功效'
  const labelApps = '📋 应用'
  const labelUsage = '📖 用法用量'
  const labelContra = '⚠️ 使用注意'
  const labelId = isCN ? '🔍 辨药特征' : '🔍 辨藥特徵'
  const notFoundMsg = `找不到「${herbNameDisplay}」`
  const backListLabel = isCN ? '← 返回列表' : '← 返回列表'
  const navLabel = isCN ? '中药大全' : '中藥大全'
  const disclaimer = isCN
    ? '本资料库内容仅供学术参考，不作商业用途。有病请寻求合法的中医师，非中医师请勿擅自处方服药。'
    : '本資料庫內容僅供學術參考，不作商業用途。有病請尋求合法的中醫師，非中醫師請勿擅自處方服藥。'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F0E8', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#1a3A2C', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <a href={`/${locale}/herbs`} style={{ background: 'rgba(255,254,249,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}>←</a>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#FFFEF9', flex: 1 }}>{herbNameDisplay}</div>
        <a href={`/${locale}/herbs`} style={{ color: 'rgba(255,254,249,0.8)', textDecoration: 'none', fontSize: 13 }}>{navLabel}</a>
      </div>

      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {!herb ? (
            <div style={{ fontSize: 14, color: '#7A7A6A', textAlign: 'center', padding: '40px 0' }}>{notFoundMsg}</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a2C24', marginBottom: 4, lineHeight: 1.2 }}>{herbNameDisplay}</h1>
                  <div style={{ fontSize: 14, color: '#7A9A6A' }}>{herb.pinyin}</div>
                </div>
                <span style={{ fontSize: 12, color: '#5A8A5A', backgroundColor: '#EEF4EE', padding: '5px 12px', borderRadius: 8, fontWeight: 700 }}>{isCN ? getCategory(herb.chapter) : getCategoryTC(herb.chapter)}</span>
              </div>
              {formatSectionDisplay(labelNature, herb.nature, toTraditional, isCN)}
              {formatSectionDisplay(labelEfficacy, herb.efficacy, toTraditional, isCN)}
              {formatSectionDisplay(labelApps, herb.applications, toTraditional, isCN)}
              {formatSectionDisplay(labelUsage, herb.usage, toTraditional, isCN)}
              {formatSectionDisplay(labelContra, herb.contraindication, toTraditional, isCN)}
              {formatSectionDisplay(labelId, herb.identification, toTraditional, isCN)}
            </>
          )}
          <div style={{ marginTop: 24, padding: '14px 16px', backgroundColor: '#F5F2EB', borderRadius: 14, fontSize: 12, color: '#7A7A6A', lineHeight: 1.7, border: '1px solid #E8E4DC' }}>
            ⚠️ {disclaimer}
          </div>
          <a href={`/${locale}/herbs`} style={{ marginTop: 20, width: '100%', display: 'block', padding: 14, backgroundColor: '#1a3A2C', color: '#FFFEF9', borderRadius: 14, fontSize: 15, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>{backListLabel}</a>
        </div>
      </div>
    </div>
  )
}
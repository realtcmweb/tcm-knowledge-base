import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

interface Formula {
  id: number
  name: string
  source: string
  composition: string
  usage: string
  effects: string
  indications: string
  category: string
  categoryLabel: string
}

interface Herb {
  id: number
  name: string
  alias?: string
  category: string
  categoryLabel: string
  properties: string
  effects: string
  indications: string
  dosage: string
}

interface Acupoint {
  code: string
  name: string
  specialType: string
  location: string
  indications: string
}

function loadJSON(filename: string) {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'public/data', filename), 'utf-8'))
  } catch {
    return []
  }
}

function score(item: Record<string, unknown>, q: string, fields: (keyof Record<string, unknown>)[]): number {
  const ql = toSimp(q).toLowerCase()
  let s = 0
  for (const f of fields) {
    const v = String(item[f] ?? '')
    const vl = v.toLowerCase()
    if (vl === ql) s += 100
    else if (vl.startsWith(ql)) s += 60
    else if (vl.includes(ql)) s += 30
  }
  return s
}

// Unicode normalization: convert traditional ↔ simplified
function toTrad(s: string): string {
  const map: Record<string, string> = { '风': '風', '药': '藥', '证': '證', '发': '發', '现': '現', '关': '關', '开': '開', '业': '業', '书': '書', '当': '當', '历': '歷', '经': '經', '学': '學', '为': '為', '义': '義', '务': '務', '从': '從', '时': '时', '长': '長', '变': '變', '见': '見', '进': '進', '陈': '陳', '细': '細', '织': '織', '线': '線', '带': '帶', '节': '節', '虫': '蟲', '干': '乾', '制': '製', '适': '適', '运': '運', '还': '還', '连': '連', '产': '產', '广': '廣', '众': '眾', '种': '種', '数': '數', '断': '斷', '东': '東', '国': '國', '图': '圖', '复': '復', '万': '萬', '与': '與', '来': '來', '车': '車', '办': '辦', '质': '質', '电': '電', '网': '網', '无': '無', '个': '個', '们': '們', '对': '對', '过': '過', '场': '場', '内': '內', '价': '價', '几': '幾', '只': '隻', '见': '見', '间': '間', '题': '題', '关': '關', '头': '頭', '面': '面', '体': '體', '击': '擊', '集': '集', '类': '類', '号': '號', '计': '計', '认': '認', '让': '讓', '论': '論', '调': '調', '查': '查', '谷': '穀' }
  return s.replace(/[風藥證發現關開業書當歷經學為義務從時長變見進陳細織線帶節蟲乾製適運還連產廣眾種數斷東國圖復萬與來車辦質電網無個們對過場內價幾隻見間題頭面體擊集類號認讓論調査穀]/g, m => map[m] || m)
}
function toSimp(s: string): string {
  const map: Record<string, string> = { '風': '风', '藥': '药', '證': '证', '發': '发', '現': '现', '關': '关', '開': '开', '業': '业', '書': '书', '當': '当', '歷': '历', '經': '经', '學': '学', '為': '为', '義': '义', '務': '务', '從': 'from', '時': '时', '長': '长', '變': '变', '見': '见', '進': '进', '陳': 'from', '細': '细', '織': '织', '線': '线', '帶': '带', '節': '节', '蟲': '虫', '乾': '干', '製': '制', '適': '适', '運': '运', '還': '还', '連': '连', '產': '产', '廣': '广', '眾': '众', '種': '种', '數': '数', '斷': '断', '東': '东', '國': '国', '圖': '图', '復': '复', '萬': '万', '與': 'with', '來': '来', '車': '车', '辦': '办', '質': '质', '電': '电', '網': '网', '無': '无', '個': '个', '們': '们', '對': '对', '過': '过', '場': '场', '內': '内', '價': '价', '幾': '几', '隻': '只', '見': '见', '間': '间', '題': '题', '頭': '头', '體': '体', '擊': '击', '類': '类', '號': '号', '認': '认', '讓': '让', '論': '论', '調': '调', '查': '查', '穀': '谷' }
  return s.replace(/[風藥證發現關開業書當歷經學為義務從時長變見進陳細織線帶節蟲乾製適運還連產廣眾種數斷東國圖復萬與來車辦質電網無個們對過場內價幾隻見間題頭面體擊集類號認讓論調査穀]/g, m => map[m] || m)
}


export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  if (!q) return NextResponse.json({ formulas: [], herbs: [], acupoints: [] })

  const [formulas, herbs, acupoints] = await Promise.all([
    Promise.resolve(loadJSON('formulas.json') as Formula[]),
    Promise.resolve(loadJSON('herbs.json') as Herb[]),
    Promise.resolve(loadJSON('acupoints.json') as Acupoint[]),
  ])

  const ql = toSimp(q).toLowerCase()

  const matchedFormulas = formulas
    .filter(f => [f.name, f.effects, f.indications, f.categoryLabel, f.composition].some(v => toSimp(String(v ?? "")).toLowerCase().includes(ql)))
    .map(f => ({ ...f, _type: '方劑' as const, _score: score(f as unknown as Record<string, unknown>, q, ['name', 'effects', 'indications', 'categoryLabel']) }))

  const matchedHerbs = herbs
    .filter(h => [h.name, h.alias, h.effects, h.indications, h.categoryLabel].some(v => toSimp(String(v ?? "")).toLowerCase().includes(ql)))
    .map(h => ({ ...h, _type: '中藥' as const, _score: score(h as unknown as Record<string, unknown>, q, ['name', 'alias', 'effects', 'indications']) }))

  const matchedAcupoints = acupoints
    .filter(a => [a.name, a.code, a.indications, a.specialType].some(v => toSimp(String(v ?? "")).toLowerCase().includes(ql)))
    .map(a => ({ ...a, _type: '穴位' as const, _score: score(a as unknown as Record<string, unknown>, q, ['name', 'code', 'indications']) }))

  // Sort by score descending
  ;[matchedFormulas, matchedHerbs, matchedAcupoints].forEach(arr => arr.sort((a, b) => b._score - a._score))

  // Limit each category
  const LIMIT = 20
  return NextResponse.json({
    q,
    formulas: matchedFormulas.slice(0, LIMIT),
    herbs: matchedHerbs.slice(0, LIMIT),
    acupoints: matchedAcupoints.slice(0, LIMIT),
    total: matchedFormulas.length + matchedHerbs.length + matchedAcupoints.length,
  })
}
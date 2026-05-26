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
  const ql = q.toLowerCase()
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

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  if (!q) return NextResponse.json({ formulas: [], herbs: [], acupoints: [] })

  const [formulas, herbs, acupoints] = await Promise.all([
    Promise.resolve(loadJSON('formulas.json') as Formula[]),
    Promise.resolve(loadJSON('herbs.json') as Herb[]),
    Promise.resolve(loadJSON('acupoints.json') as Acupoint[]),
  ])

  const ql = q.toLowerCase()

  const matchedFormulas = formulas
    .filter(f => [f.name, f.effects, f.indications, f.categoryLabel, f.composition].some(v => v?.toLowerCase().includes(ql)))
    .map(f => ({ ...f, _type: '方劑' as const, _score: score(f as unknown as Record<string, unknown>, q, ['name', 'effects', 'indications', 'categoryLabel']) }))

  const matchedHerbs = herbs
    .filter(h => [h.name, h.alias, h.effects, h.indications, h.categoryLabel].some(v => v?.toLowerCase().includes(ql)))
    .map(h => ({ ...h, _type: '中藥' as const, _score: score(h as unknown as Record<string, unknown>, q, ['name', 'alias', 'effects', 'indications']) }))

  const matchedAcupoints = acupoints
    .filter(a => [a.name, a.code, a.indications, a.specialType].some(v => v?.toLowerCase().includes(ql)))
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
// 12經絡 + 任督二脈 模組索引
// 狀態：complete = 已填資料，stub = 空殼待開發

import type { MeridianInfo } from './types'

export { LU_MERIDIAN, LU_POINTS_DATA } from './LU_lung'
export { LI_MERIDIAN, LI_POINTS_DATA } from './LI_large_intestine'
export { ST_MERIDIAN, ST_POINTS_DATA } from './ST_stomach'
export { SP_MERIDIAN, SP_POINTS_DATA } from './SP_spleen'
export { HT_MERIDIAN, HT_POINTS_DATA } from './HT_heart'
export { SI_MERIDIAN, SI_POINTS_DATA } from './SI_small_intestine'
export { BL_MERIDIAN, BL_POINTS_DATA } from './BL_bladder'
export { KI_MERIDIAN, KI_POINTS_DATA } from './KI_kidney'
export { PC_MERIDIAN, PC_POINTS_DATA } from './PC_pericardium'
export { SJ_MERIDIAN, SJ_POINTS_DATA } from './SJ_triple_burner'
export { GB_MERIDIAN, GB_POINTS_DATA } from './GB_gallbladder'
export { LR_MERIDIAN, LR_POINTS_DATA } from './LR_liver'
export { RN_MERIDIAN, RN_POINTS_DATA } from './RN_ren_mai'
export { DV_MERIDIAN, DV_POINTS_DATA } from './DV_du_mai'

export const ALL_MERIDIANS: MeridianInfo[] = [
  LU_MERIDIAN,
  LI_MERIDIAN,
  ST_MERIDIAN,
  SP_MERIDIAN,
  HT_MERIDIAN,
  SI_MERIDIAN,
  BL_MERIDIAN,
  KI_MERIDIAN,
  PC_MERIDIAN,
  SJ_MERIDIAN,
  GB_MERIDIAN,
  LR_MERIDIAN,
  RN_MERIDIAN,
  DV_MERIDIAN,
]

export const MERIDIAN_MAP: Record<string, MeridianInfo> = Object.fromEntries(
  ALL_MERIDIANS.map(m => [m.code, m])
)
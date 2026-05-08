'use client'

import { useState, useRef, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Head from 'next/head'
import LanguageSelector from '../../components/LanguageSelector'

// ============================================
// 題目類型
// ============================================
interface QOption { value: string; label: string; labelKey?: string }
interface Question {
  id: string
  text: string
  textKey?: string
  type?: string
  required?: boolean
  options?: QOption[]
  placeholder?: string
  unit?: string
  hasCustomAgeInput?: boolean
}

// ============================================
// 問卷題目庫
// ============================================
const CHIEF_COMPLAINTS = [
  { value: '調養', label: '調養身體 / 健康檢查', icon: '🌱' },
  { value: '失眠', label: '失眠 / 睡不好', icon: '🌙' },
  { value: '疲倦', label: '疲倦 / 沒精神', icon: '😴' },
  { value: '消化', label: '腹瀉 / 便祕 / 胃脹', icon: '🔄' },
  { value: '冰冷', label: '手腳冰冷', icon: '🥶' },
  { value: '頭痛', label: '頭痛 / 頭暈', icon: '💫' },
  { value: '咳嗽', label: '咳嗽 / 喉嚨問題', icon: '🫁' },
  { value: '皮膚', label: '皮膚 / 過敏', icon: '🔴' },
  { value: '情緒', label: '情緒 / 壓力問題', icon: '💢' },
  { value: '月經', label: '月經失調（女性）', icon: '🌸' },
  { value: '疼痛', label: '腰酸 / 關節 / 各種痛', icon: '💉' },
  { value: '減肥', label: '減肥 / 控制體重', icon: '⚖️' },
  { value: '備孕', label: '備孕 / 調理不孕', icon: '🤰' },
  { value: '過敏', label: '過敏 / 鼻炎 / 氣喘', icon: '🤧' },
  { value: '其他', label: '其他問題', icon: '📋' },
]

// 年齡選項（全部顯示，上半部按鈕）
const AGE_OPTIONS = [
  { value: '0-6', label: '🧒 幼兒（0-6歲）' },
  { value: '7-11', label: '🎒 學齡（7-11歲）' },
  { value: '12-17', label: '🧑 青少年（12-17歲）' },
  { value: '18-30', label: '18 - 30 歲' },
  { value: '31-45', label: '31 - 45 歲' },
  { value: '46-60', label: '46 - 60 歲' },
  { value: '60-74', label: '👴 老年人（60-74歲）' },
  { value: '75-89', label: '🧓 高齡老人（75-89歲）' },
  { value: '90+', label: '🎂 長壽老人（90歲以上）' },
]

const BASIC_QUESTIONS: Question[] = [
  { id: 'gender', text: '您的性別是？', options: [
    { value: '男', label: '👨 男性' },
    { value: '女', label: '👩 女性' },
  ]},
  { id: 'age', text: '您的年齡是？', options: AGE_OPTIONS, hasCustomAgeInput: true },
  { id: 'height', text: '身高（選填）', type: 'input_number', placeholder: '例：170', unit: 'cm' },
  { id: 'weight', text: '體重（選填）', type: 'input_number', placeholder: '例：65', unit: 'kg' },
]

// 快速問診核心題（每主訴精選3題）
const FAST_QUESTIONS: Record<string, Question[]> = {
  '失眠': [
    { id: 'f_s1', text: '睡覺時主要困擾是什麼？', options: [
      { value: '難入睡', label: '很難入睡（超過30分鐘）' },
      { value: '易醒', label: '容易醒 / 淺眠' },
      { value: '早醒', label: '早醒後睡不著' },
      { value: '多夢', label: '多夢，像沒睡過' },
    ]},
    { id: 'f_s2', text: '睡覺時是否出汗？', options: [
      { value: '無', label: '沒有出汗' },
      { value: '盜汗', label: '睡到一半出汗（盜汗）' },
      { value: '自汗', label: '稍微動一下就滿頭大汗' },
    ]},
    { id: 'f_s3', text: '白天是否有以下情況？', options: [
      { value: 'none', label: '沒有，正常' },
      { value: '心煩', label: '心煩 / 想事情停不下來' },
      { value: '疲倦', label: '白天很疲倦沒精神' },
      { value: '心悸', label: '心悸 / 胸悶' },
    ]},
  ],
  '疲倦': [
    { id: 'f_t1', text: '疲倦主要集中在什麼時間？', options: [
      { value: '早上', label: '一起床就累' },
      { value: '下午', label: '下午3-5點最明顯' },
      { value: '晚上', label: '晚上才開始累' },
      { value: '整天', label: '整天都累' },
    ]},
    { id: 'f_t2', text: '說話聲音是否低弱無力？', options: [
      { value: '正常', label: '正常' },
      { value: '輕微', label: '稍微低弱' },
      { value: '很弱', label: '很微弱' },
    ]},
    { id: 'f_t3', text: '手腳沉重嗎？', options: [
      { value: '無', label: '沒有' },
      { value: '輕微', label: '輕微' },
      { value: '明顯', label: '很明顯' },
    ]},
  ],
  '消化': [
    { id: 'f_d1', text: '大便形態？', options: [
      { value: '正常', label: '成形正常' },
      { value: '稀軟', label: '偏軟 / 腹瀉' },
      { value: '硬', label: '乾硬 / 便祕' },
      { value: '黏', label: '黏膩 / 粘馬桶' },
    ]},
    { id: 'f_d2', text: '吃飯後容易腹脹嗎？', options: [
      { value: '無', label: '沒有' },
      { value: '輕微', label: '稍微腹脹' },
      { value: '嚴重', label: '很脹不舒服' },
    ]},
    { id: 'f_d3', text: '整體怕冷還是怕熱？', options: [
      { value: '怕冷', label: '怕冷（吃冷的腸胃不適）' },
      { value: '怕熱', label: '怕熱（想吃冰的）' },
      { value: '兩者', label: '兩者都有' },
      { value: '無', label: '沒有特別' },
    ]},
  ],
  '冰冷': [
    { id: 'f_c1', text: '手腳冰冷主要集中在哪裡？', options: [
      { value: '手', label: '手冷為主' },
      { value: '腳', label: '腳冷為主' },
      { value: '手腳', label: '手腳都冷' },
      { value: '四肢', label: '冷到手臂/大腿' },
    ]},
    { id: 'f_c2', text: '上半身和下半身溫度差異？', options: [
      { value: '上身熱下身冷', label: '上身熱、下身冷（常見）' },
      { value: '差不多', label: '上下差不多' },
      { value: '只有手腳', label: '只有手腳冷，身體正常' },
    ]},
    { id: 'f_c3', text: '晚上睡覺會因為腳冷而醒來嗎？', options: [
      { value: '無', label: '不會' },
      { value: '有時', label: '有時會' },
      { value: '經常', label: '經常冷到睡不著' },
    ]},
  ],
  '頭痛': [
    { id: 'f_h1', text: '頭痛位置主要在哪裡？', options: [
      { value: '兩側', label: '兩側太陽穴' },
      { value: '前額', label: '前額 / 眉心' },
      { value: '頭頂', label: '頭頂' },
      { value: '後腦', label: '後腦勺' },
      { value: '整頭', label: '整個頭都痛' },
    ]},
    { id: 'f_h2', text: '頭痛的性質？', options: [
      { value: '脹', label: '脹痛（血往上衝）' },
      { value: '刺痛', label: '刺痛（像針刺）' },
      { value: '悶痛', label: '悶痛 / 昏沉' },
      { value: '暈', label: '頭暈為主' },
    ]},
    { id: 'f_h3', text: '頭痛與月經/情緒有關嗎？', options: [
      { value: '無', label: '無關' },
      { value: '月經', label: '與月經週期相關' },
      { value: '情緒', label: '與情緒壓力相關' },
      { value: '感冒', label: '感冒/發燒時加劇' },
    ]},
  ],
  '咳嗽': [
    { id: 'f_k1', text: '咳嗽有痰還是乾咳？', options: [
      { value: '乾咳', label: '乾咳（沒有痰）' },
      { value: '有痰', label: '有痰' },
      { value: '痰多', label: '痰很多' },
    ]},
    { id: 'f_k2', text: '痰的顏色？', options: [
      { value: '白', label: '白 / 透明' },
      { value: '黃', label: '黃 / 綠' },
      { value: '少', label: '很少痰' },
    ]},
    { id: 'f_k3', text: '咳嗽什麼時間最嚴重？', options: [
      { value: '白天', label: '白天為主' },
      { value: '晚上', label: '晚上躺下後' },
      { value: '清晨', label: '清晨起床時' },
      { value: '全天', label: '整天都咳' },
    ]},
  ],
  '皮膚': [
    { id: 'f_sk1', text: '皮膚問題主要在哪裡？', options: [
      { value: '臉', label: '臉部' },
      { value: '手腳', label: '手腳' },
      { value: '背部', label: '背部' },
      { value: '全身', label: '全身都有' },
    ]},
    { id: 'f_sk2', text: '癢的時間規律？', options: [
      { value: '晚上', label: '晚上睡覺時最癢' },
      { value: '白天', label: '白天活動時' },
      { value: '悶熱', label: '悶熱/流汗時' },
      { value: '無規律', label: '沒特別規律' },
    ]},
    { id: 'f_sk3', text: '皮膚問題持續多久了？', options: [
      { value: '幾天', label: '幾天（急性）' },
      { value: '幾週', label: '幾週' },
      { value: '幾月', label: '幾個月' },
      { value: '年以上', label: '一年以上（慢性）' },
    ]},
  ],
  '情緒': [
    { id: 'f_e1', text: '情緒主要狀態？', options: [
      { value: '焦慮', label: '焦慮 / 緊張 / 擔心' },
      { value: '低落', label: '低落 / 抑鬱 / 對什麼都沒興趣' },
      { value: '易怒', label: '易怒 / 脾氣大' },
      { value: '壓力', label: '壓力大 / 緊繃' },
    ]},
    { id: 'f_e2', text: '睡眠受到情緒影響嗎？', options: [
      { value: '無', label: '沒有，睡眠正常' },
      { value: '輕微', label: '輕微影響' },
      { value: '嚴重', label: '失眠或嗜睡' },
    ]},
    { id: 'f_e3', text: '身體有沒有不舒服伴隨情緒問題？', options: [
      { value: '胸悶', label: '胸悶 / 心悸' },
      { value: '胃', label: '胃痛 / 消化問題' },
      { value: '頭痛', label: '頭痛 / 頭暈' },
      { value: '無', label: '主要是情緒問題' },
    ]},
  ],
  '月經': [
    { id: 'f_m1', text: '月經週期正常嗎？', options: [
      { value: '正常', label: '正常（25-35天）' },
      { value: '提前', label: '提前（不到25天）' },
      { value: '推遲', label: '推遲（超過35天）' },
      { value: '不規律', label: '不規律' },
    ]},
    { id: 'f_m2', text: '經量情況？', options: [
      { value: '正常', label: '正常' },
      { value: '多', label: '量多（側漏）' },
      { value: '少', label: '量少（2天就結束）' },
    ]},
    { id: 'f_m3', text: '經期有沒有痛經？', options: [
      { value: '無', label: '沒有' },
      { value: '輕微', label: '輕微不適' },
      { value: '嚴重', label: '疼痛影響生活' },
    ]},
  ],
  '疼痛': [
    { id: 'f_p1', text: '疼痛位置？', options: [
      { value: '腰', label: '腰痛 / 腰酸' },
      { value: '關節', label: '關節疼痛' },
      { value: '肌肉', label: '肌肉酸痛' },
      { value: '神經', label: '神經痛（刺痛/麻木）' },
    ]},
    { id: 'f_p2', text: '疼痛性質？', options: [
      { value: '冷痛', label: '冷痛（遇冷加劇）' },
      { value: '熱痛', label: '熱痛（遇熱加劇）' },
      { value: '刺痛', label: '刺痛 / 針刺感' },
      { value: '酸痛', label: '酸軟無力' },
    ]},
    { id: 'f_p3', text: '疼痛與時間/活動關係？', options: [
      { value: '休息', label: '休息時更痛' },
      { value: '活動', label: '活動/走路時更痛' },
      { value: '天氣', label: '與天氣變化相關' },
    ]},
  ],
  '減肥': [
    { id: 'f_l1', text: '減肥的主要原因是？', options: [
      { value: '美觀', label: '外觀 / 線條' },
      { value: '健康', label: '健康考量（三高/脂肪肝）' },
      { value: '活力', label: '提升活力' },
      { value: '生育', label: '備孕需要' },
    ]},
    { id: 'f_l2', text: '目前體重困擾程度？', options: [
      { value: '輕微', label: '輕微（想稍微緊實）' },
      { value: '中等', label: '中等（已影響自信）' },
      { value: '嚴重', label: '嚴重（健康亮紅燈）' },
    ]},
    { id: 'f_l3', text: '有嘗試過減肥嗎？', options: [
      { value: '無', label: '很少或沒有' },
      { value: '運動', label: '運動減肥' },
      { value: '飲食', label: '控制飲食' },
      { value: '藥物', label: '吃藥/產品' },
    ]},
  ],
  '備孕': [
    { id: 'f_b1', text: '備孕多久了？', options: [
      { value: '未開始', label: '還沒正式備孕' },
      { value: '半年內', label: '半年內' },
      { value: '1年內', label: '半年～1年' },
      { value: '1年以上', label: '超過1年' },
    ]},
    { id: 'f_b2', text: '有沒有做過相關檢查？', options: [
      { value: '無', label: '沒有' },
      { value: '先生', label: '先生有做過' },
      { value: '太太', label: '太太有做過' },
      { value: '雙方', label: '雙方都有' },
    ]},
    { id: 'f_b3', text: '月經規律嗎？（女性填寫）', options: [
      { value: '規律', label: '規律（25-35天）' },
      { value: '不規律', label: '不規律' },
      { value: '停經', label: '已停經' },
      { value: '不適用', label: '不適用' },
    ]},
  ],
  '過敏': [
    { id: 'f_a1', text: '過敏主要症狀？', options: [
      { value: '鼻', label: '鼻過敏 / 打噴嚏 / 鼻塞' },
      { value: '皮', label: '皮膚癢 / 蕁麻疹 / 濕疹' },
      { value: '眼', label: '眼睛癢 / 紅腫' },
      { value: '呼', label: '氣喘 / 呼吸困難' },
    ]},
    { id: 'f_a2', text: '過敏頻率？', options: [
      { value: '季節性', label: '季節性（春夏/秋冬）' },
      { value: '常年', label: '常年都有' },
      { value: '偶發', label: '偶爾發作' },
      { value: '嚴重', label: '經常發作且嚴重' },
    ]},
    { id: 'f_a3', text: '有沒有做過過敏原檢測？', options: [
      { value: '無', label: '沒有' },
      { value: '有', label: '有，知道過敏原' },
      { value: '部分', label: '有，但不完全' },
    ]},
  ],
  '調養': [
    { id: 'f_w1', text: '您想要調養哪方面？', options: [
      { value: ' general', label: '整體身體調養' },
      { value: '免疫', label: '提升免疫力' },
      { value: '疲勞', label: '改善慢性疲勞' },
      { value: '睡眠', label: '改善睡眠品質' },
      { value: '消化', label: '腸胃功能調整' },
      { value: '情緒', label: '情緒壓力舒緩' },
    ]},
    { id: 'f_w2', text: '過去有做過健康檢查嗎？', options: [
      { value: '無', label: '很少或沒有' },
      { value: '正常', label: '檢查結果正常' },
      { value: '異常', label: '有些異常指標' },
      { value: '有問題', label: '有明確健康問題' },
    ]},
    { id: 'f_w3', text: '平時作息規律嗎？', options: [
      { value: '規律', label: '規律（早睡早起）' },
      { value: '一般', label: '還算正常' },
      { value: '不規律', label: '常熬夜/日夜顛倒' },
    ]},
  ],
  '其他': [
    { id: 'f_o1', text: '不舒服的部位或症狀？', options: [
      { value: '頭部', label: '頭暈 / 頭痛' },
      { value: '胸腹', label: '胸悶 / 腹脹 / 胃痛' },
      { value: '四肢', label: '手腳麻木 / 關節痛' },
      { value: '全身', label: '全身性症狀' },
      { value: '其他', label: '其他部位' },
    ]},
    { id: 'f_o2', text: '這個問題持續多久了？', options: [
      { value: '幾天', label: '几天内' },
      { value: '幾週', label: '几週' },
      { value: '幾月', label: '几个月' },
      { value: '年以上', label: '一年以上' },
    ]},
    { id: 'f_o3', text: '有沒有做過相關檢查或治療？', options: [
      { value: '無', label: '沒有' },
      { value: '檢查', label: '有做過檢查' },
      { value: '治療', label: '有治療過（中/西）' },
    ]},
  ],
}

// 詳細問診補充題
const DETAILED_EXTRA: Question[] = [
  { id: 'd1', text: '怕冷程度？', options: [
    { value: '不怕', label: '不怕冷' },
    { value: '輕微', label: '輕微怕冷' },
    { value: '很怕', label: '很怕冷（冬天離不開被）' },
    { value: '極度', label: '極度怕冷' },
  ]},
  { id: 'd2', text: '怕熱程度？', options: [
    { value: '不怕', label: '不怕熱' },
    { value: '輕微', label: '輕微怕熱' },
    { value: '很怕', label: '很怕熱' },
  ]},
  { id: 'd3', text: '口渴情況？', options: [
    { value: '不渴', label: '不口渴' },
    { value: '想喝冷水', label: '想喝冷水 / 冰的' },
    { value: '想喝熱水', label: '想喝熱水' },
    { value: '喝不多', label: '口渴但不想喝水' },
  ]},
  { id: 'd4', text: '胃口情況？', options: [
    { value: '正常', label: '正常' },
    { value: '不振', label: '食慾不振' },
    { value: '亢進', label: '容易飢餓' },
    { value: '胃脹', label: '吃一點就飽' },
  ]},
  { id: 'd5', text: '小便情況？', options: [
    { value: '正常', label: '正常' },
    { value: '清長', label: '尿清、量多' },
    { value: '短赤', label: '尿黃、量少' },
    { value: '頻數', label: '尿頻 / 夜尿多' },
  ]},
  { id: 'd6', text: '有沒有耳鳴或聽力問題？', options: [
    { value: '無', label: '沒有' },
    { value: '輕微', label: '輕微耳鳴' },
    { value: '明顯', label: '明顯耳鳴/聽力下降' },
  ]},
  { id: 'd7', text: '過去有沒有大手術或長期服用藥物？', options: [
    { value: '無', label: '沒有' },
    { value: '手術', label: '有大手術史' },
    { value: '藥物', label: '長期服用藥物' },
    { value: '兩者', label: '兩者都有' },
  ]},
  { id: 'd8', text: '您認為發病或症狀加重的原因是什麼？', type: 'input_text', placeholder: '壓力/飲食/作息/感冒/情緒...' },
]

// ============================================
// 中醫體質/證型分析引擎
// ============================================
// 辯證要點：每種體質的關鍵判定指標
const PATTERN_KEYS: Record<string, string[]> = {
  '陰虛': ['怕熱', '盜汗/自汗', '失眠/多夢/易醒'],
  '陽虛': ['怕冷', '腰酸/冷痛', '夜尿多/尿清'],
  '氣虛': ['疲倦乏力', '說話無力', '稍動即喘'],
  '痰濕': ['身體沉重', '大便黏膩', '舌苔厚膩'],
  '氣鬱': ['情緒波動大', '胸脅脹悶', '易怒/焦慮'],
  '脾虛': ['食欲不振', '大便異常', '飯後腹脹'],
  '需調理': ['陰陽偏頗', '輕度失衡', '需持續調養'],
}

// 中成藥用藥禁忌（通用版）
const HERB_CAUTIONS: Record<string, string[]> = {
  '六味地黃丸': ['脾胃虛弱、腹瀉者慎用', '孕婦慎用', '感冒期間停用'],
  '天王補心丹': ['脾胃虛寒、腹瀉者慎用', '孕婦慎用', '不宜與咖啡因同服'],
  '生脈飲': ['感冒發燒時停用', '有實熱證者慎用'],
  '理中丸': ['胃熱、胃潰疡者不宜', '孕婦慎用', '口乾咽燥者慎用'],
  '金匱腎氣丸': ['孕婦禁用', '有實熱證（口瘡、便秘）者慎用', '心悸失眠者慎用'],
  '四神湯': ['孕婦慎用', '胃潰疡急性期慎用', '對食材過敏者慎用'],
  '補中益氣丸': ['感冒發燒時停用', '血壓高者慎用', '不宜與蘿蔔同服'],
  '四君子湯': ['感冒發燒時停用', '有實熱證者慎用'],
  '平胃散': ['胃潰疡、胃酸過多者慎用', '孕婦慎用', '陰虛體質慎用'],
  '二陳湯': ['孕婦慎用', '胃酸過多者慎用', '乾咳無痰者慎用'],
  '溫膽湯': ['孕婦慎用', '胃潰疡者慎用', '心悸心慌者慎用'],
  '逍遙丸': ['感冒發燒時停用', '月經過多者慎用', '孕婦慎用'],
  '柴胡疏肝散': ['孕婦慎用', '肝陰不足（眩暈、口乾）者慎用', '胃潰疡者慎用'],
  '甘麥大棗湯': ['對小麥過敏者禁用', '血糖高者注意糖分'],
  '參苓白朮散': ['感冒發燒時停用', '有實熱證者慎用', '便秘者慎用'],
  '附子理中丸': ['孕婦禁用', '高血壓、心臟病者慎用', '胃潰疡出血者禁用'],
}

function getHerbCautions(herbs: string[]): string[] {
  return herbs.flatMap(h => HERB_CAUTIONS[h] || []).filter((v, i, a) => a.indexOf(v) === i)
}

function getPatternKeys(type: string): string[] {
  return PATTERN_KEYS[type] || PATTERN_KEYS['需調理']
}

// ============================================
// 分析引擎
// ============================================
function analyzeCondition(answers: Record<string, string>): {
  type: string; sub: string; pattern: string; description: string
  suggestions: string[]; avoid: string[]; herbs: string[]; acupoints: string[]; diet: string[]
  energy: number; stress: number; resilience: number; innerEnergy: number
  lifestyle: { exercise: number; nutrition: number; environment: number; psychology: number; sleep: number; hormonal: number }
  meridianBalance: { left: number; right: number }
} {
  const vals = Object.values(answers).join('')

  if (vals.includes('怕熱') && (vals.includes('盜汗') || vals.includes('自汗')) && (vals.includes('難入睡') || vals.includes('多夢') || vals.includes('易醒'))) {
    return { type: '陰虛', sub: '心腎陰虛', pattern: '虛熱', description: '您屬於陰虛體質，虛火內擾，常見盜汗、失眠、口乾咽燥。調理以滋陰清熱、養心安神為主。', suggestions: ['少吃燒烤炸辣', '多吃百合、銀耳、麥冬、玉竹', '避免熬夜（23點前入睡）', '練習太極/冥想'], avoid: ['咖啡因', '酒精', '辛辣', '炸物'], herbs: ['六味地黃丸', '天王補心丹', '生脈飲'], acupoints: ['太溪穴（足內側）', '湧泉穴（足底）', '內關穴（手腕）'], diet: ['百合銀耳羹：百合30g + 銀耳20g + 冰糖', '麥冬玉竹茶：麥冬10g + 玉竹10g 熱水泡', '桑椹枸杞茶：桑椹15g + 枸杞10g'], energy: 68, stress: 3.8, resilience: 45, innerEnergy: 58, lifestyle: { exercise: 72, nutrition: 78, environment: 85, psychology: 65, sleep: 58, hormonal: 62 }, meridianBalance: { left: 1.42, right: 1.38 } }
  }
  if (vals.includes('怕冷') && (vals.includes('很怕') || vals.includes('極度')) && (vals.includes('腰') || vals.includes('冷痛') || vals.includes('夜尿') || vals.includes('清長'))) {
    return { type: '陽虛', sub: '脾腎陽虛', pattern: '虛寒', description: '您屬於陽虛體質，火力不足，畏寒怕冷，容易疲倦。調理以溫補脾腎、助陽驅寒為主。', suggestions: ['多吃溫熱食物（羊肉、龍眼、紅紅棗、薑）', '忌生冷冰品', '每天熱水泡腳（加生薑）', '適度運動（快走、太極）'], avoid: ['冰品', '生菜水果', '冷飲', '西瓜'], herbs: ['理中丸', '金匱腎氣丸', '四神湯'], acupoints: ['關元穴（肚臍下）', '命門穴（後腰）', '足三里（膝蓋下）'], diet: ['羊肉當歸湯：羊肉250g + 當歸10g + 薑3片', '桂圓紅棗茶：桂圓10顆 + 紅棗5顆', '生薑紅糖水：生薑3片 + 紅糖'], energy: 52, stress: 2.8, resilience: 55, innerEnergy: 62, lifestyle: { exercise: 65, nutrition: 70, environment: 88, psychology: 75, sleep: 68, hormonal: 58 }, meridianBalance: { left: 1.52, right: 1.54 } }
  }
  if ((vals.includes('疲倦') || vals.includes('整天') || vals.includes('早上')) && (vals.includes('輕微') || vals.includes('很弱') || vals.includes('說話') || vals.includes('正常') === false)) {
    return { type: '氣虛', sub: '脾肺氣虛', pattern: '虛', description: '您屬於氣虛體質，元氣不足，容易疲勞，說話無力，稍動即喘。調理以補氣健脾、益肺固表為主。', suggestions: ['多吃山藥、黃耆、黨參、紅棗', '忌耗氣食物（白蘿蔔、茶葉）', '保證充足睡眠（8小時）', '避免過度疲勞'], avoid: ['過度勞累', '熬夜', '劇烈運動', '減肥節食'], herbs: ['補中益氣丸', '四君子湯', '生脈飲'], acupoints: ['氣海穴（肚臍下）', '肺俞穴（背部）', '足三里（膝蓋下）'], diet: ['山藥粥：山藥200g + 粳米100g 煮粥', '黨參黃耆茶：黨參10g + 黃耆10g', '紅棗桂圓湯：紅棗10顆 + 桂圓15g'], energy: 44, stress: 2.2, resilience: 40, innerEnergy: 55, lifestyle: { exercise: 58, nutrition: 72, environment: 82, psychology: 70, sleep: 52, hormonal: 65 }, meridianBalance: { left: 1.35, right: 1.40 } }
  }
  if ((vals.includes('黏') || vals.includes('胃脹') || vals.includes('痰多') || vals.includes('渾身')) && (vals.includes('疲倦') || vals.includes('沉重'))) {
    return { type: '痰濕', sub: '痰濕困脾', pattern: '實', description: '您屬於痰濕體質，濕濁內蘊，身體沉重，容易長痘或出油。調理以燥濕化痰、健脾利濕為主。', suggestions: ['少吃甜食油膩', '多吃薏仁、赤小豆、冬瓜', '保持環境乾燥', '規律運動（微汗為佳）'], avoid: ['甜食', '油炸', '糯米', '奶製品', '酒'], herbs: ['平胃散', '二陳湯', '溫膽湯'], acupoints: ['陰陵泉（小腿內側）', '豐隆穴（小腿外側）', '中脘穴（肚臍上）'], diet: ['薏仁紅豆粥：薏仁30g + 赤小豆30g', '冬瓜排骨湯：冬瓜500g + 排骨250g', '陳皮普洱茶：陳皮5g + 普洱5g'], energy: 48, stress: 3.2, resilience: 42, innerEnergy: 60, lifestyle: { exercise: 55, nutrition: 58, environment: 78, psychology: 72, sleep: 62, hormonal: 68 }, meridianBalance: { left: 1.60, right: 1.45 } }
  }
  if ((vals.includes('易怒') || vals.includes('焦慮') || vals.includes('壓力')) && (vals.includes('胸悶') || vals.includes('胃') || vals.includes('腹脹'))) {
    return { type: '氣鬱', sub: '肝氣鬱結', pattern: '實', description: '您屬於氣鬱體質，肝氣不舒，情緒波動大，胸脅脹悶。調理以疏肝理氣、解鬱安神為主。', suggestions: ['多喝花茶（玫瑰花、菊花、茉莉花）', '找人傾訴', '按摩太衝穴', '規律作息'], avoid: ['過度壓抑情緒', '酒精', '熬夜', '生悶氣'], herbs: ['逍遙丸', '柴胡疏肝散', '甘麥大棗湯'], acupoints: ['太衝穴（足大趾旁）', '合谷穴（手虎口）', '膻中穴（胸口）'], diet: ['玫瑰花茶：玫瑰花5g 熱水泡', '茉莉花茶：茉莉花5g + 綠茶', '菊花枸杞茶：菊花5g + 枸杞10g'], energy: 55, stress: 4.2, resilience: 38, innerEnergy: 65, lifestyle: { exercise: 60, nutrition: 75, environment: 80, psychology: 55, sleep: 50, hormonal: 72 }, meridianBalance: { left: 1.30, right: 1.55 } }
  }
  if ((vals.includes('稀軟') || vals.includes('腹瀉') || vals.includes('不振') || vals.includes('胃脹') || vals.includes('吃一點'))) {
    return { type: '脾虛', sub: '脾胃虛弱', pattern: '虛', description: '您屬於脾虛體質，運化失常，大便異常，食慾不振。調理以健脾和胃、補中益氣為主。', suggestions: ['定時定量用餐', '多吃山藥、茯苓、蓮子', '飯後散步30分鐘', '少吃生冷油膩'], avoid: ['冰品', '空腹吃水果', '暴飲暴食', '甜食'], herbs: ['參苓白朮散', '四君子湯', '附子理中丸'], acupoints: ['足三里（膝蓋下3寸）', '中脘穴（肚臍上4寸）', '脾俞穴（背部）'], diet: ['山藥蓮子粥：山藥50g + 蓮子30g + 粳米100g', '茯苓餅：茯苓粉30g + 麵粉100g 煎', '四神豬肚湯：山藥/茯苓/蓮子/芡實 各15g + 豬肚'], energy: 50, stress: 2.5, resilience: 48, innerEnergy: 58, lifestyle: { exercise: 62, nutrition: 62, environment: 85, psychology: 78, sleep: 65, hormonal: 70 }, meridianBalance: { left: 1.48, right: 1.44 } }
  }
  return { type: '需調理', sub: '陰陽偏頗', pattern: 'mixed', description: '根據您的描述，您有陰陽氣血輕度偏頗。建議規律作息、均衡飲食、適度運動以維持健康平衡。', suggestions: ['保持規律作息', '均衡飲食', '每週運動3次', '保持心情愉快'], avoid: ['過度疲勞', '情緒大波動', '熬夜'], herbs: [], acupoints: [], diet: [], energy: 65, stress: 2.8, resilience: 60, innerEnergy: 70, lifestyle: { exercise: 70, nutrition: 75, environment: 82, psychology: 78, sleep: 72, hormonal: 75 }, meridianBalance: { left: 1.45, right: 1.45 } }
}

// ============================================
// 類型
// ============================================
type Step = 'mode' | 'basic' | 'chief' | 'questionnaire' | 'tongue' | 'result'
type Mode = 'fast' | 'detailed'

interface ResultData {
  constitution: ReturnType<typeof analyzeCondition>
  tongue?: Record<string, unknown>
  face?: Record<string, unknown>
  questionnaire_answers: Record<string, string>
}

// ============================================
// 主元件
// ============================================
export default function Home() {
  const t = useTranslations()
  const locale = useLocale()
  const [mode, setMode] = useState<Mode | null>(null)
  const [step, setStep] = useState<Step>('mode')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customInput, setCustomInput] = useState('')
  const [tongueFile, setTongueFile] = useState<File | null>(null)
  const [tonguePreview, setTonguePreview] = useState<string | null>(null)
  const [faceFile, setFaceFile] = useState<File | null>(null)
  const [facePreview, setFacePreview] = useState<string | null>(null)
  const [faceInfo, setFaceInfo] = useState<Record<string, unknown> | null>(null)
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultData | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const faceFileRef = useRef<HTMLInputElement>(null)

  // 當前問卷題目列表
  const chief = answers.chief || '其他'
  const chiefQuestions: Question[] = FAST_QUESTIONS[chief] || FAST_QUESTIONS['其他'] || []
  // 月經題目：性別為男或年齡<10或年齡>65時排除
  const ageNum = parseInt(answers.age || '')
  const excludeMenses = answers.gender === '男' || (!isNaN(ageNum) && (ageNum < 10 || ageNum > 65))
  const filteredChiefQ = excludeMenses && chief === '月經' ? [] : chiefQuestions
  const allDetailedQuestions: Question[] = [...filteredChiefQ, ...DETAILED_EXTRA]
  const currentQuestions: Question[] = mode === 'detailed' ? allDetailedQuestions : filteredChiefQ

  const currentQ = currentQuestions[qIndex] as Question | undefined
  const totalQ = currentQuestions.length
  const progress = totalQ > 0 ? ((qIndex + 1) / totalQ) * 100 : 0

  const handleAnswer = useCallback((value: string) => {
    if (!currentQ) return
    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)
    setCustomInput('')
    setTimeout(() => {
      if (qIndex < totalQ - 1) {
        setQIndex(qIndex + 1)
      } else {
        setStep('tongue')
      }
    }, 350)
  }, [answers, qIndex, currentQ, totalQ])

  const handleInputSubmit = useCallback(() => {
    if (!customInput.trim() || !currentQ) return
    const newAnswers = { ...answers, [currentQ.id]: customInput }
    setAnswers(newAnswers)
    setCustomInput('')
    setTimeout(() => {
      if (qIndex < totalQ - 1) {
        setQIndex(qIndex + 1)
      } else {
        setStep('tongue')
      }
    }, 350)
  }, [answers, qIndex, customInput, currentQ, totalQ])

  const handleTongueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTongueFile(file)
    setImageLoaded(false)
    const reader = new FileReader()
    reader.onload = (ev) => setTonguePreview(ev.target?.result as string)
    reader.onloadend = () => setImageLoaded(true)
  }

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFaceFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFacePreview(ev.target?.result as string)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const constitution = analyzeCondition(answers)
      let tongueInfo: Record<string, unknown> | undefined
      if (tongueFile && imageLoaded) {
        const formData = new FormData()
        formData.append('image', tongueFile)
        try {
          const res = await fetch('/api/tongue', { method: 'POST', body: formData })
          if (res.ok) tongueInfo = await res.json()
        } catch { /* silent */ }
      }
      let faceResult: Record<string, unknown> | undefined
      if (faceFile) {
        const formData2 = new FormData()
        formData2.append('image', faceFile)
        try {
          const res = await fetch('/api/face', { method: 'POST', body: formData2 })
          if (res.ok) faceResult = await res.json()
        } catch { /* silent */ }
      }
      setResult({ constitution, tongue: tongueInfo, face: faceResult, questionnaire_answers: answers })
      setStep('result')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMode(null); setStep('mode'); setQIndex(0); setAnswers({})
    setCustomInput(''); setTongueFile(null); setTonguePreview(null)
    setFaceFile(null); setFacePreview(null); setFaceInfo(null); setShowFaceCapture(false)
    setResult(null); setImageLoaded(false)
  }

  const isLastQ = qIndex === totalQ - 1

  // 選項按鈕渲染
  const renderOptions = (q: Question) => {
    if (!q.options) return null
    return q.options.map(opt => (
      <button
        key={opt.value}
        onClick={() => handleAnswer(opt.value)}
        className={`w-full px-5 py-4 rounded-xl text-left text-sm transition-all border-2 ${answers[q.id] === opt.value ? 'border-emerald-500 bg-emerald-50 font-medium text-emerald-800' : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300'}`}
      >
        {opt.label}
      </button>
    ))
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800" style={{ fontFamily: "'Noto Serif TC', serif" }}>
      <Head><title>{t('header.title')} | TCM AI</title></Head>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-light tracking-wide text-stone-700">{t('header.title')}</h1>
            <p className="text-xs text-stone-400 tracking-widest">{t('header.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector currentLocale={locale} />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
              診
            </div>
          </div>
        </div>
        {(step === 'questionnaire') && (
          <div className="h-1 bg-stone-100">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      {/* ── 模式選擇 ── */}
      {step === 'mode' && (
        <main className="max-w-lg mx-auto px-4 py-10 min-h-[75vh] flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="text-2xl font-light text-stone-700 mb-2">{t('header.title')}</h2>
            <p className="text-sm text-stone-500">{t('home.certified')}</p>
            <p className="text-xs text-stone-400 mt-1">{t('home.tenQuestions')}</p>
          </div>
          <div className="bg-stone-100 rounded-xl p-4 mb-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              🔒 {t('home.privacy')}
            </p>
          </div>
          <div className="space-y-3 mb-8">
            <button onClick={() => { setMode('fast'); setStep('basic') }}
              className="w-full py-5 px-5 bg-white border-2 border-stone-200 rounded-2xl text-left hover:border-emerald-400 transition group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800 group-hover:text-emerald-700">⚡ {t('mode.fast')}</p>
                  <p className="text-xs text-stone-400 mt-1">{t('mode.fastDesc')}</p>
                </div>
                <span className="text-stone-300 group-hover:text-emerald-400">→</span>
              </div>
            </button>
            <button onClick={() => { setMode('detailed'); setStep('basic') }}
              className="w-full py-5 px-5 bg-white border-2 border-stone-200 rounded-2xl text-left hover:border-emerald-400 transition group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800 group-hover:text-emerald-700">🔍 {t('mode.detailed')}</p>
                  <p className="text-xs text-stone-400 mt-1">{t('mode.detailedDesc')}</p>
                </div>
                <span className="text-stone-300 group-hover:text-emerald-400">→</span>
              </div>
            </button>
          </div>
          <div className="bg-stone-100 rounded-xl p-4 text-center">
            <p className="text-xs text-stone-500 leading-relaxed">
              {t('home.tenQuestions')}<br />
              {t('home.privacy')}
            </p>
          </div>
        </main>
      )}

      {/* ── 基本資料 ── */}
      {step === 'basic' && BASIC_QUESTIONS[qIndex] && (
        <main className="max-w-lg mx-auto px-4 py-8 min-h-[70vh] flex flex-col justify-center">
          <div className="text-center mb-6">
            <p className="text-xs text-stone-400 tracking-widest mb-1">基本資料</p>
            <p className="text-xs text-emerald-600">{mode === 'fast' ? t('mode.fast') : t('mode.detailed')} · 協助精準判斷</p>
          </div>
          {(() => {
            const q = BASIC_QUESTIONS[qIndex]

            // input_number 類型（身高、體重）
            if (q.type === 'input_number') {
              return (
                <div className="space-y-3">
                  <h2 className="text-xl font-light text-stone-700 mb-6 text-center">{q.text}</h2>
                  <div className="flex items-center gap-3 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition">
                    <input type="number" placeholder={q.placeholder} value={answers[q.id] || ''}
                      onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="flex-1 outline-none text-stone-800" />
                    <span className="text-stone-400 text-sm">{q.unit}</span>
                  </div>
                  <button onClick={() => {
                    if (qIndex < BASIC_QUESTIONS.length - 1) setQIndex(qIndex + 1)
                    else setStep('chief')
                  }} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-medium">確定 →</button>
                  <button onClick={() => {
                    if (qIndex < BASIC_QUESTIONS.length - 1) setQIndex(qIndex + 1)
                    else setStep('chief')
                  }} className="w-full py-3 text-sm text-stone-400 hover:text-stone-600">跳過（選填）→</button>
                  {qIndex > 0 && <button onClick={() => setQIndex(qIndex - 1)} className="text-xs text-stone-400 hover:text-stone-600">← 上一題</button>}
                </div>
              )
            }

            // 選項類型（含年齡：按鈕 + 底部自訂輸入）
            return (
              <div className="space-y-2.5">
                <h2 className="text-xl font-light text-stone-700 mb-6 text-center">{q.text}</h2>
                {q.options && q.options.map(opt => (
                  <button key={opt.value} onClick={() => {
                    const newA = { ...answers, [q.id]: opt.value }
                    setAnswers(newA)
                    setTimeout(() => {
                      if (qIndex < BASIC_QUESTIONS.length - 1) setQIndex(qIndex + 1)
                      else setStep('chief')
                    }, 350)
                  }} className={`w-full px-5 py-4 rounded-xl text-left text-sm transition-all border-2 ${answers[q.id] === opt.value ? 'border-emerald-500 bg-emerald-50 font-medium text-emerald-800' : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300'}`}>
                    {opt.label}
                  </button>
                ))}

                {/* 年齡：底部數字輸入框 */}
                {q.hasCustomAgeInput && (
                  <div className="mt-4 pt-4 border-t border-stone-200">
                    <p className="text-xs text-stone-400 mb-2 text-center">或直接輸入年齡：</p>
                    <div className="flex items-center gap-3 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition">
                      <input type="number" placeholder="例：35"
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="flex-1 outline-none text-stone-800" />
                      <span className="text-stone-400 text-sm">歲</span>
                    </div>
                    <button onClick={() => {
                      if (qIndex < BASIC_QUESTIONS.length - 1) setQIndex(qIndex + 1)
                      else setStep('chief')
                    }} className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl text-sm mt-2 hover:bg-stone-200 transition">確定 →</button>
                  </div>
                )}

                <button onClick={() => setQIndex(qIndex - 1)} className="text-xs text-stone-400 hover:text-stone-600">← 上一題</button>
              </div>
            )
          })()}
        </main>
      )}

      {/* ── 主訴選擇 ── */}
      {step === 'chief' && (
        <main className="max-w-lg mx-auto px-4 py-8 min-h-[70vh] flex flex-col">
          <div className="text-center mb-6">
            <p className="text-xs text-stone-400 tracking-widest mb-1">第 1 步</p>
            <h2 className="text-xl font-light text-stone-700">您今天最困擾的問題是什麼？</h2>
            <p className="text-xs text-stone-400 mt-1">選一項主要困擾，系統會為您精準問診</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {CHIEF_COMPLAINTS.filter(c => {
              if (c.value !== '月經') return true
              const ageNum = parseInt(answers.age || '')
              return !(answers.gender === '男' || (!isNaN(ageNum) && (ageNum < 10 || ageNum > 65)))
            }).map(c => (
              <button key={c.value} onClick={() => { setAnswers({ ...answers, chief: c.value }); setStep('questionnaire'); setQIndex(0) }}
                className="py-4 px-3 bg-white border-2 border-stone-200 rounded-xl text-center hover:border-emerald-400 transition active:scale-95">
                <div className="text-2xl mb-1">{c.icon}</div>
                <p className="text-xs text-stone-700">{c.label}</p>
              </button>
            ))}
          </div>
          <button onClick={() => { setAnswers({ ...answers, chief: '其他' }); setStep('questionnaire'); setQIndex(0) }}
            className="w-full py-3 text-sm text-stone-500 border-2 border-stone-200 rounded-xl hover:border-emerald-300 transition">其他問題</button>
        </main>
      )}

      {/* ── 動態問卷 ── */}
      {step === 'questionnaire' && currentQ && (
        <main className="max-w-lg mx-auto px-4 py-8 min-h-[70vh] flex flex-col justify-center">
          <div className="text-center mb-6">
            <p className="text-xs text-stone-400 tracking-widest mb-1">
              {mode === 'detailed' ? t('mode.detailed') : t('mode.fast')} · {t('questionnaire.step', { current: qIndex + 1 })} / {totalQ}
            </p>
            {mode === 'detailed' && (
              <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                十問歌全面問診
              </span>
            )}
            <h2 className="text-xl font-light text-stone-700 leading-relaxed mt-2">{currentQ.text}</h2>
            {/* 答題導航指示器 */}
            <div className="flex justify-center gap-1.5 mt-3">
              {currentQuestions.slice(0, 12).map((_, i) => (
                <button key={i} onClick={() => setQIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === qIndex
                      ? 'w-4 bg-emerald-500'
                      : i < qIndex
                        ? 'bg-emerald-300'
                        : 'bg-stone-200'
                  }`} />
              ))}
              {totalQ > 12 && <span className="text-xs text-stone-400">+{totalQ - 12}</span>}
            </div>
          </div>

          {currentQ.type === 'input_text' ? (
            <div className="space-y-3">
              <textarea value={customInput} onChange={e => setCustomInput(e.target.value)}
                placeholder={currentQ.placeholder} rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl text-sm outline-none focus:border-emerald-400 resize-none" />
              <button onClick={handleInputSubmit} disabled={!customInput.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-medium disabled:opacity-50">
                確定 →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {renderOptions(currentQ)}
              {/* 其他選項 */}
              <button onClick={() => handleAnswer('其他')}
                className={`w-full px-5 py-4 rounded-xl text-left text-sm transition-all border-2 ${answers[currentQ.id] === '其他' ? 'border-emerald-500 bg-emerald-50 font-medium' : 'border-stone-200 bg-white text-stone-500 hover:border-emerald-300'}`}>
                其他（自行描述）→
              </button>
            </div>
          )}

          <div className="mt-4 flex justify-between">
            {qIndex > 0 ? (
              <button onClick={() => setQIndex(qIndex - 1)} className="text-xs text-stone-400 hover:text-stone-600">← 上一題</button>
            ) : (
              <button onClick={() => { setStep('chief'); setQIndex(0) }} className="text-xs text-stone-400 hover:text-stone-600">← 重選主訴</button>
            )}
            {isLastQ && (
              <button onClick={() => setStep('tongue')} className="text-xs text-emerald-600 hover:text-emerald-700">跳到舌苔 →</button>
            )}
          </div>
        </main>
      )}

      {/* ── 舌苔拍攝 ── */}
      {step === 'tongue' && (
        <main className="max-w-lg mx-auto px-4 py-8 min-h-[70vh] flex flex-col justify-center">
          <div className="text-center mb-5">
            <p className="text-xs text-emerald-600 tracking-widest mb-1 font-medium">最後一步</p>
            <h2 className="text-xl font-light text-stone-700">拍攝舌苔</h2>
            <p className="text-xs text-stone-500 mt-1">舌苔能反映體內寒熱濕燥，協助AI更精準判斷</p>
          </div>
          <div className="relative bg-white rounded-2xl border-2 border-dashed border-stone-300 overflow-hidden mb-4">
            {tonguePreview ? (
              <>
                <img src={tonguePreview} alt="舌苔預覽" className="w-full object-cover aspect-[4/3]" onLoad={() => setImageLoaded(true)} />
                <button onClick={() => { setTonguePreview(null); setTongueFile(null); setImageLoaded(false) }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full text-white text-xs flex items-center justify-center">✕</button>
              </>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                className="aspect-[4/3] flex flex-col items-center justify-center text-stone-400 cursor-pointer hover:bg-stone-50 transition">
                <div className="text-5xl mb-3">👅</div>
                <p className="text-sm font-medium">點擊拍攝舌苔</p>
                <p className="text-xs mt-1 text-stone-400">或從相簿選擇</p>
                <p className="text-xs mt-3 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                  💡 自然光、張嘴伸舌、舌頭放鬆
                </p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleTongueUpload} />
          </div>
          <div className="bg-stone-100 rounded-xl p-4 mb-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              <span className="font-medium text-stone-700">拍攝技巧：</span>自然光或室內光 · 張嘴伸舌自然下垂 · 舌頭佔據畫面主體
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
            <p className="text-xs text-amber-700 leading-relaxed">
              🔒 <span className="font-medium">隱私聲明：</span>您的舌苔照片僅用於本次AI分析，系統不會保存、分享或用於任何其他用途。
            </p>
          </div>

          {/* 面色拍攝（Beta，可跳過） */}
          {!showFaceCapture ? (
            <button onClick={() => setShowFaceCapture(true)}
              className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-sm text-stone-400 hover:border-amber-300 hover:text-amber-600 transition mb-3">
              🌡️ 拍攝面容（面色分析 Beta）— 選填
            </button>
          ) : (
            <div className="mb-3">
              <p className="text-xs text-amber-600 mb-2 font-medium">🌡️ 面色分析（Beta）</p>
              <div className="relative bg-white rounded-2xl border-2 border-dashed border-amber-200 overflow-hidden">
                {facePreview ? (
                  <>
                    <img src={facePreview} alt="面容預覽" className="w-full object-cover aspect-[4/3]" />
                    <button onClick={() => { setFacePreview(null); setFaceFile(null) }}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full text-white text-xs flex items-center justify-center">✕</button>
                  </>
                ) : (
                  <div onClick={() => faceFileRef.current?.click()}
                    className="aspect-[4/3] flex flex-col items-center justify-center text-stone-400 cursor-pointer hover:bg-stone-50 transition">
                    <div className="text-4xl mb-2">😊</div>
                    <p className="text-sm font-medium">點擊拍攝面容</p>
                    <p className="text-xs mt-1 text-stone-400">請保持正面、自然光</p>
                  </div>
                )}
                <input ref={faceFileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFaceUpload} />
              </div>
              <div className="bg-amber-50 rounded-xl p-3 mt-2">
                <p className="text-xs text-amber-700 leading-relaxed">
                  🔒 隱私：面容照片僅用於本次分析，不會保存或分享
                </p>
              </div>
              <button onClick={() => { setShowFaceCapture(false); setFacePreview(null); setFaceFile(null) }}
                className="w-full py-2 text-xs text-stone-400 hover:text-stone-600 mt-1">
                取消面容分析
              </button>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || (!!tongueFile && !imageLoaded)}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-medium shadow-lg shadow-emerald-200 disabled:opacity-60 transition">
            {loading ? '分析中...' : tongueFile ? '✨ 分析舌苔 + 送出' : '✨ 略過舌苔，直接分析'}
          </button>
          {!tongueFile && (
            <button onClick={() => {
              setResult({ constitution: analyzeCondition(answers), questionnaire_answers: answers })
              setStep('result')
            }} className="w-full py-3 text-sm text-stone-400 hover:text-stone-600 transition mt-2">
              跳過舌苔分析
            </button>
          )}
        </main>
      )}

      {/* ── 結果 ── */}
      {step === 'result' && result && (
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-xs text-emerald-600 tracking-widest">{t('result.title')}</p>
            <h2 className="text-2xl font-light text-stone-700 mt-1">{result.constitution.type}</h2>
            <p className="text-sm text-emerald-600">{result.constitution.sub}</p>
            <span className="inline-block mt-2 text-xs bg-stone-100 text-stone-500 px-3 py-1 rounded-full">
              {t('result.pattern')}：{result.constitution.pattern}
            </span>
          </div>

          {/* ── 能量分析儀表板 ── */}
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-5 border border-stone-200 mb-5">
            <h3 className="text-sm font-semibold text-stone-600 mb-4 flex items-center gap-2">
              <span>📊</span> 能量分析
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* 能量儀表 */}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-stone-400 mb-1">身體能量</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    result.constitution.energy >= 60 ? 'text-emerald-500' :
                    result.constitution.energy >= 45 ? 'text-amber-500' : 'text-red-500'
                  }`}>{result.constitution.energy}%</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                      style={{ width: `${result.constitution.energy}%` }} />
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {result.constitution.energy >= 60 ? '最佳' : result.constitution.energy >= 45 ? '正常' : '偏低'}
                </p>
              </div>
              {/* 壓力儀表 */}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-stone-400 mb-1">身心壓力</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    result.constitution.stress <= 3 ? 'text-emerald-500' :
                    result.constitution.stress <= 4 ? 'text-amber-500' : 'text-red-500'
                  }`}>{result.constitution.stress}</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      result.constitution.stress <= 3 ? 'bg-emerald-400' :
                      result.constitution.stress <= 4 ? 'bg-amber-400' : 'bg-red-400'
                    }`} style={{ width: `${result.constitution.stress * 10}%` }} />
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {result.constitution.stress <= 3 ? '正常' : result.constitution.stress <= 4 ? '略高' : '過高'}
                </p>
              </div>
              {/* 彈力 */}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-stone-400 mb-1">恢復彈力</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    result.constitution.resilience >= 50 ? 'text-emerald-500' : 'text-amber-500'
                  }`}>{result.constitution.resilience}%</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                      style={{ width: `${result.constitution.resilience}%` }} />
                  </div>
                </div>
              </div>
              {/* 內在能量 */}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs text-stone-400 mb-1">內在能量儲備</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    result.constitution.innerEnergy >= 60 ? 'text-emerald-500' : 'text-amber-500'
                  }`}>{result.constitution.innerEnergy}%</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                      style={{ width: `${result.constitution.innerEnergy}%` }} />
                  </div>
                </div>
              </div>
            </div>
            {/* 神經平衡 */}
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-stone-400 mb-2">交感/副交感神經平衡</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 bg-stone-100 rounded-full relative">
                    <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-stone-300 -translate-x-1/2" />
                    <div className={`absolute top-0 h-2 w-3 rounded-full -translate-x-1/2 ${
                      result.constitution.meridianBalance.left < 1.5 ? 'bg-emerald-400' :
                      result.constitution.meridianBalance.left < 2.0 ? 'bg-amber-400' : 'bg-red-400'
                    }`} style={{ left: `${Math.min(result.constitution.meridianBalance.left / 3 * 100, 90)}%` }} />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">左 {result.constitution.meridianBalance.left}</p>
                </div>
                <span className="text-xs text-stone-400">vs</span>
                <div className="flex-1">
                  <div className="h-2 bg-stone-100 rounded-full relative">
                    <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-stone-300 -translate-x-1/2" />
                    <div className={`absolute top-0 h-2 w-3 rounded-full -translate-x-1/2 ${
                      result.constitution.meridianBalance.right < 1.5 ? 'bg-emerald-400' :
                      result.constitution.meridianBalance.right < 2.0 ? 'bg-amber-400' : 'bg-red-400'
                    }`} style={{ left: `${Math.min(result.constitution.meridianBalance.right / 3 * 100, 90)}%` }} />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">右 {result.constitution.meridianBalance.right}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 生活方式雷達圖（用長條圖替代） ── */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 mb-5">
            <h3 className="text-sm font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <span>🌿</span> 生活方式評分
            </h3>
            <div className="space-y-3">
              {[
                { key: 'exercise', label: '運動', icon: '🏃', value: result.constitution.lifestyle.exercise },
                { key: 'nutrition', label: '營養', icon: '🥗', value: result.constitution.lifestyle.nutrition },
                { key: 'environment', label: '環境', icon: '🌤', value: result.constitution.lifestyle.environment },
                { key: 'psychology', label: '心理', icon: '🧘', value: result.constitution.lifestyle.psychology },
                { key: 'sleep', label: '睡眠', icon: '😴', value: result.constitution.lifestyle.sleep },
                { key: 'hormonal', label: '荷爾蒙', icon: '⚖️', value: result.constitution.lifestyle.hormonal },
              ].map(item => {
                const color = item.value >= 75 ? 'bg-emerald-400' : item.value >= 60 ? 'bg-amber-400' : 'bg-red-400'
                const status = item.value >= 75 ? '理想' : item.value >= 60 ? '正常' : '偏低'
                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs text-stone-600 w-12">{item.label}</span>
                    <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-xs font-medium text-stone-600 w-8">{item.value}%</span>
                    <span className="text-xs text-stone-400 w-8">{status}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-stone-400 mt-4 text-center">依據您的調理進度，各項指標建議逐步提升至綠色區間</p>
          </div>

          {/* 辯證要點 */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 mb-4">
            <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <span>🔑</span> 辯證要點
            </h3>
            <p className="text-xs text-stone-500 mb-3">判定為 {result.constitution.type} 體質的核心指標：</p>
            <div className="space-y-2">
              {getPatternKeys(result.constitution.type).map((key, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs flex-shrink-0 font-medium">{i + 1}</span>
                  {key}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
            <p className="text-sm text-stone-700 leading-relaxed">{result.constitution.description}</p>
          </div>

          {result.tongue && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span>👅</span> {t('tongue.title') || '舌苔特徵'}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: t('tongue.color') || '舌色', value: (result.tongue.tongue_color as string) || '—' },
                  { label: t('tongue.coating') || '苔色', value: (result.tongue.coating_color as string) || '—' },
                  { label: t('tongue.teeth') || '齒痕', value: ['無', '輕微', '明顯'][(result.tongue.teeth_mark as number) || 0] },
                  { label: t('tongue.cracks') || '裂紋', value: ['無', '輕微', '明顯'][(result.tongue.cracks as number) || 0] },
                ].map(item => (
                  <div key={item.label} className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-400 mb-1">{item.label}</p>
                    <p className="text-stone-700 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.face && (result.face as any).face_detected && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-4">
              <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <span>😊</span> 面色分析（Beta）
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">面色</p>
                  <p className="text-stone-700 font-medium">{(result.face as any).complexion || '—'}</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">臉型</p>
                  <p className="text-stone-700 font-medium">{(result.face as any).face_shape || '—'}</p>
                </div>
              </div>
              <p className="text-sm text-stone-700 mb-3">{(result.face as any).description}</p>
              {((result.face as any).suggestions as string[])?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-amber-600 font-medium">面色調理建議：</p>
                  {((result.face as any).suggestions as string[]).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                      {s}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-amber-500 mt-3">Beta 功能僅供參考，精確分析請諮詢中醫師</p>
            </div>
          )}

          {result.constitution.suggestions.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span>✅</span> {t('result.suggestions')}
              </h3>
              <div className="space-y-2">
                {result.constitution.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.constitution.herbs.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-4">
              <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <span>💊</span> {t('result.herbs')}
              </h3>
              <div className="space-y-2">
                {result.constitution.herbs.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="text-amber-400 flex-shrink-0">◆</span>
                    {h}
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-500 mt-3 leading-relaxed">
                ⚠️ {t('result.herbsNote')}
              </p>
            </div>
          )}

          {/* 中成藥用藥禁忌 */}
          {result.constitution.herbs.length > 0 && getHerbCautions(result.constitution.herbs).length > 0 && (
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4">
              <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <span>⚠️</span> 服用禁忌（重要）
              </h3>
              <div className="space-y-2">
                {getHerbCautions(result.constitution.herbs).map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.constitution.diet.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span>🍲</span> {t('result.diet')}
              </h3>
              <div className="space-y-3">
                {result.constitution.diet.map((d, i) => (
                  <div key={i} className="border-l-2 border-emerald-300 pl-3">
                    <p className="text-sm text-stone-700 leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.constitution.acupoints.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <span>🦶</span> {t('result.acupoints')}
              </h3>
              <div className="space-y-2">
                {result.constitution.acupoints.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="text-stone-400 flex-shrink-0">{i + 1}.</span>
                    {a}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-2">每天每穴按摩 2-3 分鐘，以酸脹為度</p>
            </div>
          )}

          {result.constitution.avoid.length > 0 && (
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4">
              <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <span>⚠️</span> {t('result.avoid')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.constitution.avoid.map((a, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-full">✕ {a}</span>
                ))}
              </div>
            </div>
          )}

          <div className="text-center py-4">
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('disclaimer.line1')}<br />
              {t('disclaimer.line2')}<br />
              {t('disclaimer.line3')}
            </p>
          </div>

          <button onClick={reset}
            className="w-full py-3 border-2 border-stone-200 rounded-xl text-sm text-stone-500 hover:border-emerald-400 hover:text-emerald-600 transition">
            {t('result.retake')}
          </button>
          {/* 分享按鈕 */}
          <button onClick={() => {
            if (navigator.share) {
              navigator.share({ title: '中醫體質分析', text: `我是「${result.constitution.type}」體質，調理建議：${result.constitution.suggestions.slice(0,2).join('、')}` })
            } else {
              navigator.clipboard.writeText(`我是「${result.constitution.type}」體質，調理建議：${result.constitution.suggestions.join('、')}`)
              alert('已複製到剪貼簿！')
            }
          }} className="w-full py-3 text-sm text-emerald-600 hover:text-emerald-700 mt-2">
            📤 分享給家人朋友
          </button>
          {/* 7天後回來對比提示 */}
          <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm font-medium text-emerald-700 mb-1">7天後回來對比</p>
            <p className="text-xs text-emerald-600 leading-relaxed">
              中醫調理需要時間，建議你<br />
              <span className="font-semibold">7天後重新做一次問卷</span>，觀察體質變化
            </p>
            <p className="text-xs text-stone-400 mt-3">
              🔐 登入會員可一鍵記錄每次結果，輕鬆追蹤健康變化
            </p>
          </div>
        </main>
      )}

      <footer className="text-center py-6 text-xs text-stone-400 border-t border-stone-200 mt-4">
        <p>{t('disclaimer.line2')}</p>
        <p className="mt-1">{t('footer.copyright')}</p>
      </footer>
    </div>
  )
}

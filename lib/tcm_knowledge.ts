// ============================================
// 中醫診斷知識庫（Herb + Timing + Syndrome）
// ============================================

export interface HerbRecommendation {
  name: string
  timing: string
  meridianNote: string
  beforeOrAfterMeal: '飯前30分' | '飯後30分' | '空腹' | '睡前30分' | '隨餐'
  dosage?: string
  note: string
}

export interface SyndromeType {
  id: string
  type: string        // 體質分類
  subType: string      // 證型
  category: '內科' | '外科' | '婦科' | '兒科' | '五官科'
  bodySystem: string
  pattern: string     // 虛/實/虛實夾雜
  symptoms: string[]  // 主要症狀關鍵字
  tongueSign: string  // 典型舌象
  pulseSign: string   // 典型脈象
  herbs: HerbRecommendation[]
  acupoints: string[]
  diet: string[]
  avoid: string[]
  cautions: string[]
  lifestyle: string[]
}

// ============================================
// 經脈運行時間表（子丑寅卯辰巳午未申酉戌亥）
// ============================================
export const MERIDIAN_CLOCK: Record<string, { time: string; name: string; element: string }> = {
  '03-05': { time: '03:00-05:00', name: '肺經', element: '金' },
  '05-07': { time: '05:00-07:00', name: '大腸經', element: '金' },
  '07-09': { time: '07:00-09:00', name: '胃經', element: '土' },
  '09-11': { time: '09:00-11:00', name: '脾經', element: '土' },
  '11-13': { time: '11:00-13:00', name: '心經', element: '火' },
  '13-15': { time: '13:00-15:00', name: '小腸經', element: '火' },
  '15-17': { time: '15:00-17:00', name: '膀胱經', element: '水' },
  '17-19': { time: '17:00-19:00', name: '腎經', element: '水' },
  '19-21': { time: '19:00-21:00', name: '心包經', element: '火' },
  '21-23': { time: '21:00-23:00', name: '三焦經', element: '火' },
  '23-01': { time: '23:00-01:00', name: '膽經', element: '木' },
  '01-03': { time: '01:00-03:00', name: '肝經', element: '木' },
}

// ============================================
// 服用時間對應原則
// ============================================
// 補氣/健脾 → 早晨（胃經7-9、脾經9-11點）飯前
// 滋陰/清熱 → 下午（膀胱經15-17、腎經17-19點）飯後
// 安神/助眠 → 睡前（心包經19-21、三焦經21-23點）
// 疏肝/理氣 → 白天任何時間，避免睡前
// 溫陽/驅寒 → 早晨（膽經23-01、肝經01-03）飯後
// 活血/化瘀 → 早晨或午後，飯後

// ============================================
// 完整證型知識庫
// ============================================
export const SYNDROME_DATABASE: SyndromeType[] = [
  // ─── 陰虛體質 ───
  {
    id: 'yin_xu_xin_shen',
    type: '陰虛',
    subType: '心腎陰虛',
    category: '內科',
    bodySystem: '心腎',
    pattern: '虛熱',
    symptoms: ['怕熱', '盜汗', '自汗', '難入睡', '多夢', '易醒', '口乾', '手腳心熱'],
    tongueSign: '舌紅少苔，舌裂',
    pulseSign: '細數脈',
    herbs: [
      {
        name: '六味地黃丸',
        timing: '下午 3-5 點（膀胱經運行時）',
        meridianNote: '滋補腎陰，膀胱經為太陽經，主一身之表',
        beforeOrAfterMeal: '飯後30分',
        note: '虛火明顯（口瘡、失眠）時改為睡前服用'
      },
      {
        name: '天王補心丹',
        timing: '睡前 30 分鐘（心包經/三焦經運行時）',
        meridianNote: '心包經走胸部，安神定志；三焦經調整全身氣機',
        beforeOrAfterMeal: '睡前30分',
        note: '最適合心腎不交型失眠'
      },
      {
        name: '生脈飲',
        timing: '上午 9-11 點（脾經運行時）',
        meridianNote: '氣陰雙補，午前服用順應脾氣升清',
        beforeOrAfterMeal: '飯前30分',
        note: '夏季出汗過多適宜'
      },
    ],
    acupoints: ['太溪穴（足內側）', '湧泉穴（足底）', '內關穴（手腕）', '神門穴（手腕）'],
    diet: ['百合銀耳羹：百合30g + 銀耳20g', '麥冬玉竹茶：麥冬10g + 玉竹10g', '桑椹枸杞茶：桑椹15g + 枸杞10g'],
    avoid: ['燒烤', '炸物', '辛辣', '咖啡', '酒精'],
    cautions: ['感冒發燒時停用', '孕婦慎用'],
    lifestyle: ['23點前入睡', '太極/冥想每日30分鐘', '避免高溫環境'],
  },
  {
    id: 'yin_xu_fei_sheng',
    type: '陰虛',
    subType: '肺陰虛',
    category: '內科',
    bodySystem: '呼吸',
    pattern: '虛熱',
    symptoms: ['乾咳', '無痰', '咽癢', '口乾', '午後發熱', '盜汗', '聲音沙啞'],
    tongueSign: '舌紅少苔，乾裂',
    pulseSign: '細數脈',
    herbs: [
      {
        name: '養陰清肺丸',
        timing: '下午 3-5 點（膀胱經運行時）',
        meridianNote: '膀胱經主一身之表，肺與大腸相表裏',
        beforeOrAfterMeal: '飯後30分',
        note: '秋冬季乾燥咳嗽適用'
      },
      {
        name: '百合固金湯（中藥飲片）',
        timing: '上午 11 點-下午 1 點（心經運行時）',
        meridianNote: '心肺同居上焦，午前養心陰，午後清肺熱',
        beforeOrAfterMeal: '飯後30分',
        note: '配合川貝母粉效果更佳'
      },
    ],
    acupoints: ['太溪穴', '照海穴', '肺俞穴', '合谷穴'],
    diet: ['百合粥：百合30g + 粳米100g', '雪梨銀耳羹', '蜂蜜檸檬水（不加冰）'],
    avoid: ['冰冷', '辛辣', '油炸', '抽菸'],
    cautions: ['糖尿病患者蜂蜜減量', '感冒咳嗽初期不適用'],
    lifestyle: ['保持室內濕度50-60%', '避免長時間在冷氣房', '深呼吸練習'],
  },

  // ─── 陽虛體質 ───
  {
    id: 'yang_xu_pi_shen',
    type: '陽虛',
    subType: '脾腎陽虛',
    category: '內科',
    bodySystem: '脾腎',
    pattern: '虛寒',
    symptoms: ['怕冷', '腰膝酸冷', '夜尿多', '尿清長', '腹瀉', '水腫', '精神倦怠'],
    tongueSign: '舌淡胖有齒痕，苔白滑',
    pulseSign: '遲緩脈或沉細脈',
    herbs: [
      {
        name: '金匱腎氣丸',
        timing: '早上 7-9 點（胃經運行時）飯後馬上服用',
        meridianNote: '胃經為多氣多血之經，飯後馬上服借助胃氣推動藥力直達腎陽',
        beforeOrAfterMeal: '飯後30分',
        note: '忌空腹，傷胃氣'
      },
      {
        name: '理中丸',
        timing: '早上 9-11 點（脾經運行時）',
        meridianNote: '脾經運行時溫補脾陽效果最佳',
        beforeOrAfterMeal: '飯前30分',
        note: '飯前服可使藥力直達中焦'
      },
      {
        name: '四神湯',
        timing: '早上 9-11 點（脾經運行時）空腹',
        meridianNote: '四神湯健脾利濕，空腹服用吸收最好',
        beforeOrAfterMeal: '空腹',
        note: '溫熱服用，勿放涼'
      },
    ],
    acupoints: ['關元穴（臍下3寸）', '命門穴（後腰）', '足三里', '湧泉穴'],
    diet: ['羊肉當歸生薑湯：羊肉250g + 當歸10g + 薑3片', '桂圓紅棗茶：桂圓10顆 + 紅棗5顆', '生薑紅糖水'],
    avoid: ['冰品', '生菜', '水果', '冷飲', '西瓜', '綠豆'],
    cautions: ['孕婦禁用金匱腎氣丸', '有實熱證（口瘡、便秘）者慎用', '血壓高者慎用附子'],
    lifestyle: ['每天熱水泡腳（加生薑或艾葉）', '早上曬背15分鐘', '避免晚上運動'],
  },

  // ─── 氣虛體質 ───
  {
    id: 'qi_xu_pi_fei',
    type: '氣虛',
    subType: '脾肺氣虛',
    category: '內科',
    bodySystem: '呼吸消化',
    pattern: '虛',
    symptoms: ['疲倦', '說話無力', '稍動即喘', '食慾不振', '大便稀軟', '容易感冒', '自汗'],
    tongueSign: '舌淡苔白，齒痕明顯',
    pulseSign: '虛弱脈',
    herbs: [
      {
        name: '補中益氣丸',
        timing: '早上 7-9 點（胃經運行時）飯前',
        meridianNote: '胃經多氣多血，飯前服用可使藥力隨胃氣上升補益脾肺之氣',
        beforeOrAfterMeal: '飯前30分',
        note: '感冒發燒時停用，忌與白蘿蔔同服'
      },
      {
        name: '四君子湯（中藥飲片）',
        timing: '早上 9-11 點（脾經運行時）',
        meridianNote: '脾經當令，健脾益氣效果最佳',
        beforeOrAfterMeal: '飯前30分',
        note: '可加入生薑3片和大棗5枚煎服'
      },
      {
        name: '生脈飲',
        timing: '上午 11 點-下午 1 點（心經運行時）',
        meridianNote: '心肺同居上焦，益氣養陰，午前服用振奮心氣',
        beforeOrAfterMeal: '飯後30分',
        note: '夏季汗多適宜'
      },
    ],
    acupoints: ['氣海穴（臍下1.5寸）', '肺俞穴', '足三里', '關元穴'],
    diet: ['山藥粥：山藥200g + 粳米100g', '黨參黃耆紅棗茶：黨參10g + 黃耆10g + 紅棗5顆', '人參燉雞（陽虛明顯時）'],
    avoid: ['白蘿蔔', '茶葉', '過度勞累', '熬夜', '減肥節食'],
    cautions: ['感冒發燒時停用', '血壓高者慎用黃耆', '失眠者避免午後服用'],
    lifestyle: ['晚上11點前就寢', '太極/八段錦每日30分鐘', '避免過度出汗運動'],
  },

  // ─── 痰濕體質 ───
  {
    id: 'tan_shi_pi_shi',
    type: '痰濕',
    subType: '痰濕困脾',
    category: '內科',
    bodySystem: '消化代謝',
    pattern: '實',
    symptoms: ['身體沉重', '大便黏膩', '痰多', '胸悶', '胃脹', '口中黏膩', '舌苔厚膩', '易長痘'],
    tongueSign: '舌苔白厚膩或黃厚膩',
    pulseSign: '滑脈',
    herbs: [
      {
        name: '平胃散',
        timing: '早上 9-11 點（脾經運行時）飯前',
        meridianNote: '燥濕健脾，脾經當令時服用最能發揮祛濕化痰之效',
        beforeOrAfterMeal: '飯前30分',
        note: '胃潰疡、胃酸過多者慎用'
      },
      {
        name: '二陳湯（中藥飲片）',
        timing: '上午 9-11 點（脾經運行時）',
        meridianNote: '理氣化痰，配合脾經健運水濕',
        beforeOrAfterMeal: '飯後30分',
        note: '孕婦慎用'
      },
      {
        name: '溫膽湯',
        timing: '下午 3-5 點（膀胱經運行時）',
        meridianNote: '膽為少陽，協助祛痰化濕，午後服用順應氣機',
        beforeOrAfterMeal: '飯後30分',
        note: '對痰熱擾心失眠效果好'
      },
    ],
    acupoints: ['陰陵泉（小腿內側）', '豐隆穴（小腿外側）', '中脘穴（臍上4寸）', '足三里'],
    diet: ['薏仁赤小豆粥：薏仁30g + 赤小豆30g', '冬瓜排骨湯（去油）', '陳皮普洱茶（飯後）', '荷葉山楂茶'],
    avoid: ['甜食', '油炸', '糯米', '奶製品', '酒', '肥甘厚味', '水果'],
    cautions: ['孕婦慎用', '陰虛火旺者（口瘡、失眠）不宜', '胃潰疡者飯後服用'],
    lifestyle: ['保持環境乾燥', '規律運動（微微出汗為度）', '晚餐在7點前吃完'],
  },

  // ─── 氣鬱體質 ───
  {
    id: 'qi_yu_gan_qi',
    type: '氣鬱',
    subType: '肝氣鬱結',
    category: '內科',
    bodySystem: '情志肝膽',
    pattern: '實',
    symptoms: ['易怒', '焦慮', '壓力大', '胸悶', '脅痛', '腹脹', '胃痛', '情緒波動', '嘆氣多', '月經前乳房脹痛'],
    tongueSign: '舌邊紅，苔薄白',
    pulseSign: '弦脈',
    herbs: [
      {
        name: '逍遙丸',
        timing: '早上 9-11 點（脾經運行時）',
        meridianNote: '脾為氣血生化之源，健脾可助疏肝，午前服用振奮肝氣',
        beforeOrAfterMeal: '飯後30分',
        note: '月經前乳房脹痛明顯者在月經前7天開始服用'
      },
      {
        name: '柴胡疏肝散',
        timing: '下午 3-5 點（膀胱經運行時）',
        meridianNote: '疏肝理氣，午後服用順應肝木調達之性',
        beforeOrAfterMeal: '飯後30分',
        note: '孕婦禁用；肝陰不足（眩暈、口乾）者慎用'
      },
      {
        name: '甘麥大棗湯',
        timing: '睡前 30 分鐘（三焦經運行時）',
        meridianNote: '養心安神，三焦經調整全身氣機，睡前服用安定心神',
        beforeOrAfterMeal: '睡前30分',
        note: '對情緒性失眠（悲傷欲哭）效果最佳'
      },
    ],
    acupoints: ['太衝穴（足大趾旁）', '合谷穴（手虎口）', '膻中穴（胸口）', '肝俞穴'],
    diet: ['玫瑰花茶：玫瑰花5g 熱水泡', '茉莉花茶：茉莉花5g + 綠茶', '菊花枸杞茶：菊花5g + 枸杞10g', '柑橘類水果（疏肝理氣）'],
    avoid: ['酒精', '咖啡', '熬夜', '過度壓抑情緒', '油炸', '辛辣'],
    cautions: ['對小麥過敏者禁用甘麥大棗湯', '血糖高者注意甘草劑量', '孕婦慎用柴胡'],
    lifestyle: ['每天走路6000步以上', '找信任的人傾訴', '按摩太衝穴（每側3分鐘）', '太極/八段錦'],
  },

  // ─── 脾虛體質 ───
  {
    id: 'pi_xu',
    type: '脾虛',
    subType: '脾胃虛弱',
    category: '內科',
    bodySystem: '消化',
    pattern: '虛',
    symptoms: ['食欲不振', '飯後腹脹', '大便稀軟', '吃很少就飽', '疲倦', '舌邊有齒痕'],
    tongueSign: '舌淡胖有齒痕，苔白',
    pulseSign: '緩脈或虛弱脈',
    herbs: [
      {
        name: '參苓白朮散',
        timing: '早上 9-11 點（脾經運行時）飯前',
        meridianNote: '健脾滲濕，脾經當令時效果最佳',
        beforeOrAfterMeal: '飯前30分',
        note: '感冒發燒時停用'
      },
      {
        name: '四君子湯（中藥飲片）',
        timing: '早上 7-9 點（胃經運行時）',
        meridianNote: '益氣健脾，胃經多氣血助藥力吸收',
        beforeOrAfterMeal: '飯前30分',
        note: '可加入生薑、大棗煎服'
      },
      {
        name: '附子理中丸',
        timing: '早上 7-9 點（胃經運行時）飯後',
        meridianNote: '溫陽健脾，飯後服用減少對胃的刺激',
        beforeOrAfterMeal: '飯後30分',
        note: '陽虛明顯（腹瀉水樣、手腳冰冷）時使用'
      },
    ],
    acupoints: ['足三里（膝蓋下3寸）', '中脘穴（臍上4寸）', '脾俞穴', '關元穴'],
    diet: ['山藥蓮子粥：山藥50g + 蓮子30g + 粳米100g', '茯苓餅：茯苓粉30g + 麵粉100g', '四神豬肚湯（山藥/茯苓/蓮子/芡實）'],
    avoid: ['冰品', '空腹吃水果', '暴飲暴食', '甜食', '油炸'],
    cautions: ['孕婦禁用附子理中丸', '有實熱證者（口瘡、便祕）不宜', '胃潰疡出血者禁用'],
    lifestyle: ['定時定量用餐（每餐7-8分飽）', '飯後散步30分鐘', '晚上7點後不吃東西'],
  },

  // ─── 濕熱體質 ───
  {
    id: 'shi_re',
    type: '濕熱',
    subType: '肝膽濕熱',
    category: '內科',
    bodySystem: '肝膽',
    pattern: '實熱',
    symptoms: ['口苦', '脇痛', '陰囊潮濕', '白帶多（女）', '小便黃', '脾氣暴躁', '眩暈', '舌黃苔厚'],
    tongueSign: '舌紅苔黃厚膩',
    pulseSign: '弦數脈或滑數脈',
    herbs: [
      {
        name: '龍膽瀉肝湯（中藥飲片）',
        timing: '下午 3-5 點（膀胱經運行時）',
        meridianNote: '清肝膽濕熱，膀胱經主一身之表，午後服用助邪外出',
        beforeOrAfterMeal: '飯後30分',
        note: '不可長期服用（中病即止），孕婦禁用'
      },
      {
        name: '茵陳蒿湯（中藥飲片）',
        timing: '早上 9-11 點（脾經運行時）',
        meridianNote: '清熱利濕退黃，脾經健運水濕',
        beforeOrAfterMeal: '飯後30分',
        note: '對肝膽濕熱型痘痘/皮膚問題有效'
      },
    ],
    acupoints: ['太衝穴', '肝俞穴', '膽俞穴', '陰陵泉'],
    diet: ['玉米鬚茶：玉米鬚30g 煮水', '冬瓜湯（不去皮）', '綠豆薏仁湯（溫熱喝）', '芹菜/苦瓜'],
    avoid: ['酒精', '辛辣', '燒烤', '油炸', '熱性食物（榴槤、荔枝、龍眼）'],
    cautions: ['孕婦禁用', '脾胃虛寒者（腹瀉、手腳冷）不宜', '不可與溫補藥同服'],
    lifestyle: ['保持大便通暢', '充足睡眠（23點前）', '避免高溫環境', '戒菸酒'],
  },

  // ─── 血瘀體質 ───
  {
    id: 'xue_yu',
    type: '血瘀',
    subType: '氣滯血瘀',
    category: '內科',
    bodySystem: '血液循環',
    pattern: '實',
    symptoms: ['疼痛固定', '刺痛', '經痛', '經血有血塊', '靜脈曲張', '面色晦暗', '舌下靜脈曲張', '黑眼圈'],
    tongueSign: '舌紫暗或有瘀點瘀斑，舌下靜脈曲張',
    pulseSign: '澀脈',
    herbs: [
      {
        name: '血府逐瘀湯（中藥飲片）',
        timing: '早上 9-11 點（脾經運行時）飯後',
        meridianNote: '活血化瘀，飯後服用減少對胃的刺激，脾統血助化瘀',
        beforeOrAfterMeal: '飯後30分',
        note: '孕婦禁用；月經期停服（經血過多）'
      },
      {
        name: '桂枝茯苓丸',
        timing: '下午 3-5 點（膀胱經運行時）',
        meridianNote: '活血化瘀，調整全身氣血運行',
        beforeOrAfterMeal: '飯後30分',
        note: '對子宫肌瘤、卵巢囊腫有一定輔助'
      },
    ],
    acupoints: ['血海穴', '三陰交', '太衝穴', '足三里'],
    diet: ['黑木耳（活血）', '山楂茶（消積活血）', '洋蔥', '紫菜', '玫瑰花茶'],
    avoid: ['生冷', '寒性食物', '過度勞累', '外傷部位按摩'],
    cautions: ['孕婦禁用', '月經期停服', '有出血傾向者（牙齦出血、鼻血）慎用'],
    lifestyle: ['每天走路30分鐘', '避免久坐（每小時站起來活動）', '保持溫暖'],
  },

  // ─── 胃熱/火氣大 ───
  {
    id: 'wei_re',
    type: '胃熱',
    subType: '胃火熾盛',
    category: '內科',
    bodySystem: '消化',
    pattern: '實熱',
    symptoms: ['胃痛', '燒心', '反酸', '口臭', '牙齦腫痛', '便祕', '食慾亢進', '舌紅苔黃'],
    tongueSign: '舌紅苔黃乾',
    pulseSign: '滑數脈',
    herbs: [
      {
        name: '清胃散（中藥飲片）',
        timing: '下午 3-5 點（膀胱經運行時）',
        meridianNote: '清胃涼血，午後服用順應陽明經氣機',
        beforeOrAfterMeal: '飯後30分',
        note: '胃陰不足（飢餓感強、口乾）者改用玉女煎'
      },
      {
        name: '牛黃清胃丸',
        timing: '下午 3-5 點（膀胱經運行時）',
        meridianNote: '清胃火，膀胱經主水，助瀉火',
        beforeOrAfterMeal: '飯後30分',
        note: '孕婦慎用；腹瀉者停用'
      },
    ],
    acupoints: ['內庭穴（足背）', '合谷穴', '足三里', '中脘穴'],
    diet: ['西瓜（適量）', '苦瓜湯', '綠豆湯（溫熱喝）', '冬瓜', '蓮藕汁'],
    avoid: ['辛辣', '燒烤', '油炸', '咖啡', '酒精', '冰冷', '糯米'],
    cautions: ['孕婦慎用', '脾胃虛寒者（腹瀉）不宜', '不可與補益藥同服'],
    lifestyle: ['保持情緒穩定（肝火犯胃）', '定時定量', '避免晚餐過晚過飽'],
  },

  // ─── 痛經（婦科） ───
  {
    id: 'dysmenorrhea',
    type: '痛經',
    subType: '氣滯血瘀 / 寒凝胞宮',
    category: '婦科',
    bodySystem: '月經',
    pattern: '實',
    symptoms: ['經期腹痛', '血塊', '經血色暗', '經前乳房脹痛', '怕冷', '腰酸'],
    tongueSign: '舌暗或有瘀點，苔白',
    pulseSign: '弦脈或澀脈',
    herbs: [
      {
        name: '血府逐瘀膠囊',
        timing: '經期前5天開始服用，每日2次',
        meridianNote: '經前活血化瘀，緩解經期疼痛',
        beforeOrAfterMeal: '飯後30分',
        note: '月經量多者經期停服'
      },
      {
        name: '艾附暖宮丸',
        timing: '經期前7天開始，早晚各一次',
        meridianNote: '溫經散寒，暖宮調經',
        beforeOrAfterMeal: '飯後30分',
        note: '怕冷明顯、子宮虛寒者適用'
      },
    ],
    acupoints: ['三陰交', '關元穴', '氣海穴', '血海穴'],
    diet: ['生薑紅糖水（經期）', '桂圓紅棗茶', '黑巧克力（適量）'],
    avoid: ['冰品', '生冷', '辛辣', '咖啡', '劇烈運動'],
    cautions: ['經血量多者慎用活血藥', '備孕中需告知醫師'],
    lifestyle: ['經期前1周開始熱敷腹部', '經期避免受寒', '每週瑜伽/走路促進骨盆血液循環'],
  },

  // ─── 備孕調理（婦科） ───
  {
    id: 'fertility',
    type: '備孕',
    subType: '氣血兩虛 / 腎虛',
    category: '婦科',
    bodySystem: '生殖',
    pattern: '虛',
    symptoms: ['備孕一段時間未懷孕', '月經失調', '疲倦', '腰酸', '手足冷', '睡眠差'],
    tongueSign: '舌淡苔薄白',
    pulseSign: '細弱脈',
    herbs: [
      {
        name: '四物湯（中藥飲片）',
        timing: '月經乾淨後第2天開始，連服5天，早晚各一次',
        meridianNote: '養血調經，月經後服用順應血海空虛之時補益',
        beforeOrAfterMeal: '飯後30分',
        note: '排卵期（下次月經前14天左右）改為補腎'
      },
      {
        name: '左歸丸',
        timing: '排卵期後（下次月經前14-7天）睡前服用',
        meridianNote: '滋補腎陰，促進排卵後黃體形成',
        beforeOrAfterMeal: '睡前30分',
        note: '適合腎陰虛型（月經提前、量少、陰道乾澀）'
      },
      {
        name: '右歸丸',
        timing: '排卵期後，下肢溫暖時段服用',
        meridianNote: '溫補腎陽，適合腎陽虛型（怕冷、月經推遲、基础體溫低）',
        beforeOrAfterMeal: '飯後30分',
        note: '避免在下午3點後服用，以免影響睡眠'
      },
    ],
    acupoints: ['關元穴', '子宮穴', '三陰交', '湧泉穴', '足三里'],
    diet: ['烏雞湯：烏骨雞 + 當歸5g + 黃耆10g', '黑豆糯米粥', '核桃紅棗粥', '深海魚（Omega-3）'],
    avoid: ['酒精', '咖啡', '生冷', '辛辣', '減肥節食', '熬夜'],
    cautions: ['備孕3個月無果建議就醫檢查', '正在服用西藥者需諮詢中醫師', '甲狀腺問題者先控制甲狀腺功能'],
    lifestyle: ['每天走路30-60分鐘（不超過1小時）', '體重維持BMI 18.5-24', '晚上10:30前就寢', '避免高溫環境（溫泉、泡澡）'],
  },
]

// ============================================
// 服用時間推薦函數
// ============================================
export function getHerbTiming(herbName: string): HerbRecommendation | null {
  for (const syndrome of SYNDROME_DATABASE) {
    const found = syndrome.herbs.find(h => h.name === herbName)
    if (found) return found
  }
  return null
}

// ============================================
// 經脈時間 → 適合的體質/功效
// ============================================
export function getMeridianRecommendations(timeSlot: keyof typeof MERIDIAN_CLOCK): {
  bestFor: string[]
  avoid: string[]
} {
  const map: Record<string, { bestFor: string[]; avoid: string[] }> = {
    '03-05': { bestFor: ['肺虛', '氣虛', '過敏'], avoid: ['陰虛火旺'] },
    '05-07': { bestFor: ['大腸燥結', '便祕'], avoid: ['腹瀉'] },
    '07-09': { bestFor: ['脾胃虛弱', '陽虛', '氣虛', '痰濕'], avoid: ['胃熱', '陰虛火旺'] },
    '09-11': { bestFor: ['脾虛', '氣虛', '痰濕', '氣鬱（疏肝）'], avoid: ['胃熱'] },
    '11-13': { bestFor: ['心悸', '失眠', '心陰虛'], avoid: ['心火旺'] },
    '13-15': { bestFor: ['小腸熱', '便祕'], avoid: ['腹瀉'] },
    '15-17': { bestFor: ['陰虛火旺', '濕熱', '熱證'], avoid: ['陽虛', '寒證'] },
    '17-19': { bestFor: ['腎陰虛', '腎陽虛', '夜尿多'], avoid: ['實熱證'] },
    '19-21': { bestFor: ['失眠', '焦慮', '心悸'], avoid: ['陽亢'] },
    '21-23': { bestFor: ['失眠', '陰虛', '陰陽失調'], avoid: ['實證'] },
    '23-01': { bestFor: ['陽虛', '寒濕', '膽囊問題'], avoid: ['陰虛火旺', '肝陽上亢'] },
    '01-03': { bestFor: ['肝氣鬱結', '情緒問題', '月經失調'], avoid: ['陰虛火旺'] },
  }
  return map[timeSlot] || { bestFor: [], avoid: [] }
}

// ============================================
// 體質 → 主要證型 → 對應知識
// ============================================
export function getSyndromesByType(type: string): SyndromeType[] {
  return SYNDROME_DATABASE.filter(s => s.type === type)
}

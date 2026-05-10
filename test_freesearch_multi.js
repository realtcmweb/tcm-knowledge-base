/**
 * TCM FreeSearch Multi-Turn Test
 * Tests 13 symptoms × 3 rounds = 39 API calls
 * Verifies: symptom input → API response → page update → option click → next question
 */
const { chromium } = require('playwright')

const API_BASE = 'https://tcm-knowledge-base.vercel.app'
const SYMPTOMS = [
  '失眠', '胃痛', '頭痛', '月經失調', '皮膚過敏',
  '疲倦', '腰酸', '胸悶', '口苦', '大便不順',
  '尿頻', '備孕', '減肥'
]

async function testSymptom(browser, symptom) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const results = []

  for (let round = 1; round <= 3; round++) {
    try {
      console.log(`  [${symptom}] Round ${round}...`)
      await page.goto(`${API_BASE}/zh-TW`, { waitUntil: 'networkidle', timeout: 30000 })
      
      // Wait for page to fully load
      await page.waitForTimeout(2000)
      
      // Find the free search input
      const inputSelector = 'input[placeholder*="症"]'
      await page.waitForSelector(inputSelector, { timeout: 10000 })
      
      // Type symptom
      await page.fill(inputSelector, symptom)
      await page.waitForTimeout(500)
      
      // Click search button
      const searchBtn = page.locator('button', { hasText: '搜尋' }).first()
      await searchBtn.click()
      
      // Wait for response
      await page.waitForTimeout(4000)
      
      // Check if we have questions or result
      const bodyText = await page.textContent('body')
      const hasQuestion = bodyText.includes('大便形態') || bodyText.includes('睡眠情況') ||
                         bodyText.includes('怕冷') || bodyText.includes('出汗') ||
                         bodyText.includes('食欲') || bodyText.includes('口渴') ||
                         bodyText.includes('精力') || bodyText.includes('情緒') ||
                         bodyText.includes('小便') || bodyText.includes('酸痛') ||
                         bodyText.includes('胸悶') || bodyText.includes('口腔')
      
      const hasResult = bodyText.includes('已完成辨證') || bodyText.includes('結果') ||
                       bodyText.includes('建議') || bodyText.includes('證型')
      
      const loading = bodyText.includes('分析中') || bodyText.includes('搜尋中')
      
      // Get current URL/state
      const q1Text = await page.textContent('body').catch(() => '')
      
      console.log(`    → hasQuestion=${hasQuestion}, hasResult=${hasResult}, loading=${loading}`)
      
      results.push({
        symptom,
        round,
        hasQuestion,
        hasResult,
        loading,
        ok: hasQuestion || hasResult
      })
      
      // Click first available option if there are questions
      const optionBtn = page.locator('button').filter({ hasText: /正常|失眠|硬|軟|黏|怕冷|怕熱|不容易|自汗|盜汗|正常|不振|過旺|胃脹|不渴|冷飲|熱飲|不多|充足|容易累|下午|持續|穩定|焦慮|抑鬱|易怒/ }).first()
      if (await optionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await optionBtn.click()
        await page.waitForTimeout(4000)
        const afterClick = await page.textContent('body').catch(() => '')
        const progressed = afterClick !== q1Text
        console.log(`    → Option clicked, progressed=${progressed}`)
        results[results.length - 1].progressed = progressed
      }
      
    } catch (err) {
      console.log(`  [${symptom}] Round ${round} ERROR: ${err.message.slice(0, 100)}`)
      results.push({ symptom, round, error: err.message.slice(0, 100), ok: false })
    }
    
    await context.close().catch(() => {})
    await new Promise(r => setTimeout(r, 3000)) // Wait 3s between tests (CPU limit)
  }
  
  return results
}

async function main() {
  console.log('🚀 TCM FreeSearch Multi-Turn Test')
  console.log(`📱 Target: ${API_BASE}`)
  console.log(`📋 Symptoms: ${SYMPTOMS.join(', ')}\n`)
  
  const browser = await chromium.launch({ headless: true })
  const allResults = []
  
  for (const symptom of SYMPTOMS) {
    console.log(`\n🧪 Testing: ${symptom}`)
    const results = await testSymptom(browser, symptom)
    allResults.push(...results)
    
    // Save progress after each symptom
    const passCount = results.filter(r => r.ok).length
    console.log(`  ✅ Passed: ${passCount}/3`)
    
    await new Promise(r => setTimeout(r, 10000)) // Wait 10s between symptoms (5% CPU)
  }
  
  await browser.close()
  
  // Summary
  console.log('\n\n========== SUMMARY ==========')
  const passed = allResults.filter(r => r.ok).length
  const total = allResults.length
  console.log(`Passed: ${passed}/${total}`)
  
  const bySymptom = SYMPTOMS.map(s => {
    const rs = allResults.filter(r => r.symptom === s && r.ok)
    return `${s}: ${rs.length}/3`
  })
  console.log(bySymptom.join(', '))
  
  // Save results
  require('fs').writeFileSync('/tmp/tcm_freesearch_test_results.json', JSON.stringify(allResults, null, 2))
  console.log('\nResults saved to /tmp/tcm_freesearch_test_results.json')
}

main().catch(console.error)
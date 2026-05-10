/**
 * TCM FreeSearch Multi-Turn Test - Fixed Selectors
 * Tests 13 symptoms × 3 rounds
 */
const { chromium } = require('playwright')

const API_BASE = 'https://tcm-knowledge-base.vercel.app'
const SYMPTOMS = [
  '失眠', '胃痛', '頭痛', '月經失調', '皮膚過敏',
  '疲倦', '腰酸', '胸悶', '口苦', '大便不順',
  '尿頻', '備孕', '減肥'
]

async function testSymptom(browser, symptom) {
  const results = []

  for (let round = 1; round <= 3; round++) {
    let context, page
    try {
      context = await browser.newContext({ 
        viewport: { width: 1280, height: 900 },
        ignoreHTTPSErrors: true 
      })
      page = await context.newPage()

      console.log(`  [${symptom}] Round ${round}...`)
      
      // Navigate
      await page.goto(`${API_BASE}/zh-TW`, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      })
      await page.waitForTimeout(3000) // Wait for hydration

      // Find the free search input - try multiple selectors
      let filled = false
      const selectors = [
        'input[placeholder*="容易疲勞"]',
        'input[placeholder*="症狀"]',
        'input[placeholder*="AI"]',
        'input[type="text"]',
      ]
      
      for (const sel of selectors) {
        try {
          const el = page.locator(sel).first()
          if (await el.isVisible({ timeout: 3000 })) {
            await el.fill(symptom)
            filled = true
            console.log(`    → Filled via: ${sel}`)
            break
          }
        } catch {}
      }
      
      if (!filled) {
        // Try finding by label text
        const inputEl = page.locator('input').filter({ hasNotText: /^\d+$/ }).first()
        if (await inputEl.isVisible({ timeout: 5000 })) {
          await inputEl.fill(symptom)
          filled = true
          console.log(`    → Filled via generic input`)
        }
      }
      
      if (!filled) {
        throw new Error('Could not find input field')
      }
      
      await page.waitForTimeout(500)
      
      // Click search button
      const searchBtn = page.locator('button').filter({ hasText: '搜尋' }).first()
      await searchBtn.click({ timeout: 5000 })
      
      // Wait for response (up to 8s)
      await page.waitForTimeout(6000)
      
      // Get page content
      const bodyText = await page.textContent('body').catch(() => '')
      
      // Diagnose state
      const hasLoading = bodyText.includes('分析中') || bodyText.includes('搜尋中')
      const hasQuestion = bodyText.includes('大便形態') || bodyText.includes('睡眠情況') ||
                          bodyText.includes('怕冷') || bodyText.includes('出汗') ||
                          bodyText.includes('食欲') || bodyText.includes('口渴') ||
                          bodyText.includes('精力') || bodyText.includes('情緒') ||
                          bodyText.includes('小便') || bodyText.includes('酸痛') ||
                          bodyText.includes('胸悶') || bodyText.includes('口腔')
      const hasResult = bodyText.includes('已完成辨證') || bodyText.includes('心腎不交') ||
                        bodyText.includes('結果') || bodyText.includes('建議')
      const hasError = bodyText.includes('錯誤') || bodyText.includes('失敗')
      
      console.log(`    → loading=${hasLoading}, question=${hasQuestion}, result=${hasResult}, error=${hasError}`)
      
      const roundResult = {
        symptom,
        round,
        loading: hasLoading,
        question: hasQuestion,
        result: hasResult,
        error: hasError,
        ok: hasQuestion || hasResult
      }
      results.push(roundResult)
      
      // Click first option if question is shown (for round 1-2)
      if (hasQuestion && round < 3) {
        const optionSelectors = [
          'text=不易入睡但睡得沉',
          'text=失眠/不容易入睡',
          'text=成形正常',
          'text=乾硬',
          'text=偏軟',
          'text=怕冷',
          'text=怕熱',
          'button:has-text("正常")',
          'button:has-text("失眠")',
        ]
        
        for (const optSel of optionSelectors) {
          try {
            const opt = page.locator(optSel).first()
            if (await opt.isVisible({ timeout: 2000 })) {
              await opt.click()
              console.log(`    → Clicked: ${optSel}`)
              await page.waitForTimeout(6000)
              break
            }
          } catch {}
        }
      }
      
    } catch (err) {
      console.log(`  [${symptom}] Round ${round} ERROR: ${err.message.slice(0, 120)}`)
      results.push({ symptom, round, error: err.message.slice(0, 120), ok: false })
    }
    
    // Clean close
    try { await context.close() } catch {}
    await new Promise(r => setTimeout(r, 5000)) // 5s between rounds (CPU limit)
  }
  
  return results
}

async function main() {
  console.log('🚀 TCM FreeSearch Multi-Turn Test (Fixed)')
  console.log(`📱 Target: ${API_BASE}`)
  console.log(`📋 Symptoms: ${SYMPTOMS.join(', ')}\n`)
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  })
  
  const allResults = []
  
  for (const symptom of SYMPTOMS) {
    console.log(`\n🧪 Testing: ${symptom}`)
    try {
      const results = await testSymptom(browser, symptom)
      allResults.push(...results)
      const passCount = results.filter(r => r.ok).length
      console.log(`  ✅ Passed: ${passCount}/3`)
    } catch (err) {
      console.log(`  ❌ Fatal: ${err.message}`)
    }
    
    await new Promise(r => setTimeout(r, 15000)) // 15s between symptoms (5% CPU)
  }
  
  await browser.close()
  
  // Summary
  console.log('\n\n========== SUMMARY ==========')
  const passed = allResults.filter(r => r.ok).length
  const total = allResults.length
  console.log(`Passed: ${passed}/${total}`)
  
  for (const s of SYMPTOMS) {
    const rs = allResults.filter(r => r.symptom === s && r.ok)
    const pct = rs.length > 0 ? '✅' : '❌'
    console.log(`  ${pct} ${s}: ${rs.length}/3`)
  }
  
  // Save
  require('fs').writeFileSync('/tmp/tcm_freesearch_results_v2.json', JSON.stringify(allResults, null, 2))
  console.log('\nSaved: /tmp/tcm_freesearch_results_v2.json')
}

main().catch(console.error)
const { chromium } = require('playwright');

const BASE = 'https://tcm-knowledge-base.vercel.app';
const SYMPTOMS = ['失眠', '胃痛', '頭痛', '月經失調', '皮膚過敏', '疲倦', '腰酸', '胸悶', '口苦', '大便不順'];
const WAIT_API = 5000;
const WAIT_AFTER_CLICK = 4000;
const SHOT_DIR = '/tmp/tcm_test';

const fs = require('fs');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

let shotCount = 0;
function screenshot(page, label) {
  shotCount++;
  const path = `${SHOT_DIR}/${String(shotCount).padStart(3, '0')}_${label}.png`;
  page.screenshot({ path, fullPage: false }).catch(() => {});
  console.log(`  📸 ${path.split('/').pop()}`);
}

async function runTest(browser, symptom) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  let result = { symptom, success: false, firstQuestion: null, apiCalls: [], error: null };

  try {
    // Step 1: Load page
    await page.goto(`${BASE}/zh-TW`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    screenshot(page, `${symptom}_01_loaded`);

    // Step 2: Find and type in the free search input
    // The input has placeholder "例如：容易疲勞、晚上睡不好、胃口差"
    const input = page.locator('input[placeholder*="例如"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(symptom);
    screenshot(page, `${symptom}_02_typed`);

    // Step 3: Click the search button
    const searchBtn = page.locator('button:has-text("搜尋")');
    await searchBtn.click();
    screenshot(page, `${symptom}_03_after_search_click`);
    console.log(`  ⏳ Waiting ${WAIT_API}ms for API...`);

    // Wait for either loading to finish or questions to appear
    await page.waitForTimeout(WAIT_API);

    // Step 4: Check what's on the page
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasLoading = bodyText.includes('正在搜尋') || bodyText.includes('loading');
    const hasQuestion = bodyText.includes('?') || bodyText.includes('情況') || bodyText.includes('睡眠') || bodyText.includes('大便') || bodyText.includes('飲食');
    
    console.log(`  ℹ️  Loading: ${hasLoading}, Has Question: ${hasQuestion}`);
    
    // Check if we have a followup question visible
    // The followup question should be inside a div with option buttons
    const questionText = await page.locator('text=/情況\\?|\\?|睡眠|大便|飲食|症狀|感覺/').first().textContent().catch(() => null);
    if (questionText) {
      result.firstQuestion = questionText;
      console.log(`  ✅ First question: "${questionText}"`);
    }

    screenshot(page, `${symptom}_04_after_api_response`);

    // Step 5: Try to find and click an option button
    // Look for buttons that are options (should be inside a questionnaire card)
    // The option buttons have a specific style: background rgba(44,74,62,0.04) or similar
    // They should be visible as part of the questionnaire
    
    const allButtons = await page.locator('button').all();
    let optionBtn = null;
    let optionText = '';
    
    for (const btn of allButtons) {
      const text = await btn.textContent().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      if (visible && text.length > 0 && text.length < 30) {
        // Skip nav/menu buttons
        if (text.includes('搜尋') || text.includes('上一步') || text.includes('下一步') || text.includes('提交')) continue;
        optionBtn = btn;
        optionText = text.trim();
        break;
      }
    }

    if (optionBtn && optionText) {
      console.log(`  🖱️  Clicking option: "${optionText}"`);
      await optionBtn.click();
      screenshot(page, `${symptom}_05_option_clicked`);
      console.log(`  ⏳ Waiting ${WAIT_AFTER_CLICK}ms after click...`);
      await page.waitForTimeout(WAIT_AFTER_CLICK);
      
      const bodyAfter = await page.evaluate(() => document.body.innerText);
      const hasNextQuestion = bodyAfter.includes('?') || bodyAfter.includes('情況') || bodyAfter.includes('睡眠') || bodyAfter.includes('大便');
      const hasResult = bodyAfter.includes('分析結果') || bodyAfter.includes('體質') || bodyAfter.includes('調理');
      
      console.log(`  ℹ️  After click - Next question: ${hasNextQuestion}, Has result: ${hasResult}`);
      screenshot(page, `${symptom}_06_after_option_wait`);
      
      result.success = hasNextQuestion || hasResult;
    } else {
      console.log(`  ⚠️  No option button found (buttons: ${allButtons.length})`);
      result.error = 'No option button found';
    }

    if (errors.length > 0) {
      console.log(`  ⚠️  Console errors: ${errors.slice(0, 3).join(' | ')}`);
    }

  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    result.error = e.message;
    screenshot(page, `${symptom}_error`);
  } finally {
    await context.close();
  }

  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log('🧪 TCM Frontend Multi-Symptom Test (60min)');
  console.log('========================================\n');

  const results = [];
  for (let i = 0; i < SYMPTOMS.length; i++) {
    const symptom = SYMPTOMS[i];
    const eta = ((SYMPTOMS.length - i - 1) * 8 + 5) + 'min remaining';
    console.log(`[${i + 1}/${SYMPTOMS.length}] ${symptom} (ETA: ${eta})`);
    try {
      const result = await runTest(browser, symptom);
      results.push(result);
      if (result.firstQuestion) {
        console.log(`  → First Q: "${result.firstQuestion}"`);
      }
      if (result.error) {
        console.log(`  → Error: ${result.error}`);
      }
    } catch (e) {
      console.log(`  ❌ Failed: ${e.message}`);
    }
    console.log('');
    // Wait 5s between tests to avoid rate limit
    await new Promise(r => setTimeout(r, 5000));
  }

  await browser.close();

  // Summary
  console.log('\n========================================');
  console.log('📊 SUMMARY');
  console.log('========================================');
  for (const r of results) {
    const status = r.success ? '✅' : '❌';
    const q = r.firstQuestion || '(no question)';
    console.log(`${status} ${r.symptom}: ${q}`);
  }
  const failures = results.filter(r => !r.success);
  console.log(`\n✅ ${results.length - failures.length} passed, ❌ ${failures.length} failed`);
  console.log('\n✅ Test complete');
})();
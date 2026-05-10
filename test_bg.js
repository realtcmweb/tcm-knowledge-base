const { chromium } = require('playwright');

const BASE = 'https://tcm-knowledge-base.vercel.app';
const SYMPTOMS = ['失眠', '胃痛', '頭痛', '月經失調', '皮膚過敏', '疲倦', '腰酸', '胸悶', '口苦', '大便不順', '尿頻', '備孕', '減肥'];
const WAIT_API = 10000;  // Wait up to 10s for API response
const WAIT_AFTER_CLICK = 8000;
const SHOT_DIR = '/tmp/tcm_test3';

const fs = require('fs');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

let shotCount = 0;
function screenshot(page, label) {
  shotCount++;
  const path = `${SHOT_DIR}/${String(shotCount).padStart(3, '0')}_${label}.png`;
  page.screenshot({ path, fullPage: false }).catch(() => {});
  return path.split('/').pop();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForApiResponse(page, timeoutMs = 12000) {
  // Wait until the button text changes from "分析中..." back to "搜尋"
  // OR the loading text disappears
  try {
    await page.waitForFunction(
      () => {
        const body = document.body.innerText;
        // Loading is gone when the button goes back to "搜尋" or "分析中..." is gone
        // AND there's actual question text (not just the hero section)
        const loadingGone = !body.includes('正在搜尋') && !body.includes('分析中');
        // AND there's a question with TCM question pattern
        const hasQ = /[情況大小便食欲睡眠精力寒熱情緒胸悶腰酸口苦皮膚尿].*\？/.test(body);
        return loadingGone && hasQ;
      },
      { timeout: timeoutMs }
    );
    return true;
  } catch {
    return false;
  }
}

async function runTest(browser, symptom) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Capture API responses via response listener
  let apiResponse = null;
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/ask') && resp.status() !== 0) {
      try {
        const json = await resp.json().catch(() => null);
        if (json) apiResponse = json;
      } catch {}
    }
  });

  let result = { symptom, firstQuestion: null, apiOk: false, afterClickAdvanced: false, error: null };

  try {
    await page.goto(`${BASE}/zh-TW`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Find the free search input
    const input = page.locator('input[placeholder*="例如"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(symptom);

    // Clear any previous API response
    apiResponse = null;

    // Click search button
    const searchBtn = page.locator('button:has-text("搜尋")');
    await searchBtn.click();

    console.log(`  ⏳ Waiting up to ${WAIT_API}ms for API...`);
    const gotResponse = await waitForApiResponse(page, WAIT_API);

    if (!gotResponse) {
      // Check if API is still loading
      const bodyText = await page.evaluate(() => document.body.innerText);
      const stillLoading = bodyText.includes('分析中') || bodyText.includes('正在搜尋');

      if (stillLoading) {
        console.log(`  ❌ API TIMEOUT: still loading after ${WAIT_API}ms`);
        result.error = 'API timeout - no response';
        screenshot(page, `${symptom}_timeout`);
      } else {
        console.log(`  ⚠️  Loading gone but no question found`);
      }
    }

    // Check API response
    if (apiResponse) {
      result.apiOk = true;
      const fqs = apiResponse.followup_questions;
      if (fqs && fqs.length > 0) {
        result.firstQuestion = fqs[0].text || fqs[0].id;
        console.log(`  ✅ API OK: followup_questions[0].id=${fqs[0].id}, text="${fqs[0].text}"`);
      } else {
        console.log(`  ✅ API OK: done=${apiResponse.done}, answer="${(apiResponse.answer || '').substring(0, 50)}"`);
      }
    } else {
      console.log(`  ❌ No API response captured`);
    }

    const shot1 = screenshot(page, `${symptom}_after_api`);
    console.log(`  📸 ${shot1}`);

    // Now find the ACTUAL questionnaire option buttons
    // Skip the search button, skip buttons from hero section
    if (result.firstQuestion) {
      // Wait a bit more for rendering
      await sleep(1000);

      const bodyNow = await page.evaluate(() => document.body.innerText);

      // Look for option buttons - they should be in the white questionnaire box
      // Each option button has Chinese text and specific styling
      // They are usually in a list (flex/col) with rounded-xl styling
      const optionBtns = await page.locator('.space-y-2 > button, [class*="space-y"] button').all().catch(() => []);

      let foundOption = null;
      let foundText = '';

      // Try multiple selectors to find option buttons
      const selectors = [
        'div[class*="space-y"] > button',
        '[class*="rounded-xl"][class*="w-full"]:not([class*="px-5"])', // Avoid big buttons
        'button[class*="transition"]:not([class*="px-5 py-4"])', // Avoid big card buttons
      ];

      for (const sel of selectors) {
        const btns = await page.locator(sel).all().catch(() => []);
        for (const btn of btns) {
          const text = (await btn.textContent().catch(() => '')).trim();
          const visible = await btn.isVisible().catch(() => false);
          // Skip skip buttons
          if (!visible || text.length === 0) continue;
          if (text.includes('搜尋') || text.includes('上一步') || text.includes('下一步') || text.includes('提交')) continue;
          // Check if button is short (option buttons are short)
          if (text.length <= 30 && !text.includes('快速問診') && !text.includes('詳細問診')) {
            foundOption = btn;
            foundText = text;
            break;
          }
        }
        if (foundOption) break;
      }

      if (foundOption) {
        console.log(`  🖱️  Click option: "${foundText}"`);
        await foundOption.click();
        const shot2 = screenshot(page, `${symptom}_after_option`);
        console.log(`  📸 ${shot2}`);

        console.log(`  ⏳ Wait ${WAIT_AFTER_CLICK}ms...`);
        await sleep(WAIT_AFTER_CLICK);

        const bodyAfter = await page.evaluate(() => document.body.innerText);
        const newLoading = bodyAfter.includes('分析中') || bodyAfter.includes('正在搜尋');
        const gotNewQ = /[情況大小便食欲睡眠精力寒熱胸悶腰酸口苦皮膚尿].*\？/.test(bodyAfter);
        const gotResult = bodyAfter.includes('分析結果') || (bodyAfter.includes('體質') && bodyAfter.includes('調理'));

        console.log(`  ℹ️  After click: loading=${newLoading}, newQ=${gotNewQ}, result=${gotResult}`);

        if (newLoading) {
          console.log(`  ⚠️  Still loading after click`);
          result.afterClickAdvanced = false;
          result.error = 'Still loading after option click';
        } else if (gotNewQ || gotResult) {
          result.afterClickAdvanced = true;
          console.log(`  ✅ Advanced`);
        } else {
          result.afterClickAdvanced = false;
          console.log(`  ⚠️  No advancement detected`);
        }

        const shot3 = screenshot(page, `${symptom}_final`);
        console.log(`  📸 ${shot3}`);
      } else {
        console.log(`  ⚠️  No option button found`);
        result.error = 'No option button found';
      }
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
  console.log('🧪 TCM API + UI Test (v3 - accurate detection)');
  console.log('==========================================\n');

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < SYMPTOMS.length; i++) {
    const symptom = SYMPTOMS[i];
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    console.log(`\n[${i + 1}/${SYMPTOMS.length}] ${symptom} (${elapsed}min elapsed)`);

    const r = await runTest(browser, symptom);
    results.push(r);

    if (r.apiOk) {
      console.log(`  → API: ✅, Q: "${r.firstQuestion || 'done'}"`);
    } else {
      console.log(`  → API: ❌, error: ${r.error}`);
    }

    if (r.afterClickAdvanced) {
      console.log(`  → Click: ✅ Advanced`);
    }

    await sleep(3000);
  }

  await browser.close();

  console.log('\n==========================================');
  console.log('📊 FINAL RESULTS');
  console.log('==========================================');
  let apiOk = 0, apiFail = 0, clickOk = 0, clickFail = 0;
  for (const r of results) {
    const api = r.apiOk ? '✅' : '❌';
    const click = r.afterClickAdvanced ? '✅' : '❌';
    const q = r.firstQuestion || (r.error === 'API timeout' ? '(timeout)' : '(none)');
    console.log(`${api} API ${click} Click | ${r.symptom}: Q="${q}"`);
    if (r.apiOk) apiOk++; else apiFail++;
    if (r.afterClickAdvanced) clickOk++; else clickFail++;
  }
  console.log(`\nAPI: ✅ ${apiOk}/${results.length} | ❌ ${apiFail}/${results.length}`);
  console.log(`Click: ✅ ${clickOk}/${results.length} | ❌ ${clickFail}/${results.length}`);
  console.log('\n✅ Done');
})();
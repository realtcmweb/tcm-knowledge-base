const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing TCM multi-turn flow...');
  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  // 1. Fill in the symptom input
  const input = page.locator('input[placeholder*="例如：容易疲勞"]').first();
  await input.fill('失眠');
  console.log('✓ Filled symptom input: 失眠');
  
  // 2. Wait for search button to be enabled, then click
  const searchBtn = page.locator('button:has-text("搜尋")').first();
  await searchBtn.waitFor({ state: 'enabled', timeout: 5000 }).catch(() => {});
  const isDisabled = await searchBtn.isDisabled();
  console.log('Search button disabled?', isDisabled);
  
  if (!isDisabled) {
    await searchBtn.click();
    console.log('✓ Clicked 搜尋 button');
  }
  
  // 3. Wait for response
  await page.waitForTimeout(3000);
  
  // 4. Check page content
  const bodyText = await page.locator('body').innerText();
  
  // Check for follow-up questions
  const hasStool = bodyText.includes('大便');
  const hasSleep = bodyText.includes('睡眠');
  console.log('Has 大便 question:', hasStool);
  console.log('Has 睡眠 question:', hasSleep);
  
  // Check for clickable option buttons
  const normalBtn = page.locator('button:has-text("成形正常")').first();
  const dryBtn = page.locator('button:has-text("乾硬")').first();
  console.log('成形正常 button visible:', await normalBtn.isVisible().catch(() => false));
  console.log('乾硬 button visible:', await dryBtn.isVisible().catch(() => false));
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/tcm_multi_turn.png', fullPage: true });
  console.log('Screenshot: /tmp/tcm_multi_turn.png');
  
  // Get follow-up question section
  if (hasStool) {
    const followupSection = await page.locator('text=大便').first().locator('..').innerHTML().catch(() => 'err');
    console.log('Follow-up section HTML:', followupSection.substring(0, 300));
  }
  
  await browser.close();
  console.log('\n✅ Test done');
})();

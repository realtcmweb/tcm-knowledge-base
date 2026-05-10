const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('=== TCM Multi-Turn Full Flow Test ===\n');
  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  // Step 1: Enter symptom
  const input = page.locator('input[placeholder*="例如：容易疲勞"]').first();
  await input.fill('失眠');
  console.log('Step 1 ✓ Entered: 失眠');
  
  // Step 2: Submit
  await page.locator('button:has-text("搜尋")').first().click();
  await page.waitForTimeout(2500);
  
  // Step 3: Verify first follow-up question
  const q1Text = await page.locator('text=大便形態').textContent().catch(() => null);
  console.log('Step 3 ✓ First question:', q1Text);
  
  // Step 4: Click "成形正常"
  const opt1 = page.locator('button:has-text("成形正常")').first();
  await opt1.click();
  console.log('Step 4 ✓ Clicked: 成形正常');
  
  await page.waitForTimeout(2000);
  
  // Step 5: Verify second question (睡眠情況)
  const hasSleepQ = await page.locator('text=睡眠情況').isVisible().catch(() => false);
  console.log('Step 5 ✓ Second question visible (睡眠情況):', hasSleepQ);
  
  if (hasSleepQ) {
    // Step 6: Click "失眠"
    const opt2 = page.locator('button:has-text("失眠")').first();
    await opt2.click();
    console.log('Step 6 ✓ Clicked: 失眠');
    
    await page.waitForTimeout(2000);
    
    // Step 7: Check third question
    const hasColdQ = await page.locator('text=怕冷').isVisible().catch(() => false);
    const hasTempQ = await page.locator('text=怕冷還是怕熱').isVisible().catch(() => false);
    console.log('Step 7 ✓ Third question visible (怕冷/溫度):', hasColdQ || hasTempQ);
    
    // Continue answering
    const coldOpt = page.locator('button:has-text("怕冷")').first();
    if (await coldOpt.isVisible()) {
      await coldOpt.click();
      console.log('Step 7b ✓ Answered: 怕冷');
    }
    
    await page.waitForTimeout(2000);
  }
  
  // Step 8: Check final result
  const bodyText = await page.locator('body').innerText();
  const hasResult = bodyText.includes('證型') || bodyText.includes('體質') || bodyText.includes('建議');
  const done = bodyText.includes('已完成');
  console.log('Step 8 - Has result section:', hasResult);
  console.log('Step 8 - Done state:', done);
  
  // Take final screenshot
  await page.screenshot({ path: '/tmp/tcm_final.png', fullPage: true });
  console.log('\nScreenshot: /tmp/tcm_final.png');
  
  await browser.close();
  console.log('\n✅ Full flow test completed');
})();

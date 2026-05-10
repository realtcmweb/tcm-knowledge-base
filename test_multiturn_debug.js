const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('[Browser]', msg.text()));

  console.log('=== Multi-Turn Debug Test ===\n');
  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  // Enter symptom
  await page.locator('input[placeholder*="例如：容易疲勞"]').fill('失眠');
  await page.locator('button:has-text("搜尋")').click();
  
  // Wait for Q1 (d_stool)
  await page.waitForTimeout(3000);
  
  const q1 = await page.locator('p:has-text("大便形態")').textContent().catch(() => null);
  console.log('Q1:', q1);
  
  // Answer Q1
  await page.locator('button:has-text("成形正常")').click();
  console.log('Answered Q1: 成形正常');
  
  // Wait for Q2 (d_sleep) - need more time
  await page.waitForTimeout(4000);
  
  const bodyText = await page.locator('body').innerText();
  const hasSleep = bodyText.includes('睡眠情況');
  const hasMood = bodyText.includes('情緒');
  const hasCold = bodyText.includes('怕冷') || bodyText.includes('手腳');
  console.log('After Q1 answer - Q2 visible (睡眠情況):', hasSleep);
  console.log('After Q1 answer - Q3 visible (情緒/溫度):', hasMood || hasCold);
  
  // Check if result already shown
  const done = bodyText.includes('已完成') || bodyText.includes('心腎不交') || bodyText.includes('氣陰兩虛');
  console.log('Done/Result shown:', done);
  
  // Show what IS visible
  const lines = bodyText.split('\n').filter(l => l.trim()).slice(-20);
  console.log('\nLast 20 text lines on page:');
  lines.forEach(l => console.log(' ', l.substring(0, 60)));
  
  await page.screenshot({ path: '/tmp/tcm_debug.png', fullPage: true });
  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  console.log('1. Entering symptom...');
  await page.locator('input[placeholder*="例如：容易疲勞"]').fill('失眠');
  await page.locator('button:has-text("搜尋")').click();
  await page.waitForTimeout(3500);
  
  // Check Q1
  const q1 = await page.locator('text=大便形態').textContent().catch(() => 'NOT FOUND');
  console.log('Q1 (大便形態):', q1 ? 'FOUND' : 'NOT FOUND');
  
  // Click first option
  console.log('2. Clicking 成形正常...');
  await page.locator('button:has-text("成形正常")').click();
  await page.waitForTimeout(4000);
  
  // Get all page text
  const allText = await page.locator('body').innerText();
  
  // Look for specific indicators
  console.log('\n=== Page content check ===');
  console.log('Has 大便形態:', allText.includes('大便形態'));
  console.log('Has 睡眠情況:', allText.includes('睡眠情況'));
  console.log('Has 怕冷:', allText.includes('怕冷'));
  console.log('Has 情緒:', allText.includes('情緒'));
  console.log('Has 已完成:', allText.includes('已完成'));
  console.log('Has 心腎不交:', allText.includes('心腎不交'));
  console.log('Has 氣陰兩虛:', allText.includes('氣陰兩虛'));
  
  // Try to find current question - look for text that appears after the header
  const lines = allText.split('\n').filter(l => l.trim().length > 3);
  console.log('\n=== Text lines containing question text ===');
  lines.forEach(l => {
    if (l.includes('大便') || l.includes('睡眠') || l.includes('怕冷') || l.includes('情緒') || l.includes('已完成')) {
      console.log(' >', l.substring(0, 80));
    }
  });
  
  await page.screenshot({ path: '/tmp/tcm_final_full.png', fullPage: true });
  await browser.close();
  console.log('\nScreenshot: /tmp/tcm_final_full.png');
})();

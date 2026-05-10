const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('/api/ask') && req.method() === 'POST') {
      requests.push(req.url());
    }
  });

  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  // Search
  await page.locator('input[placeholder*="例如：容易疲絰"]').fill('失眠');
  await page.locator('button:has-text("搜尋")').click();
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/tmp/tcm_q1.png' });
  console.log('After search: Q1 visible');
  
  // Click option
  await page.locator('button:has-text("成形正常")').click();
  
  // Wait less time to catch intermediate state
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/tcm_immediate.png' });
  console.log('Immediate after click (500ms)');
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/tcm_3s.png' });
  console.log('3 seconds after click');
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/tcm_5s.png' });
  console.log('5 seconds after click');
  
  // Get full page text at end
  const text = await page.locator('body').innerText();
  const qLines = text.split('\n').filter(l => l.trim().length > 3);
  console.log('\nFinal page text (relevant lines):');
  qLines.slice(-25).forEach(l => console.log(' ', l.substring(0, 70)));
  
  await browser.close();
})();

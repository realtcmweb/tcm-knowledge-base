const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture all network requests and responses
  const apiCalls = [];
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      apiCalls.push({ direction: 'OUT', url: req.url(), method: req.method() });
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      try {
        const body = await res.json().catch(() => res.text().catch(() => ''));
        apiCalls.push({ direction: 'IN', url: res.url(), status: res.status(), body: typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body).substring(0, 300) });
      } catch {}
    }
  });

  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  console.log('1. Entering symptom...');
  await page.locator('input[placeholder*="例如：容易疲勞"]').fill('失眠');
  await page.locator('button:has-text("搜尋")').click();
  await page.waitForTimeout(3000);
  
  console.log('\n=== API calls after first search ===');
  apiCalls.forEach(c => console.log(JSON.stringify(c).substring(0, 250)));
  
  // Clear and continue
  apiCalls.length = 0;
  
  console.log('\n2. Clicking 成形正常...');
  await page.locator('button:has-text("成形正常")').click();
  await page.waitForTimeout(3000);
  
  console.log('\n=== API calls after clicking option ===');
  apiCalls.forEach(c => console.log(JSON.stringify(c).substring(0, 250)));
  
  // Show page state
  const bodyText = await page.locator('body').innerText();
  console.log('\n=== Page text ===');
  const qLines = bodyText.split('\n').filter(l => l.trim().length > 2).slice(-15);
  qLines.forEach(l => console.log(' ', l.substring(0, 80)));
  
  await browser.close();
})();

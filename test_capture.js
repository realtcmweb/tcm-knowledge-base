const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const requests = [];
  const responses = [];
  
  page.on('request', req => {
    if (req.url().includes('/api/ask') && req.method() === 'POST') {
      requests.push({ url: req.url(), method: 'POST' });
    }
  });
  
  page.on('response', async res => {
    if (res.url().includes('/api/ask')) {
      try {
        const body = await res.json().catch(() => null);
        if (body) {
          responses.push({
            status: res.status(),
            followup_questions: body.followup_questions?.map(q => ({ id: q.id, text: q.text?.substring(0, 20) })),
            need_followup: body.need_followup,
            done: body.done,
            context: body.context
          });
        }
      } catch {}
    }
  });

  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  console.log('=== Initial state ===');
  await page.locator('input[placeholder*="例如：容易疲勞"]').fill('失眠');
  await page.locator('button:has-text("搜尋")').click();
  await page.waitForTimeout(3000);
  
  console.log('After step 1 (search):');
  console.log('  Requests sent:', requests.length);
  console.log('  Responses received:', responses.length);
  console.log('  Response 0:', JSON.stringify(responses[0]));
  
  // Reset tracking
  requests.length = 0;
  responses.length = 0;
  
  console.log('\n=== Click 成形正常 ===');
  await page.locator('button:has-text("成形正常")').click();
  await page.waitForTimeout(3500);
  
  console.log('After step 2 (click option):');
  console.log('  Requests sent:', requests.length);
  console.log('  Responses received:', responses.length);
  if (responses[0]) {
    console.log('  Response 0:', JSON.stringify(responses[0]));
  }
  
  // Now let's also try to see what options are rendered on page
  const page2Text = await page.locator('body').innerText();
  console.log('\nPage text lines with questions:');
  page2Text.split('\n').filter(l => l.includes('大便') || l.includes('睡眠') || l.includes('怕冷')).forEach(l => console.log(' ', l.substring(0, 60)));
  
  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('request', req => {
    if (req.url().includes('/api/ask') && req.method() === 'POST') {
      console.log('\n=== OUTGOING ===');
      console.log('URL:', req.url());
      // Access postData through a workaround
      const postData = req._postData || '(not available)';
      console.log('Method:', req.method());
    }
  });
  
  page.on('response', async res => {
    if (res.url().includes('/api/ask')) {
      try {
        const body = await res.json();
        console.log('\n=== INCOMING ===');
        console.log('URL:', res.url());
        console.log('Status:', res.status());
        const fq = body.followup_questions || [];
        console.log('followup_questions count:', fq.length);
        if (fq.length > 0) {
          console.log('First Q id:', fq[0].id);
          console.log('First Q text:', (fq[0].text || '').substring(0, 40));
        }
        console.log('need_followup:', body.need_followup);
        console.log('done:', body.done);
        console.log('context:', JSON.stringify(body.context));
      } catch(e) {
        console.log('Parse error:', e.message);
      }
    }
  });

  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  console.log('\n=== STEP 1: Search with 失眠 ===');
  await page.locator('input[placeholder*="例如：容易疲勞"]').fill('失眠');
  await page.locator('button:has-text("搜尋")').click();
  await page.waitForTimeout(3000);
  
  const text1 = await page.locator('body').innerText();
  console.log('Q1 visible:', text1.includes('大便形態'));
  
  console.log('\n=== STEP 2: Click 成形正常 ===');
  await page.locator('button:has-text("成形正常")').click();
  await page.waitForTimeout(3500);
  
  const text2 = await page.locator('body').innerText();
  console.log('Q2 visible (睡眠情況):', text2.includes('睡眠情況'));
  console.log('Q1 still visible:', text2.includes('大便形態'));
  console.log('done:', text2.includes('已完成'));
  
  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let lastRequestBody = null;
  page.on('request', req => {
    if (req.url().includes('/api/ask')) {
      req.postDataBuffer().then(buf => {
        if (buf) {
          lastRequestBody = buf.toString();
          console.log('\n=== OUTGOING REQUEST ===');
          console.log('Body:', lastRequestBody);
        }
      }).catch(() => {});
    }
  });

  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  console.log('=== STEP 1: First search (symptom: 失眠) ===');
  await page.locator('input[placeholder*="例如：容易疲勞"]').fill('失眠');
  await page.locator('button:has-text("搜尋")').click();
  await page.waitForTimeout(3000);
  
  const text1 = await page.locator('body').innerText();
  console.log('\nPage has 大便形態:', text1.includes('大便形態'));
  console.log('Page has 成形正常 option:', text1.includes('成形正常'));
  
  console.log('\n=== STEP 2: Click 成形正常 ===');
  lastRequestBody = null;
  await page.locator('button:has-text("成形正常")').click();
  await page.waitForTimeout(3000);
  
  console.log('\n=== STEP 3: After click - check page ===');
  const text2 = await page.locator('body').innerText();
  console.log('Page has 大便形態 (still showing Q1):', text2.includes('大便形態'));
  console.log('Page has 睡眠情況 (should show Q2):', text2.includes('睡眠情況'));
  console.log('Page has 已完成:', text2.includes('已完成'));
  
  // Check what React state looks like via window
  const reactState = await page.evaluate(() => {
    const keys = Object.keys(window).filter(k => k.includes('__react') || k.includes('redux'));
    return { hasReact: keys.length > 0, count: keys.length };
  });
  console.log('\nReact state keys:', reactState);
  
  await browser.close();
})();

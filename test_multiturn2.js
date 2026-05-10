const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing TCM homepage structure...');
  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot to see what's on the page
  await page.screenshot({ path: '/tmp/tcm_home.png', fullPage: true });
  
  // Get all visible text to find the search button
  const bodyText = await page.locator('body').innerText();
  console.log('Page text (first 800 chars):', bodyText.substring(0, 800));
  
  await browser.close();
})();

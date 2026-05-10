const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing TCM free search input...');
  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  // Get the HTML structure around "搜尋" button
  const searchBtn = page.locator('button:has-text("搜尋")').first();
  const btnHtml = await searchBtn.innerHTML();
  console.log('Search button HTML:', btnHtml);
  
  // Find the parent form
  const parentHtml = await searchBtn.locator('..').innerHTML().catch(() => 'error');
  console.log('Parent element:', parentHtml.substring(0, 500));
  
  // Find any input elements
  const inputs = await page.locator('input').all();
  console.log('Number of input elements:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type');
    const placeholder = await inputs[i].getAttribute('placeholder');
    console.log(`  input[${i}] type=${type}, placeholder=${placeholder}`);
  }
  
  // Check for textarea using different selector
  const textareas = await page.locator('textarea').all();
  console.log('Textarea count (locator):', textareas.length);
  
  await browser.close();
})();

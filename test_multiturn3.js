const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing TCM free search flow...');
  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  
  // Find and fill the symptom textarea (in the free search section)
  const textareas = await page.locator('textarea').all();
  console.log('Number of textareas:', textareas.length);
  
  for (let i = 0; i < textareas.length; i++) {
    const placeholder = await textareas[i].getAttribute('placeholder');
    console.log(`  textarea[${i}] placeholder:`, placeholder);
  }
  
  // Try to find the search button near the textarea
  const searchBtn = page.locator('button:has-text("搜尋")').first();
  console.log('Search button visible:', await searchBtn.isVisible());
  
  if (textareas.length > 0) {
    // Fill symptom
    await textareas[0].fill('失眠');
    console.log('✓ Filled symptom: 失眠');
    
    // Click search
    await searchBtn.click();
    console.log('✓ Clicked 搜尋 button');
    
    await page.waitForTimeout(3000);
    
    // Check what happened
    const bodyText = await page.locator('body').innerText();
    const hasFollowup = bodyText.includes('大便') || bodyText.includes('排便');
    console.log('Has follow-up question (大便/排便):', hasFollowup);
    
    // Look for option buttons
    const optionBtns = await page.locator('button:has-text("成形正常"), button:has-text("乾硬")').count();
    console.log('Option buttons visible:', optionBtns);
    
    await page.screenshot({ path: '/tmp/tcm_after_search.png', fullPage: true });
    console.log('Screenshot: /tmp/tcm_after_search.png');
  }
  
  await browser.close();
})();

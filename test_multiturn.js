const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing TCM multi-turn diagnosis flow...');
  
  // 1. Go to homepage
  await page.goto('https://tcm-knowledge-base.vercel.app');
  await page.waitForLoadState('networkidle');
  console.log('✓ Homepage loaded');
  
  // 2. Click "或嘗試看看" button
  const btn = page.locator('button:has-text("或嘗試看看")');
  if (await btn.isVisible()) {
    await btn.click();
    console.log('✓ Clicked free search button');
  } else {
    console.log('✗ Button not visible');
    await page.screenshot({ path: '/tmp/debug_no_button.png' });
    await browser.close();
    return;
  }
  
  await page.waitForTimeout(1500);
  
  // 3. Type symptom
  const textarea = page.locator('textarea[placeholder*="輸入"]').first();
  if (await textarea.isVisible()) {
    await textarea.fill('失眠');
    console.log('✓ Typed symptom');
  } else {
    console.log('✗ Textarea not visible');
    await page.screenshot({ path: '/tmp/debug_no_textarea.png' });
    await browser.close();
    return;
  }
  
  // 4. Click submit
  const submit = page.locator('button:has-text("提交")').first();
  await submit.click();
  console.log('✓ Clicked submit');
  
  await page.waitForTimeout(2000);
  
  // 5. Check for follow-up questions with clickable options
  const questionText = await page.locator('p:text("大便")').first().textContent().catch(() => null);
  const optionBtns = await page.locator('button:has-text("成形正常"), button:has-text("乾硬"), button:has-text("偏軟")').count();
  
  console.log('Question text visible:', questionText ? 'YES: ' + questionText.substring(0,40) : 'NO');
  console.log('Clickable option buttons:', optionBtns);
  
  if (optionBtns > 0) {
    // 6. Click an option
    const firstOption = page.locator('button:has-text("成形正常")').first();
    await firstOption.click();
    console.log('✓ Clicked first option');
    
    await page.waitForTimeout(1500);
    
    // 7. Check for next question
    const nextQuestion = await page.locator('p:text("睡眠")').first().textContent().catch(() => null);
    console.log('Next question:', nextQuestion ? nextQuestion.substring(0,40) : 'not visible yet');
  }
  
  await page.screenshot({ path: '/tmp/debug_after_option.png' });
  console.log('Screenshot saved to /tmp/debug_after_option.png');
  
  await browser.close();
  console.log('\n✅ Test completed');
})();

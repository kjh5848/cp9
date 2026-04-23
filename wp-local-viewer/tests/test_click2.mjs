import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/autopilot');
  await page.waitForTimeout(2000);
  
  console.log("Before click, active tab:");
  const activeTab = await page.locator('button.border-blue-500').textContent();
  console.log(activeTab?.trim());

  // Click the 'Bulk Keyword' tab
  await page.click('button:has-text("주제 기반 AI 리서치")');
  await page.waitForTimeout(1000);

  console.log("After click, active tabs with active color:");
  const activeTabs = await page.$$eval('button', buttons => buttons.filter(b => b.className.includes('border-purple-500')).map(b => b.textContent?.trim()));
  console.log(activeTabs);
  
  const textContent = await page.textContent('body');
  if (textContent.includes('리서치 주제어 (데이터셋)')) {
    console.log("Bulk wizard is visible.");
  } else {
    console.log("Bulk wizard is NOT visible.");
  }

  await browser.close();
})();

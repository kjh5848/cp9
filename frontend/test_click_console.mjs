import { chromium } from 'playwright';

(async () => {
  console.log("Starting browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log("Navigating to page...");
  await page.goto('http://localhost:3000/autopilot', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log("Clicking tab...");
  await page.click('button:has-text("주제 기반 AI 리서치")');
  await page.waitForTimeout(1000);

  const activeTabs = await page.$$eval('button', buttons => buttons.filter(b => b.className.includes('border-purple-500')).map(b => b.textContent?.trim()));
  console.log("Active tabs:", activeTabs);
  
  await browser.close();
  console.log("Done");
})();

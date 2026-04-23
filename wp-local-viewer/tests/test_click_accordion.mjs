import { chromium } from 'playwright';

(async () => {
  console.log("Starting script...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000/autopilot', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log("Looking for Accordion Trigger: 발행 스케줄 상세 설정");
  const accTrigger = await page.locator('button:has-text("발행 스케줄 상세 설정")');
  console.log("Count:", await accTrigger.count());

  await accTrigger.click();
  await page.waitForTimeout(1000);

  // Check if content is visible
  const isVisible = await page.locator(':text("발행 스케줄링")').isVisible();
  console.log("Is ScheduleSettingsSection visible?", isVisible);
  
  await browser.close();
})();

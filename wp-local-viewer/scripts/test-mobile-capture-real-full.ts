import { chromium } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch();
  
  // iPhone 13 Pro dimensions
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  const files = ['real-single_1.html', 'real-compare_1.html', 'real-curation_1.html'];

  for (const file of files) {
    const page = await context.newPage();
    const filePath = `file://${path.resolve(__dirname, '../' + file)}`;
    console.log(`Loading ${filePath}`);
    await page.goto(filePath);
    
    // Wait for images to load
    await page.waitForTimeout(2000);

    const outPath = `/Users/nomadlab/.gemini/antigravity/brain/07922483-238f-44de-a50f-f110590d85b2/mobile_full_${file.replace('.html', '.png')}`;
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved screenshot to ${outPath}`);
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);

import { chromium, devices } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13']
  });
  const page = await context.newPage();
  
  const htmlPath = path.resolve('preview-seo-article.html');
  await page.goto(`file://${htmlPath}`);
  
  // Wait for images to load
  await page.waitForLoadState('networkidle');
  
  // 1. Capture Summary Table (the first table)
  const summaryTable = await page.locator('.cp9-compare-summary-table').first();
  if (await summaryTable.count() > 0) {
    await summaryTable.screenshot({ path: '../.agents/artifacts/mobile_summary_table.png' });
    console.log('Saved mobile_summary_table.png');
  }

  // 2. Capture Compare Grid
  const compareGrid = await page.locator('.cp9-cta--compare-grid').first();
  if (await compareGrid.count() > 0) {
    await compareGrid.screenshot({ path: '../.agents/artifacts/mobile_compare_grid.png' });
    console.log('Saved mobile_compare_grid.png');
  }

  // 3. Capture Compact CTA
  const compactCta = await page.locator('.cp9-cta--compact').first();
  if (await compactCta.count() > 0) {
    await compactCta.screenshot({ path: '../.agents/artifacts/mobile_compact_cta.png' });
    console.log('Saved mobile_compact_cta.png');
  }

  await browser.close();
}

main().catch(console.error);

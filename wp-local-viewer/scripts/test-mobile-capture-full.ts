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
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ path: '../.agents/artifacts/mobile_full_article.png', fullPage: true });
  console.log('Saved mobile_full_article.png');

  await browser.close();
}
main().catch(console.error);

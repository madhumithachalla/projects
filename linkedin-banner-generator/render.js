const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1584, height: 396 }, deviceScaleFactor: 2 });
  const filePath = 'file://' + path.resolve(__dirname, 'banner.html');
  await page.goto(filePath);
  await page.waitForTimeout(400); // let web fonts finish loading
  await page.screenshot({ path: path.resolve(__dirname, 'linkedin_banner.png') });
  await browser.close();
  console.log('done');
})();

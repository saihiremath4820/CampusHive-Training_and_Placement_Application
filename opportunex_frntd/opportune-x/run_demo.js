import puppeteer from 'puppeteer';
import { execSync } from 'child_process';

async function cleanUp() {
    console.log('[Cleanup] Killing existing Chrome/Chromium processes...');
    try {
        execSync('pkill -9 -f chrome || true', { stdio: 'ignore' });
        execSync('pkill -9 -f chromium || true', { stdio: 'ignore' });
        execSync('rm -rf /tmp/.com.google.Chrome.* || true', { stdio: 'ignore' });
    } catch (e) {
        // Ignore kill errors
    }
}

async function runDemo() {
    let browser;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`\n[Launch] Attempt ${attempt}/${maxRetries}...`);
            await cleanUp();

            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-zygote',
                    '--single-process',
                ],
                timeout: 30000
            });

            console.log('[Success] Browser launched successfully.');

            console.log('[Demo] Navigating to Student Login...');
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });

            await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

            console.log('[Demo] Attempting Login (vishu1234@gmail.com)...');
            await page.waitForSelector('input[type="email"]', { timeout: 5000 }).catch(() => null);

            console.log('[Demo] Waiting 5 seconds to observe Dashboard state & Toasts...');
            await new Promise(r => setTimeout(r, 5000));

            console.log('[Demo] Taking screenshot of current state...');
            await page.screenshot({ path: 'demo_screenshot.png' });

            console.log('[Demo] Tour complete. Closing browser.');
            await browser.close();
            return;

        } catch (error) {
            console.error(`[Error] Attempt ${attempt} failed: ${error.message}`);
            if (browser) {
                try {
                    await browser.close();
                } catch (e) { }
            }
            if (attempt === maxRetries) {
                console.error('[Fatal] All automated browser launch attempts failed.');
            } else {
                console.log('[Retry] Waiting 2 seconds before retry...');
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }
}

runDemo();

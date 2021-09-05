const puppeteer = require('puppeteer-core');
const fs = require("fs");
const downloadPath = './download';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 250,
        defaultViewport: {
            width: 1600,
            height: 900,
        },
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--guest']
    });

    await browser.on('targetcreated', async () => {
        const pageList = await browser.pages();
        pageList.forEach((page) => {
            page._client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadPath,
            });
        });
    });

    try {
        const page = await browser.newPage();
        await page.goto('https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00200521&tstat=000001011777&cycle=0&tclass1=000001094741&tclass2val=0');
        await page.waitForSelector('.footer-container');

        let items = await page.$$('.js-dl');
        await items[0].click();
        let filename = await ((async () => {
            let filename;
            while (!filename || filename.endsWith('.crdownload')) {
                filename = fs.readdirSync(downloadPath)[0];
                await sleep(1000);
            }
            return filename
        })());

        function sleep(milliSeconds) {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, milliSeconds);
            });
        }

    } catch (e) {
        console.log(e.message)
    } finally {
        await browser.close();
    }

})();

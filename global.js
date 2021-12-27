const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.alexa.com/topsites';

let browser = null;
let page = null;

const global = {

    initialize: async () => {

        browser = await puppeteer.launch({
            headless: true
        });

        page = await browser.newPage();

        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    },

    count: async () => {

        let lineCount = await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight)
        })

        return (await page.$$('div[class="tr site-listing"]')).length;
    },


    getDetails: async (lineBaseSelector) => {

        let url = await page.url();

        await page.waitForSelector(lineBaseSelector);

        let details = await page.evaluate(() => {
            return {
                rank: document.querySelector('div[class="td"]').innerText,
                name: document.querySelector('p > a').innerText,
                url: document.querySelector('p > a').getAttribute('href')
            }
        });

        return details;

    },

    // #alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-content.summary.padding20 > span > span > div > div > div > div:nth-child(2)
    // #alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-content.summary.padding20 > span > span > div > div > div > div:nth-child(2) > div:nth-child(1)
    // #alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-content.summary.padding20 > span > span > div > div > div > div:nth-child(2) > div.td.DescriptionCell > p > a

    end: async () => {
        await browser.close();
    }

};


module.exports = global;
const puppeteer = require('puppeteer');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
var path = require('path');
const global = require('./global');
// require('events').EventEmitter.setMaxListeners = 15;
// request.setMaxListeners(0);

const BASE_URL = 'https://www.alexa.com/topsites/countries';

let browser = null;
let page = null;

const country = {

    initialize: async () => {

        browser = await puppeteer.launch({
            headless: true
        });

        page = await browser.newPage();

        await page.setDefaultNavigationTimeout(0);

        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    },

    count: async () => {

        try {

            let items = [];

            let line = await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight)
            })

            let column = await page.evaluate(() => {
                window.scrollBy(0, window.innerWidth)
            })


            return [(await page.$$('ul:nth-child(1) > li')).length, (await page.$$('div:nth-child(1) > ul')).length];

        } catch (error) {
            console.log(error)
        }
    },

    getDetails: async (lineBaseSelector) => {
        try {

            let url = await page.url();

            function parseUrl(url) {
                var a = document.createElement('a');
                a.href = url;
                return a;
            }

            const details = await page.evaluate((x) => {
                const data = {
                    cc: document.querySelector(`${x}`).getAttribute('href').toLowerCase().toString().split("/")[1],
                    name: document.querySelector(`${x}`).innerText.toLowerCase(),
                    url: document.querySelector(`${x}`).getAttribute('href'),
                    last_update: Date.now()
                }
                return Promise.resolve(data);
            }, lineBaseSelector);

            return details;

        } catch (error) {
            console.log(error)
        }
    },

    jsToJSON: async (data) => {

        try {

            let url = await page.url();

            const cc = data.cc;

            var _path = path.join(__dirname, `./alexadata/${cc}`);

            if (!fs.existsSync("alexadata")) {

                fs.mkdir("./alexadata", (err) => {
                    fs.mkdir(`./alexadata/${cc}`, (err) => {
                        if (err) return err;

                        fs.writeFileSync(path.join(_path, './sites.json'), JSON.stringify(data), 'utf-8', (err) => {
                            if (err) return err;

                        });

                    });
                });
            } else {
                if (!fs.existsSync(`./alexadata/${cc}`)) {

                    fs.mkdir(`./alexadata/${cc}`, (err) => {
                        if (err) return err;

                        fs.writeFileSync(path.join(_path, './sites.json'), JSON.stringify(data), 'utf-8', (err) => {
                            if (err) return err;

                        });
                    });
                }
            }

        } catch (error) {
            console.log(error)
        }
    },

    getContentCountry: async (countryData) => {

        for (let i = 0; i <= countryData.length; i++) {

            let link = countryData[i].url;
            let url = 'https://www.alexa.com/topsites/' + link;

            browser = await puppeteer.launch({ headless: true });
            page = await browser.newPage();
            await page.goto(url, {timeout : 0});
            // await page.setDefaultNavigationTimeout(0);

            let itemCount = await global.count();
            await global.timeToWaitRandomly();
            let globalData = [];
            let childNum = null;
            let lineBaseSelector = null;

            for (let i = 1; i <= itemCount; i++) {
                childNum = i + 1;
                lineBaseSelector = '#alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-content.summary.padding20 > span > span > div > div > div > div:nth-child(' + `${childNum}` + ')';
                let details = await global.getDetails(lineBaseSelector);
                globalData.push(details);
            }

            const content = await page.evaluate((x, y) => {
                const data = {
                    cc: x.cc,
                    lastupdate: Date.now(),
                    ranking: y
                }
                return Promise.resolve(data);
            }, countryData[i], globalData);

            process.setMaxListeners(0);

            await global.timeToWaitRandomly();
            country.jsToJSON(content);
            // debugger;
            await global.timeToWaitRandomly();
        }
    },

    end: async () => {
        await browser.close();
    }

};

module.exports = country;
const puppeteer = require('puppeteer');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
var path = require('path')

const BASE_URL = 'https://www.alexa.com/topsites';

let browser = null;
let page = null;

const global = {

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

            let lineCount = await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight)
            })

            return (await page.$$('div[class="tr site-listing"]')).length;

        } catch (error) {
            console.log(error)
        }
    },

    getDetails: async (lineBaseSelector) => {
        try {

            let url = await page.url();

            const details = await page.evaluate((x) => {
                const data = {
                    rank: document.querySelector(`${x} > div:nth-child(1)`).innerText,
                    name: document.querySelector(`${x} > div.td.DescriptionCell > p > a`).innerText.toLowerCase(),
                    url: document.querySelector(`${x} > div.td.DescriptionCell > p > a`).getAttribute('href'),
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

            const cc = await page.evaluate(() => {
                return {
                    cc: document.querySelector('#alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-top > div > section > div.Foldering > div.each.current > a').innerText.toLowerCase()
                }
            });

            var _path = path.join(__dirname, `./alexadata/${cc.cc}`);

            if (!fs.existsSync("alexadata")) {

                fs.mkdir("./alexadata", (err) => {
                    fs.mkdir(`./alexadata/${cc.cc}`, (err) => {
                        if (err) return err;

                        fs.writeFileSync(path.join(_path, './sites.json'), JSON.stringify(data), 'utf-8', (err) => {
                            if (err) return err;

                        });

                    });
                });
            } else {

                fs.mkdir(`./alexadata/${cc.cc}`, (err) => {
                    if (err) return err;

                    fs.writeFileSync(path.join(_path, './sites.json'), JSON.stringify(data), 'utf-8', (err) => {
                        if (err) return err;

                    });
                });
            }

        } catch (error) {
            console.log(error)
        }
    },

    timeToWaitRandomly: async () => {
        let milisec = Math.floor(Math.random() * 3500) + 1000;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.waitForTimeout(milisec);
    },

    end: async () => {
        await browser.close();
    }

};

module.exports = global;
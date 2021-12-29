const puppeteer = require('puppeteer');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
var path = require('path')

const BASE_URL_G = 'https://www.alexa.com/topsites';
const BASE_URL_C = 'https://www.alexa.com/topsites/countries';

let browser = null;
let page = null;

const oeprations = {

    initialize: async (option) => {

        browser = await puppeteer.launch({
            headless: true
        });

        page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);

        if (option == 'global') {
            await page.goto(BASE_URL_G, { waitUntil: 'networkidle2' });
        }
        if (option == 'country') {
            await page.goto(BASE_URL_C, { waitUntil: 'networkidle2' });
        }
    },

    count: async (option) => {

        try {

            let line = await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight)
            })

            let column = await page.evaluate(() => {
                window.scrollBy(0, window.innerWidth)
            })

            if (option == 'global') {
                return (await page.$$('div[class="tr site-listing"]')).length;
            }
            if (option == 'country') {
                return [(await page.$$('ul:nth-child(1) > li')).length, (await page.$$('div:nth-child(1) > ul')).length];
            }

        } catch (error) {
            console.log(error)
        }
    },

    getDetails: async (option, lineBaseSelector) => {
        try {

            if (option == 'global') {
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
            }
            if (option == 'country') {
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
            }
            
        } catch (error) {
            console.log(error)
        }
    },

    jsToJSON: async (option, data) => {

        try {

            if (option == 'global') {

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
            }
            if (option == 'country') {

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

    getContentCountry: async (countryData) => {

        for (let i = 0; i <= countryData.length; i++) {

            let link = countryData[i].url;
            let url = 'https://www.alexa.com/topsites/' + link;

            browser = await puppeteer.launch({ headless: true });
            page = await browser.newPage();
            await page.goto(url, {timeout : 0});

            let itemCount = await oeprations.count('global');
            await oeprations.timeToWaitRandomly();
            let globalData = [];
            let childNum = null;
            let lineBaseSelector = null;

            for (let i = 1; i <= itemCount; i++) {
                childNum = i + 1;
                lineBaseSelector = '#alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-content.summary.padding20 > span > span > div > div > div > div:nth-child(' + `${childNum}` + ')';
                let details = await oeprations.getDetails('global',lineBaseSelector);
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

            await oeprations.timeToWaitRandomly();
            oeprations.jsToJSON('country',content);
            await oeprations.timeToWaitRandomly();
        }
    },

    end: async () => {
        await browser.close();
    }
};

module.exports = oeprations;
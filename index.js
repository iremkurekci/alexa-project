const puppeteer = require('puppeteer');
const global = require('./global');
// const Json2csvParser = require('json2csv').Parser;
// const fs = require('fs');

try {
    (async () => {

        await global.initialize();

        let lineCount = await global.count();
        let globalData = [];
        let childNum = null;
        let lineBaseSelector = null;
         

        for(let i = 1; i <= lineCount; i++)
        {
            childNum = i + 1;
            lineBaseSelector = '#alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-content.summary.padding20 > span > span > div > div > div > div:nth-child(' + `${childNum}` + ')';
            let details = await global.getDetails(lineBaseSelector);
            globalData.push(details);
        }

        debugger;

        // await browser.close();

    })();

} catch (error) {
    console.log(error);
}

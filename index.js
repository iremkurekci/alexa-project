const puppeteer = require('puppeteer');
const global = require('./global');
const country = require('./country');

try {
    (async () => {

        await global.initialize();

        let itemCount_Global = await global.count();
        let globalData = [];
        let childNum_Global = null;
        let lineBaseSelector_Global = null;


        for (let i = 1; i <= itemCount_Global; i++) {
            childNum_Global = i + 1;
            lineBaseSelector_Global = '#alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-content.summary.padding20 > span > span > div > div > div > div:nth-child(' + `${childNum_Global}` + ')';
            let detailsGlobal = await global.getDetails(lineBaseSelector_Global);
            globalData.push(detailsGlobal);
        }

        global.jsToJSON(globalData);

        const puppeteer = require('puppeteer');

        await global.timeToWaitRandomly();

        await country.initialize();

        let itemCount_Country = await country.count(); // [li,ul]
        let countryData = [];
        let ul_ChildNum_Country = null;
        let li_ChildNum_Country = null;
        let lineBaseSelector_Country = null;

        for (let j = 1; j <= itemCount_Country[1]; j++) {
            for (let i = 1; i <= itemCount_Country[0]; i++) {

                li_ChildNum_Country = i;
                ul_ChildNum_Country = j;
                lineBaseSelector_Country = '#alx-content > div.row-fluid.TopSites.Alexarest > section.page-product-content.summary > span > span > div > div > div > div:nth-child(1) > ul:nth-child(' + `${ul_ChildNum_Country}` + ') > li:nth-child(' + `${li_ChildNum_Country}` + ') > a';
                let detailsCountry = await country.getDetails(lineBaseSelector_Country);
                countryData.push(detailsCountry);
            }
        }

        await global.timeToWaitRandomly();
        await country.getContentCountry(countryData);
        // await countryData.map(item => country.getContentCountry(item));

        debugger;

        // await browser.close();

    })();

} catch (error) {
    console.log(error);
}

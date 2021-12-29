const operations = require('./operations');

try {
    (async () => {

        await operations.initialize('global');

        let itemCount_Global = await operations.count('global');
        let globalData = [];
        let childNum_Global = null;
        let lineBaseSelector_Global = null;


        for (let i = 1; i <= itemCount_Global; i++) {
            childNum_Global = i + 1;
            lineBaseSelector_Global = '#alx-content > div.row-fluid.TopSites.AlexaTool.padding20 > section.page-product-content.summary.padding20 > span > span > div > div > div > div:nth-child(' + `${childNum_Global}` + ')';
            let detailsGlobal = await operations.getDetails('global',lineBaseSelector_Global);
            globalData.push(detailsGlobal);
        }

        operations.jsToJSON('global',globalData);

        await operations.timeToWaitRandomly();

        await operations.initialize('country');

        let itemCount_Country = await operations.count('country'); // [li,ul]
        let countryData = [];
        let ul_ChildNum_Country = null;
        let li_ChildNum_Country = null;
        let lineBaseSelector_Country = null;

        for (let j = 1; j <= itemCount_Country[1]; j++) {
            for (let i = 1; i <= itemCount_Country[0]; i++) {

                li_ChildNum_Country = i;
                ul_ChildNum_Country = j;
                lineBaseSelector_Country = '#alx-content > div.row-fluid.TopSites.Alexarest > section.page-product-content.summary > span > span > div > div > div > div:nth-child(1) > ul:nth-child(' + `${ul_ChildNum_Country}` + ') > li:nth-child(' + `${li_ChildNum_Country}` + ') > a';
                let detailsCountry = await operations.getDetails('country',lineBaseSelector_Country);
                countryData.push(detailsCountry);
            }
        }

        await operations.timeToWaitRandomly();
        await operations.getContentCountry(countryData);

        await browser.close();

    })();

} catch (error) {
    console.log(error);
}

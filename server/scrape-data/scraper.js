module.exports.scrapeTour = (browser, url) => new Promise(async (resolve, reject) => {
  try {
    let page = await browser.newPage();
    console.log('>> Mở tab mới ...');

    await page.goto(url);
    console.log("Truy cập vào trang " + url);

    await page.waitForSelector(".find-tour-content__list--main");
    console.log('>> Website đã load xong...');


    const dataTour = await page.$$eval(".find-tour-content__list--main .card-filter-desktop", els => {
      dataTour = els.map(el => {
        const titleEl = el.querySelector(".card-filter-desktop__content .card-filter-desktop__content--header-wrapper a");
        const imageEl = el.querySelector(".card-filter-desktop__thumbnail img");
        const tourCodeEl = el.querySelector(".card-filter-desktop__content .info-tour-tourCode p");
        const items = Array.from(el.querySelectorAll(".info-tour-dayStayText p")).map(item => item.textContent.trim());;
        const transportation = items[1];
        const dayStay = items[0];
        const tourDepartureEl = el.querySelector(".card-filter-desktop__content--info-tour .info-tour-departure p");
        const timeStart = Array.from(el.querySelectorAll(".card-filter-desktop__content--info-tour .info-tour-calendar .list-item__container .list-item a")).map(item => item.textContent.trim()).toString();
        const priceString = el.querySelector(".card-filter-desktop__content--price .card-filter-desktop__content--price-newPrice p").textContent;
        let priceInt = parseInt(priceString.replace(/[₫\s.]/g, ''), 10);

        return {
          title: titleEl ? titleEl.title : "no data",
          code: tourCodeEl ? tourCodeEl.textContent : "no data",
          image: imageEl ? imageEl.src : "no data",
          price: priceInt,
          transportation: transportation ? transportation : "no data",
          timeStart: timeStart,
          dayStay: dayStay,
          departure: tourDepartureEl ? tourDepartureEl.textContent : "no data",
        };
      })
      return dataTour;
    });
    await page.close();
    console.log('>> Tab đã đóng.');
    resolve(dataTour);

  } catch (error) {
    console.log("Lỗi ở hàm scrape tour : " + error)
    reject(error)
  }
});


module.exports.scrapeCategories = (browser, url) => new Promise(async (resolve, reject) => {
  try {
    let page = await browser.newPage();
    console.log('>> Mở tab mới ...');

    await page.goto(url);
    console.log("Truy cập vào trang " + url);

    await page.waitForSelector(".home-banner-section__container--buttonGroup");
    console.log('>> Website đã load xong...');

    const dataCategories = await page.$$eval(".home-banner-section__container--buttonGroup .home-banner-section__container--buttonGroup--button", els => {
      dataCategories = els.map(el => {
        const title = el.querySelector("button img").alt;
        return {
          title: title,
        };
      })
      return dataCategories;
    });
    await page.close();
    console.log('>> Tab đã đóng.');
    resolve(dataCategories);

  } catch (error) {
    console.log("Lỗi ở hàm scrape category : " + error)
    reject(error)
  }
})
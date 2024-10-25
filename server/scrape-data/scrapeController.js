const Category = require("../models/category.model");
const Tour = require("../models/tour.model");
const TourCategory = require("../models/tour-category.model");
const sequelize = require("../config/database");
const {
  QueryTypes
} = require("sequelize")
const scrapers = require("./scraper");


const scrapeController = async (browserInstance) => {
  const transaction = await sequelize.transaction();

  try {
    let browser = await browserInstance;
    // const urlCategory = "https://travel.com.vn";

    // let dataCategories = await scrapers.scrapeCategories(browser, urlCategory);
    // await Category.sync();
    // console.log(dataCategories);
    // await Category.bulkCreate(dataCategories, {
    //   transaction
    // });
    // console.log('Dữ liệu Category đã được nạp thành công vào cơ sở dữ liệu!');


    const categories = await sequelize.query('SELECT id, slug FROM Categories', {
      type: QueryTypes.SELECT
    });
    await Promise.all(categories.map(async (category) => {
      const categoryId = category.id;
      const url = category.slug;
      let dataTours = await scrapers.scrapeTour(browser, url);

      if (dataTours && dataTours.length > 0) {
        const createdTours = await Tour.bulkCreate(dataTours, {
          transaction,
          ignoreDuplicates: true
        });
        if (createdTours.length > 0) {
          console.log('Dữ liệu Tour đã được nạp thành công vào cơ sở dữ liệu!');

          const tourCategories = createdTours.map(tour => ({
            tour_id: tour.id,
            category_id: categoryId
          }));

          await TourCategory.bulkCreate(tourCategories, {
            transaction
          });
          console.log('Dữ liệu TourCategory đã được nạp thành công vào cơ sở dữ liệu!');
        } else {
          console.log('Không có tour nào được thêm vào.');
        }
        // console.log('Dữ liệu Tour đã được nạp thành công vào cơ sở dữ liệu!');

        // const tourCategories = createdTours.map(tour => ({
        //   tour_id: tour.id,
        //   category_id: categoryId
        // }));

        // await TourCategory.bulkCreate(tourCategories, {
        //   transaction
        // });
        // console.log('Dữ liệu TourCategory đã được nạp thành công vào cơ sở dữ liệu!');
      } else {
        console.log(`Không có tour nào cho danh mục ${categoryId}`);
      }
    }));

    await transaction.commit();

  } catch (error) {
    console.log("Lỗi ở scrape controller " + error);
    await transaction.rollback();
  }

}

module.exports = scrapeController;
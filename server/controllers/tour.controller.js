const Tour = require("../models/tour.model")
const sequelize = require("../config/database");
const {
  QueryTypes
} = require("sequelize");
const convertToDate = require("../helpers/convertToDate");

// [GET] /tours/
module.exports.index = async (req, res) => {
  const tour = await sequelize.query('SELECT * FROM `tours`', {
    type: QueryTypes.SELECT,
  });
  console.log(tour);
}

// [GET] /:slugCategory
module.exports.category = async (req, res) => {
  const slugCategory = req.params.slugCategory;
  var priceQuery = `tours.price >= 0`;
  if (req.query.budgetId) {
    const budgetId = parseInt(req.query.budgetId)
    switch (budgetId) {
      case 1:
        priceQuery = `tours.price < 5000000`;
        break;
      case 2:
        priceQuery = `  tours.price >= 5000000
                      AND tours.price < 10000000`;
        break;
      case 3:
        priceQuery = `tours.price >= 10000000
                      AND tours.price < 20000000`;
        break;
      case 4:
        priceQuery = `tours.price >= 20000000`;
        break;
      default:
        priceQuery = `tours.price >= 0`
        break;
    }
  }
  console.log(priceQuery)

  const query = `
    SELECT tours.*
    FROM tours
    JOIN tours_categories ON tours.id = tours_categories.tour_id
    JOIN categories ON tours_categories.category_id = categories.id
    WHERE
      categories.slug = :slugCategory
      AND categories.deleted = false
      AND categories.status = 1
      AND tours.deleted = false
      AND tours.status = 1
      AND ${priceQuery}
    `;

  const tours = await sequelize.query(query, {
    replacements: {
      slugCategory
    },
    type: QueryTypes.SELECT
  });

  const today = new Date();
  for (const tour of tours) {
    const arrTimeStart = convertToDate(tour.timeStart);
    tour.timeStart = arrTimeStart.filter(day => day >= today);
  }

  res.json({
    status: 200,
    tours: tours
  })
}
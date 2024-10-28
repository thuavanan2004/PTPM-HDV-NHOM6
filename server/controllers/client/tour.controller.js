const Tour = require("../../models/tour.model")
const sequelize = require("../../config/database");
const {
  Op
} = require("sequelize")
const {
  QueryTypes
} = require("sequelize");
const convertToDate = require("../../helpers/convertToDate");
const Schedule = require("../../models/schedule.model");
const Image = require("../../models/image.model");
const TourDetail = require("../../models/tour-detail.model");
const Information = require("../../models/information.model");
const Departure = require("../../models/departure.model");
const Destination = require("../../models/destination.model");

// [GET] /tours/
module.exports.index = async (req, res) => {
  const tour = await sequelize.query('SELECT * FROM `tours`', {
    type: QueryTypes.SELECT,
  });
  console.log(tour);
}

// [GET] /tours/detail/:slug
module.exports.detail = async (req, res) => {
  const slug = req.params.slug;
  try {
    const tour = await Tour.findOne({
      where: {
        slug: slug
      },
      attributes: {
        exclude: ['deletedAt', 'createdAt', 'updatedAt', 'deleted', 'deletedBy', 'updatedBy']
      }
    });

    const [tourDetail, schedules, images, information, departure, destination] = await Promise.all([
      TourDetail.findAll({
        where: {
          tourId: tour.id
        },
        attributes: {
          exclude: ['id', 'tourId', 'createdAt', 'updatedAt']
        }
      }),
      Schedule.findAll({
        where: {
          tourId: tour.id
        },
        attributes: ['day', 'title', 'information']
      }),
      Image.findAll({
        where: {
          tourId: tour.id
        },
        attributes: ['name', 'source']
      }),
      Information.findOne({
        where: {
          tourId: tour.id
        },
        attributes: {
          exclude: ['id', 'tourId', 'createdAt', 'updatedAt']
        }
      }),
      Departure.findOne({
        where: {
          id: tour.departureId
        },
        attributes: ['title']
      }),
      Destination.findOne({
        where: {
          id: tour.destinationId
        },
        attributes: ['title']
      })
    ]);


    const tourData = tour.get({
      plain: true
    });
    tourData.schedule = schedules;
    tourData.images = images;
    tourData.tourDetail = tourDetail;
    tourData.information = information;
    tourData.departure = departure.title;
    tourData.destination = destination.title;

    if (!tour) {
      return res.status(404).json({
        error: "Tour không tìm thấy"
      });
    }

    res.json({
      status: 200,
      tour: tourData
    });
  } catch (error) {
    console.error("Error fetching tour details:", error);
    res.status(500).json({
      error: "Lỗi khi lấy chi tiết tour"
    });
  }
}

// [GET] /:slug
module.exports.getTour = async (req, res) => {
  const slug = req.params.slug;
  const {
    budgetId,
    departureFrom,
    fromDate,
    transTypeId
  } = req.query;

  try {
    var priceQuery = `tours.price >= 0`;
    if (budgetId) {
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
    // console.log(priceQuery)

    var departureQuery = '';
    if (departureFrom) {
      departureQuery = `AND departureId=${departureFrom}`
    }

    var dayQuery = '';
    if (fromDate) {
      const [year, month, day] = fromDate.split("-");
      const dayFormat = new Date(year, month - 1, day);
      const formattedDate = dayFormat.toISOString().slice(0, 19).replace('T', ' ');
      dayQuery = `AND tour_detail.dayStart > '${formattedDate}'`
    }

    var transportationQuery = '';
    if (transTypeId) {
      transportationQuery = `AND transportationId=${transTypeId}`
    }

    // Kiểm tra nếu slug là của category
    const categoryCheck = await sequelize.query(`SELECT * FROM categories WHERE slug = :slug`, {
      replacements: {
        slug
      },
      type: QueryTypes.SELECT
    });

    if (categoryCheck.length > 0) {
      var categoryQuery = `categories.slug = :slug`;
    } else {
      // Nếu không phải category, kiểm tra xem có phải là departure không
      const destinationCheck = await sequelize.query(`SELECT * FROM destination WHERE slug = :slug`, {
        replacements: {
          slug
        },
        type: QueryTypes.SELECT
      });
      if (destinationCheck.length > 0) {
        var destinationQuery = `destination.slug = :slug AND destination.deleted = false`;
      }
    }

    const dayFormat = new Date();
    const formattedDate = dayFormat.toISOString().slice(0, 19).replace('T', ' ');

    const query = `
    SELECT tours.*
    FROM tours
    JOIN tours_categories ON tours.id = tours_categories.tourId
    JOIN categories ON tours_categories.categoryId = categories.id
    JOIN destination ON tours.destinationId = destination.id
    JOIN tour_detail ON tour_detail.tourId = tours.id
    WHERE
      ${categoryQuery ? categoryQuery : ""} ${destinationQuery}
      AND categories.deleted = false
      AND categories.status = 1
      AND tours.deleted = false
      AND tours.status = 1
      AND DATEDIFF(tour_detail.dayStart, '${formattedDate}') >= 0
      AND ${priceQuery}
      ${departureQuery}
      ${transportationQuery} 
      ${dayQuery}
    `;

    const tours = await sequelize.query(query, {
      replacements: {
        slug
      },
      type: QueryTypes.SELECT
    });


    res.json({
      status: 200,
      tours: tours
    });
  } catch (error) {
    console.error("Error fetching category tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu"
    });
  }
}

// [GET] /tours/feature
module.exports.feature = async (req, res) => {
  try {
    const tours = await Tour.findAll({
      where: {
        isFeatured: true
      },
      attributes: {
        exclude: ['deletedAt', 'createdAt', 'updatedAt', 'deleted', 'deletedBy', 'updatedBy']
      }
    });
    const tourData = await Promise.all(tours.map(async (tour) => {
      const tourObj = tour.get({
        plain: true
      });

      const departure = await Departure.findOne({
        where: {
          id: tour.departureId
        },
        attributes: ['title']
      });

      const tourDetail = await TourDetail.findOne({
        where: {
          tourId: tour.id
        },
        attributes: ['dayStart', 'dayReturn', 'stock']
      })

      tourObj.departure = departure;
      tourObj.tourDetail = tourDetail;

      return tourObj;
    }))

    if (tourData.length == 0) {
      return res.status(404).json({
        error: "Tour không tìm thấy"
      });
    }

    res.json({
      status: 200,
      tours: tourData
    })
  } catch (error) {
    console.error("Error fetching category tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu"
    });
  }
}

// [GET] /tours/flash-sale
module.exports.flashSale = async (req, res) => {
  try {
    const dayFormat = new Date();
    const formattedDate = dayFormat.toISOString().slice(0, 19).replace('T', ' ');

    var query = `
      SELECT  
        tours.id, tours.code, tours.title, tours.price, tours.slug,
        tour_detail.dayStart, tour_detail.dayReturn, tour_detail.stock, destination.title as destination
      FROM tours
      JOIN tour_detail ON tours.id = tour_detail.tourId
      JOIN destination ON destination.id = tours.destinationId
      WHERE 
        tours.deleted = FALSE
        AND status = TRUE
        AND DATEDIFF(tour_detail.dayStart, '${formattedDate}') <= 5
        AND DATEDIFF(tour_detail.dayStart, '${formattedDate}') >= 0
      GROUP BY tours.id
    `;

    const tours = await sequelize.query(query, QueryTypes.SELECT);

    if (tours.length === 0) {
      return res.status(404).json({
        error: "Tour không tìm thấy"
      });
    }

    const uniqueTours = tours.filter((tour, index, self) =>
      index === self.findIndex((t) => (
        t.id === tour.id
      ))
    );

    res.json({
      status: 200,
      tours: uniqueTours[0]
    });
  } catch (error) {
    console.error("Error fetching category tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu"
    });
  }
}
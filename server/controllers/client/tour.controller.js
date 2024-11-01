const Tour = require("../../models/tour.model")
const sequelize = require("../../config/database");
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
const Favorite = require("../../models/favorite.model");
const unidecode = require("unidecode");
const transformeDataHelper = require("../../helpers/transformeData");

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
    SELECT tours.title, tours.code, tours.slug, tours.price, tours.image, tour_detail.dayStart, tour_detail.dayReturn, 
    destination.title as destination, transportation.title as transportation
    FROM tours
    JOIN tours_categories ON tours.id = tours_categories.tourId
    JOIN categories ON tours_categories.categoryId = categories.id
    JOIN destination ON tours.destinationId = destination.id
    JOIN transportation ON transportation.id = tours.transportationId
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

    const transformedData = transformeDataHelper.transformeData(tours);


    if (transformedData.length === 0) {
      return res.status(404).json({
        message: 'Không tìm thấy tour nào.'
      });
    }

    res.status(200).json(transformedData);
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

// [POST] /tours/favorites 
module.exports.addTourfavorites = async (req, res) => {
  const userId = res.locals.userId;
  const tourId = req.body.tourId;

  try {
    const favoriteExists = await Favorite.findOne({
      where: {
        userId: userId,
        tourId: tourId
      }
    });

    if (favoriteExists) {
      return res.status(400).json("Tour đã nằm trong danh sách yêu thích");
    }

    await Favorite.create({
      userId: userId,
      tourId: tourId
    });

    return res.status(201).json({
      message: 'Đã thêm tour vào danh sách yêu thích.'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi thêm vào danh sách yêu thích.'
    });
  }
};


// [DELETE] /tours/favorites 
module.exports.deleteTourFavorites = async (req, res) => {
  const userId = res.locals.userId;
  const tourId = req.body.tourId;

  try {
    const favorite = await Favorite.findOne({
      where: {
        userId: userId,
        tourId: tourId
      }
    });

    if (!favorite) {
      return res.status(400).json("Tour không nằm trong danh sách yêu thích.");
    }

    await favorite.destroy();

    return res.status(201).json({
      message: 'Đã xóa tour khỏi danh sách yêu thích.'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi xóa tour khỏi danh sách yêu thích.'
    });
  }
};

// [GET] /api/tours/favorites
module.exports.getTourFavorites = async (req, res) => {
  const userId = res.locals.userId;

  try {
    const query = `
      SELECT tours.title, tours.code, tours.slug, tours.price, tours.image, tour_detail.dayStart, tour_detail.dayReturn, destination.title as destination, transportation.title as transportation
      FROM favorites
      JOIN tours ON tours.id = favorites.tourId
      JOIN tour_detail ON tour_detail.tourId = tours.id
      JOIN destination ON destination.id = tours.destinationId
      JOIN transportation ON transportation.id = tours.transportationId
      WHERE 
        favorites.userId = :userId
        AND tour_detail.dayStart >= CURDATE()
    `;

    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: {
        userId
      }
    });

    if (tours.length === 0) {
      return res.status(404).json({
        message: 'Không tìm thấy tour yêu thích nào.'
      });
    }

    const transformedData = transformeDataHelper.transformeData(tours);

    return res.status(200).json(transformedData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách tour yêu thích.'
    });
  }
}

// [GET] /api/tours/search
module.exports.search = async (req, res) => {
  const {
    title,
    fromDate,
    budgetId
  } = req.query;

  let query = `
    SELECT tours.title, tours.code, tours.slug, tours.price, tours.image, tour_detail.dayStart, tour_detail.dayReturn, 
    destination.title as destination, transportation.title as transportation
    FROM tours 
    JOIN tour_detail ON tour_detail.tourId = tours.id
    JOIN destination ON destination.id = tours.destinationId
    JOIN transportation ON transportation.id = tours.transportationId
    WHERE 
      tour_detail.dayStart >= CURDATE()
      AND tours.deleted = false
      AND tours.status = 1
  `;

  const replacements = {};

  // Tìm kiếm theo tiêu đề
  if (title) {
    const titleUnidecode = unidecode(title);
    const titleSlug = titleUnidecode.replace(/\s+/g, "-");
    const titleRegex = `%${titleSlug}%`;
    query += " AND tours.slug LIKE :titleSlug";
    replacements.titleSlug = titleRegex;
  }

  // Tìm kiếm theo ngày bắt đầu
  if (fromDate) {
    query += " AND tour_detail.dayStart >= :fromDate";
    replacements.fromDate = fromDate;
  }

  // Tìm kiếm theo ngân sách
  if (budgetId) {
    const key = parseInt(budgetId);
    switch (key) {
      case 1:
        query += ` AND tours.price < 5000000`;
        break;
      case 2:
        query += ` AND tours.price >= 5000000 AND tours.price < 10000000`;
        break;
      case 3:
        query += ` AND tours.price >= 10000000 AND tours.price < 20000000`;
        break;
      case 4:
        query += ` AND tours.price >= 20000000`;
        break;
      default:
        query += ` AND tours.price >= 0`;
        break;
    }
  }

  try {
    // Gọi truy vấn cơ sở dữ liệu và chờ kết quả
    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });

    const transformedData = transformeDataHelper.transformeData(tours);

    if (transformedData.length === 0) {
      return res.status(404).json({
        message: 'Không tìm thấy tour nào.'
      });
    }

    res.status(200).json(transformedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Có lỗi xảy ra khi tìm kiếm tour.'
    });
  }
}
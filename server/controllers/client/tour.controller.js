const Tour = require("../../models/tour.model")
const sequelize = require("../../config/database");
const {
  QueryTypes
} = require("sequelize");
const Schedule = require("../../models/schedule.model");
const Image = require("../../models/image.model");
const TourDetail = require("../../models/tour-detail.model");
const Information = require("../../models/information.model");
const Departure = require("../../models/departure.model");
const Destination = require("../../models/destination.model");
const Favorite = require("../../models/favorite.model");
const unidecode = require("unidecode");
const transformeDataHelper = require("../../helpers/transformeData");
const Transportation = require("../../models/transportation.model");

// [GET] /tours/
module.exports.index = async (req, res) => {
  const tour = await sequelize.query('SELECT * FROM `tours`', {
    type: QueryTypes.SELECT,
  });
  console.log(tour);
}

/**
 * @swagger
 * /tours/detail/{slug}:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy chi tiết tour
 *     description: Trả về thông tin chi tiết của tour dựa trên slug.
 *     operationId: getTourDetail
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         description: Slug của tour để lấy thông tin chi tiết.
 *         schema:
 *           type: string
 *           example: tour-tet-2024
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 tour:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Tour Tết 2024
 *                     schedule:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             example: "Ngày 1"
 *                           title:
 *                             type: string
 *                             example: "Khởi hành từ Hà Nội"
 *                           information:
 *                             type: string
 *                             example: "Điểm dừng chân tại Hải Phòng"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "image1.jpg"
 *                           source:
 *                             type: string
 *                             example: "https://example.com/images/image1.jpg"
 *                     tourDetail:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Chi tiết tour"
 *                           content:
 *                             type: string
 *                             example: "Tour sẽ diễn ra từ ngày 1 đến ngày 7 tháng 1 năm 2024."
 *                     information:
 *                       type: object
 *                       properties:
 *                         details:
 *                           type: string
 *                           example: "Thông tin thêm về tour."
 *                     departure:
 *                       type: string
 *                       example: "Hà Nội"
 *                     destination:
 *                       type: string
 *                       example: "Đà Nẵng"
 *       404:
 *         description: Tour không tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tour không tìm thấy"
 *       500:
 *         description: Có lỗi xảy ra khi lấy thông tin tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Lỗi khi lấy chi tiết tour"
 */

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
    if (!tour) {
      return res.status(400).json("Tour không tồn tại!")
    }

    const [tourDetail, schedules, images, information, departure, destination, transportation] = await Promise.all([
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
      }),
      Transportation.findOne({
        where: {
          id: tour.transportationId
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
    tourData.transportation = transportation.title;

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


/**
 * @swagger
 * /tours/{slug}:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy danh sách tour theo slug
 *     description: Trả về danh sách tour dựa trên slug và các bộ lọc như ngân sách, điểm khởi hành, ngày bắt đầu và loại phương tiện.
 *     operationId: getToursBySlug
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         description: Slug của category hoặc điểm đến để lấy danh sách tour.
 *         schema:
 *           type: string
 *           example: category-family
 *       - name: budgetId
 *         in: query
 *         required: false
 *         description: ID ngân sách để lọc tour theo mức giá.
 *         schema:
 *           type: integer
 *           example: 2
 *       - name: departureFrom
 *         in: query
 *         required: false
 *         description: ID điểm khởi hành để lọc tour.
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: fromDate
 *         in: query
 *         required: false
 *         description: Ngày bắt đầu để lọc tour (định dạng YYYY-MM-DD).
 *         schema:
 *           type: string
 *           example: "2024-01-01"
 *       - name: transTypeId
 *         in: query
 *         required: false
 *         description: ID loại phương tiện để lọc tour.
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Danh sách tour phù hợp với các bộ lọc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Tour Gia Đình"
 *                   code:
 *                     type: string
 *                     example: "TG01"
 *                   slug:
 *                     type: string
 *                     example: "tour-gia-dinh"
 *                   price:
 *                     type: integer
 *                     example: 7500000
 *                   image:
 *                     type: string
 *                     example: "https://example.com/images/tour-gia-dinh.jpg"
 *                   dayStart:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-01"
 *                   dayReturn:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-07"
 *                   destination:
 *                     type: string
 *                     example: "Đà Nẵng"
 *                   transportation:
 *                     type: string
 *                     example: "Máy bay"
 *       404:
 *         description: Không tìm thấy tour nào
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy tour nào."
 *       500:
 *         description: Có lỗi xảy ra khi lấy danh sách tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Lỗi lấy dữ liệu"
 */

// [GET] /:slug
module.exports.getTour = async (req, res) => {
  const slug = req.params.slug;
  const {
    budgetId,
    departureFrom,
    fromDate,
    transTypeId,
    text
  } = req.query;

  try {
    let replacements = {
      slug: slug
    };
    var priceQuery = `tour_detail.adultPrice >= 0`;
    if (budgetId) {
      switch (budgetId) {
        case 1:
          priceQuery = `tour_detail.adultPrice < 5000000`;
          break;
        case 2:
          priceQuery = `  tour_detail.adultPrice >= 5000000
                      AND tour_detail.adultPrice < 10000000`;
          break;
        case 3:
          priceQuery = `tour_detail.adultPrice >= 10000000
                      AND tour_detail.adultPrice < 20000000`;
          break;
        case 4:
          priceQuery = `tour_detail.adultPrice >= 20000000`;
          break;
        default:
          priceQuery = `tour_detail.adultPrice >= 0`
          break;
      }
    }
    // console.log(priceQuery)

    var searchQuery = '';
    if (text) {
      const textUnidecode = unidecode(text);
      const textSlug = textUnidecode.replace(/\s+/g, "-");
      const textRegex = `%${textSlug}%`;
      searchQuery = "AND tours.slug LIKE :titleSlug";
      replacements.titleSlug = textRegex;
    }

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
      const destinationTreeQuery = `
        WITH RECURSIVE DestinationTree AS (
          SELECT id, parentId, title, slug
          FROM destination
          WHERE slug = :slug 
          UNION ALL
          SELECT d.id, d.parentId, d.title, d.slug
          FROM destination d
          INNER JOIN DestinationTree dt ON d.parentId = dt.id
        )
        SELECT id
        FROM DestinationTree
        WHERE NOT EXISTS (
            SELECT 1
            FROM destination
            WHERE parentId = DestinationTree.id
        )
      `;

      const destinationIds = await sequelize.query(destinationTreeQuery, {
        replacements: {
          slug
        },
        type: QueryTypes.SELECT
      });

      // Tạo danh sách ID của các điểm đến cuối cùng
      const destinationIdList = destinationIds.map(row => row.id).join(',');

      // Chèn điều kiện cho destination
      var destinationQuery = `
        destination.id IN (${destinationIdList}) AND destination.deleted = false
      `;

    }

    const dayFormat = new Date();
    const formattedDate = dayFormat.toISOString().slice(0, 19).replace('T', ' ');

    const query = `
    SELECT tours.id, tours.title, tours.code, tours.slug, tour_detail.adultPrice as price, images.source as image, tour_detail.dayStart, tour_detail.dayReturn, 
    destination.title as destination, departure.title as departure, transportation.title as transportation
    FROM tours
    JOIN tours_categories ON tours.id = tours_categories.tourId
    JOIN categories ON tours_categories.categoryId = categories.id
    JOIN destination ON tours.destinationId = destination.id
    JOIN departure ON tours.departureId = departure.id
    JOIN transportation ON transportation.id = tours.transportationId
    JOIN tour_detail ON tour_detail.tourId = tours.id
    JOIN images ON images.tourId = tours.id
    WHERE
      ${categoryQuery ? categoryQuery : destinationQuery}
      AND categories.deleted = 0
      AND categories.status = 1
      AND tours.deleted = 0
      AND tours.status = 1
      AND DATEDIFF(tour_detail.dayStart, '${formattedDate}') >= 0
      AND ${priceQuery}
      ${departureQuery}
      ${transportationQuery} 
      ${dayQuery}
      ${searchQuery}
    `;

    const tours = await sequelize.query(query, {
      replacements: replacements,
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


/**
 * @swagger
 * /tours/feature:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy danh sách tour nổi bật
 *     description: Trả về danh sách các tour được đánh dấu là nổi bật trong hệ thống.
 *     operationId: getFeaturedTours
 *     responses:
 *       200:
 *         description: Danh sách tour nổi bật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 tours:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Tour Đà Nẵng - Hội An"
 *                       code:
 *                         type: string
 *                         example: "TD01"
 *                       slug:
 *                         type: string
 *                         example: "tour-da-nang-hoi-an"
 *                       price:
 *                         type: integer
 *                         example: 5000000
 *                       image:
 *                         type: string
 *                         example: "https://example.com/images/tour-da-nang-hoi-an.jpg"
 *                       departure:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Hà Nội"
 *                       tourDetail:
 *                         type: object
 *                         properties:
 *                           dayStart:
 *                             type: string
 *                             format: date
 *                             example: "2024-01-01"
 *                           dayReturn:
 *                             type: string
 *                             format: date
 *                             example: "2024-01-07"
 *                           stock:
 *                             type: integer
 *                             example: 10
 *       404:
 *         description: Không tìm thấy tour nào
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tour không tìm thấy"
 *       500:
 *         description: Có lỗi xảy ra khi lấy danh sách tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Lỗi lấy dữ liệu"
 */

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
      const images = await Image.findAll({
        where: {
          tourId: tour.id
        },
        attributes: ['name', 'source']
      })

      tourObj.departure = departure;
      tourObj.tourDetail = tourDetail;
      tourObj.images = images;

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

/**
 * @swagger
 * /tours/flash-sale:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy danh sách tour giảm giá chớp nhoáng
 *     description: Trả về danh sách các tour đang trong chương trình giảm giá chớp nhoáng trong vòng 5 ngày tới.
 *     operationId: getFlashSaleTours
 *     responses:
 *       200:
 *         description: Danh sách tour giảm giá chớp nhoáng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 tours:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       code:
 *                         type: string
 *                         example: "TS01"
 *                       title:
 *                         type: string
 *                         example: "Tour Đà Lạt - Thành Phố Ngàn Hoa"
 *                       price:
 *                         type: integer
 *                         example: 3000000
 *                       slug:
 *                         type: string
 *                         example: "tour-da-lat-thanh-pho-ngan-hoa"
 *                       dayStart:
 *                         type: string
 *                         format: date
 *                         example: "2024-11-05"
 *                       dayReturn:
 *                         type: string
 *                         format: date
 *                         example: "2024-11-10"
 *                       stock:
 *                         type: integer
 *                         example: 20
 *                       destination:
 *                         type: string
 *                         example: "Đà Lạt"
 *       404:
 *         description: Không tìm thấy tour nào trong chương trình giảm giá chớp nhoáng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tour không tìm thấy"
 *       500:
 *         description: Có lỗi xảy ra khi lấy danh sách tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Lỗi lấy dữ liệu"
 */
// [GET] /tours/flash-sale
module.exports.flashSale = async (req, res) => {
  try {
    const dayFormat = new Date();
    const formattedDate = dayFormat.toISOString().slice(0, 19).replace('T', ' ');

    var query = `
      SELECT  
        tours.id, tours.code, tours.title, tour_detail.adultPrice as price, tours.slug, tour_detail.discount,
        tour_detail.dayStart, tour_detail.dayReturn, tour_detail.stock, destination.title as destination
      FROM tours
      JOIN tour_detail ON tours.id = tour_detail.tourId
      JOIN destination ON destination.id = tours.destinationId
      WHERE 
        tours.deleted = 0
        AND tours.status = 1
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


/**
 * @swagger
 * /tours/favorites:
 *   post:
 *     tags:
 *       - Tours
 *     summary: Thêm tour vào danh sách yêu thích
 *     description: Cho phép người dùng thêm một tour vào danh sách yêu thích của họ.
 *     operationId: addTourToFavorites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Thêm tour vào danh sách yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã thêm tour vào danh sách yêu thích."
 *       400:
 *         description: Tour đã nằm trong danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Tour đã nằm trong danh sách yêu thích"
 *       500:
 *         description: Có lỗi xảy ra khi thêm tour vào danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra khi thêm vào danh sách yêu thích."
 */

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

/**
 * @swagger
 * /tours/favorites:
 *   delete:
 *     tags:
 *       - Tours
 *     summary: Xóa tour khỏi danh sách yêu thích
 *     description: Cho phép người dùng xóa một tour khỏi danh sách yêu thích của họ.
 *     operationId: deleteTourFromFavorites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Xóa tour khỏi danh sách yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã xóa tour khỏi danh sách yêu thích."
 *       400:
 *         description: Tour không nằm trong danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Tour không nằm trong danh sách yêu thích."
 *       500:
 *         description: Có lỗi xảy ra khi xóa tour khỏi danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra khi xóa tour khỏi danh sách yêu thích."
 */

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

/**
 * @swagger
 * /tours/favorites:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy danh sách tour yêu thích của người dùng
 *     description: Trả về danh sách các tour đã được người dùng đánh dấu là yêu thích.
 *     operationId: getUserFavoriteTours
 *     responses:
 *       200:
 *         description: Lấy danh sách tour yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Tour Tết"
 *                   code:
 *                     type: string
 *                     example: "TET2024"
 *                   slug:
 *                     type: string
 *                     example: "tour-tet"
 *                   price:
 *                     type: number
 *                     example: 5000000
 *                   image:
 *                     type: string
 *                     example: "http://example.com/image.jpg"
 *                   dayStart:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-25"
 *                   dayReturn:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-30"
 *                   destination:
 *                     type: string
 *                     example: "Hà Nội"
 *                   transportation:
 *                     type: string
 *                     example: "Máy bay"
 *       404:
 *         description: Không tìm thấy tour yêu thích nào
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy tour yêu thích nào."
 *       500:
 *         description: Có lỗi xảy ra khi lấy danh sách tour yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra khi lấy danh sách tour yêu thích."
 */

// [GET] /tours/favorites
module.exports.getTourFavorites = async (req, res) => {
  const userId = res.locals.userId;

  try {
    const query = `
      SELECT tours.id, tours.title, tours.code, tours.slug, tour_detail.adultPrice as price, images.source as image, tour_detail.dayStart, tour_detail.dayReturn, destination.title as destination, transportation.title as transportation, departure.title as departure
      FROM favorites
      JOIN tours ON tours.id = favorites.tourId
      JOIN images ON images.tourId = tours.id
      JOIN tour_detail ON tour_detail.tourId = tours.id
      JOIN destination ON destination.id = tours.destinationId
      JOIN transportation ON transportation.id = tours.transportationId
      JOIN departure ON departure.id = tours.departureId
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
    console.log(tours);

    if (tours.length === 0) {
      return res.status(200).json({
        message: 'Danh sách tour yêu thích rỗng.'
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
const generateCodeHelper = require("../../helpers/generateCode.helper");
const transformeDataHelper = require("../../helpers/transformeData");
const slugify = require("slugify");
const Tour = require("../../models/tour.model");
const sequelize = require("../../config/database");
const Category = require("../../models/category.model");
const TourCategory = require("../../models/tour-category.model");
const Schedule = require("../../models/schedule.model");
const Information = require("../../models/information.model");
const TourDetail = require("../../models/tour-detail.model");
const Image = require("../../models/image.model");
const Destination = require("../../models/destination.model");
const Departure = require("../../models/departure.model");
const Transportation = require("../../models/transportation.model");
const {
  buildTourQuery
} = require("../../helpers/builTourQuery.helper");
const {
  QueryTypes,
} = require("sequelize");

/**
 * @swagger
 * /tours/search:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Tìm kiếm tour theo tiêu đề
 *     description: Trả về danh sách các tour phù hợp dựa trên các tiêu chí tìm kiếm.
 *     operationId: searchTours
 *     parameters:
 *       - name: title
 *         in: query
 *         required: false
 *         description: Tiêu đề tour để tìm kiếm.
 *         schema:
 *           type: string
 *           example: "Tour du lịch Đà Nẵng"
 *     responses:
 *       200:
 *         description: Danh sách các tour tìm được
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Tour Đà Nẵng 2024"
 *                   source:
 *                     type: string
 *                     example: "https://example.com/images/default_image.jpg"
 *                   code:
 *                     type: string
 *                     example: "DN2024"
 *                   status:
 *                     type: integer
 *                     example: 1
 *                   isFeatured:
 *                     type: boolean
 *                     example: true
 *                   adultPrice:
 *                     type: number
 *                     format: float
 *                     example: 1200000.0
 *                   dayStart:
 *                     type: string
 *                     format: date
 *                     example: "2024-12-25"
 *                   dayReturn:
 *                     type: string
 *                     format: date
 *                     example: "2024-12-30"
 *                   categories:
 *                     type: string
 *                     example: "Du lịch biển"
 *                   destination:
 *                     type: string
 *                     example: "Đà Nẵng"
 *                   departure:
 *                     type: string
 *                     example: "Hà Nội"
 *                   transportation:
 *                     type: string
 *                     example: "Máy bay"
 *       404:
 *         description: Không tìm thấy tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy tour nào."
 *       500:
 *         description: Có lỗi xảy ra khi tìm kiếm tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra khi tìm kiếm tour."
 */

//[GET] /tours/search
module.exports.search = async (req, res) => {
  try {
    const filters = req.query;
    const query = buildTourQuery(filters);
    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });


    res.status(200).json(tours);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Có lỗi xảy ra khi tìm kiếm tour.'
    });
  }
}

/**
 * @swagger
 * /tours/create:
 *   post:
 *     tags:
 *       - Tours
 *     summary: Tạo một tour mới
 *     description: Tạo một tour mới với thông tin về tên, lịch trình, chi tiết, hình ảnh, và các thuộc tính khác.
 *     operationId: createTour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tên của tour
 *                 example: "Tour Mùa Xuân 2024"
 *               isFeatured:
 *                 type: boolean
 *                 description: Xác định xem tour có phải là tour nổi bật không
 *                 example: false
 *               information:
 *                 type: string
 *                 description: Thông tin thêm về tour dưới dạng JSON string
 *                 example: '{"attractions": "Điểm du lịch nổi bật", "cuisine": "Ẩm thực đặc trưng"}'
 *               schedule:
 *                 type: string
 *                 description: Lịch trình của tour dưới dạng JSON string
 *                 example: '[{"day": "Ngày 1", "title": "Hà Nội - Sapa", "information": "Di chuyển và tham quan"}]'
 *               departureId:
 *                 type: integer
 *                 description: ID của địa điểm khởi hành
 *                 example: 1
 *               transportationId:
 *                 type: integer
 *                 description: ID của phương tiện di chuyển
 *                 example: 2
 *               destinationId:
 *                 type: integer
 *                 description: ID của điểm đến
 *                 example: 3
 *               categoryId:
 *                 type: integer
 *                 description: ID của danh mục tour
 *                 example: 4
 *               infoImage:
 *                 type: string
 *                 description: Thông tin về hình ảnh dưới dạng JSON string
 *                 example: '[{"name": "ảnh chính", "isMain": "true"}]'
 *               images:
 *                 type: array
 *                 description: Danh sách các đường dẫn hình ảnh
 *                 items:
 *                   type: file
 *                 example: key - image
 *               tour_detail:
 *                 type: string
 *                 description: Chi tiết của tour dưới dạng JSON string
 *                 example: '[{"adultPrice": 1000, "stock": 20, "dayStart": "2024-01-01", "dayReturn": "2024-01-07"}]'
 *     responses:
 *       200:
 *         description: Tour mới được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo tour mới thành công!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Tour Mùa Xuân 2024"
 *                     code:
 *                       type: string
 *                       example: "SPRING2024"
 *                     slug:
 *                       type: string
 *                       example: "tour-mua-xuan-2024"
 *                     isFeatured:
 *                       type: boolean
 *                       example: false
 *                     departureId:
 *                       type: integer
 *                       example: 1
 *                     destinationId:
 *                       type: integer
 *                       example: 3
 *                     transportationId:
 *                       type: integer
 *                       example: 2
 *                     information:
 *                       type: object
 *                       description: Thông tin về tour đã lưu
 *                     tourDetail:
 *                       type: array
 *                       description: Các chi tiết của tour
 *                       items:
 *                         type: object
 *                     schedule:
 *                       type: array
 *                       description: Lịch trình của tour
 *                       items:
 *                         type: object
 *                     images:
 *                       type: array
 *                       description: Các hình ảnh của tour
 *                       items:
 *                         type: object
 *       400:
 *         description: Yêu cầu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Title là bắt buộc!"
 *       500:
 *         description: Có lỗi xảy ra khi tạo tour mới
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi tạo tour mới!"
 */

//[POST] /tours/create
module.exports.create = async (req, res) => {
  const {
    title,
    isFeatured,
    information,
    schedule,
    departureId,
    transportationId,
    destinationId,
    categoryId,
    images,
    tour_detail
  } = req.body;
  // console.log(req.body);


  if (!title) {
    return res.status(400).json("Title là bắt buộc!");
  }
  if (!tour_detail) {
    return res.status(400).json("Tour_detail là bắt buộc!");
  }
  if (!departureId) {
    return res.status(400).json("DepartureId là bắt buộc!");
  }
  if (!transportationId) {
    return res.status(400).json("TransportaionId là bắt buộc!");
  }
  if (!destinationId) {
    return res.status(400).json("DestinationId là bắt buộc!");
  }
  if (!categoryId) {
    return res.status(400).json("CategoryId là bắt buộc!");
  }

  try {
    const adminId = res.locals.adminId;
    const transaction = await sequelize.transaction();
    const code = generateCodeHelper.generateTourCode();
    const slug = slugify(title, {
      lower: true
    });

    const tour = await Tour.create({
      title: title,
      code: code,
      slug: slug,
      isFeatured: isFeatured || 0,
      departureId: departureId,
      destinationId: destinationId,
      transportationId: transportationId,
      createBy: adminId
    }, {
      transaction: transaction
    });

    await TourCategory.create({
      tourId: tour.id,
      categoryId: categoryId
    }, {
      transaction: transaction
    });

    if (information) {
      const informationParse = JSON.parse(information);
      var informationRecord = await Information.create({
        tourId: tour.id,
        attractions: informationParse.attractions || "",
        cuisine: informationParse.cuisine || "",
        suitableObject: informationParse.suitableObject || "",
        idealTime: informationParse.idealTime || "",
        vehicle: informationParse.vehicle || "",
        promotion: informationParse.promotion || ""
      }, {
        transaction
      });
    }


    if (schedule && JSON.parse(schedule).length > 0) {
      const scheduleParse = JSON.parse(schedule);

      var scheduleRecords = await Promise.all(scheduleParse.map(async (item) => {
        if (!item.day || !item.title) {
          throw new Error("Yêu cầu gửi đủ thông tin schedule");
        }
        return await Schedule.create({
          tourId: tour.id,
          day: item.day,
          title: item.title,
          information: item.information || ""
        }, {
          transaction
        });
      }));
    }

    if (tour_detail && JSON.parse(tour_detail).length > 0) {
      const tourDetailParse = JSON.parse(tour_detail);

      var tourDetailRecords = await Promise.all(tourDetailParse.map(async (item) => {
        if (!item.adultPrice || !item.stock || !item.dayStart || !item.dayReturn) {
          throw new Error("Yêu cầu gửi đủ thông tin tour_detail");
        }
        return await TourDetail.create({
          tourId: tour.id,
          adultPrice: item.adultPrice,
          childrenPrice: item.childrenPrice || 0,
          childPrice: item.childPrice || 0,
          babyPrice: item.babyPrice || 0,
          singleRoomSupplementPrice: item.singleRoomSupplementPrice || 0,
          stock: item.stock,
          dayStart: item.dayStart,
          dayReturn: item.dayReturn,
          discount: item.discount || 0
        }, {
          transaction
        })
      }));
    }


    if (images && Array.isArray(images) && images.length > 0) {
      const dataImages = images.map((file, index) => ({
        tourId: tour.id,
        source: file,
      }));

      var imageRecords = await Image.bulkCreate(dataImages, {
        transaction
      });
    }

    await transaction.commit();
    res.status(200).json({
      message: "Tạo tour mới thành công!",
      data: {
        id: tour.id,
        title: tour.title,
        code: tour.code,
        slug: tour.slug,
        isFeatured: tour.isFeatured,
        departureId: tour.departureId,
        destinationId: tour.destinationId,
        transportationId: tour.transportationId,
        information: informationRecord,
        tourDetail: tourDetailRecords,
        schedule: scheduleRecords,
        images: imageRecords
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi tạo tour mới!"
    })
  }
}

/**
 * @swagger
 * /tours/edit/{tourId}:
 *   patch:
 *     summary: Chỉnh sửa thông tin tour
 *     description: Cập nhật thông tin của một tour đã tồn tại, bao gồm tên, trạng thái, lịch trình, hình ảnh, thông tin chi tiết tour, v.v.
 *     tags:
 *       - Tours
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         description: ID của tour cần chỉnh sửa
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *               information:
 *                 type: string
 *               schedule:
 *                 type: string
 *               departureId:
 *                 type: integer
 *               transportationId:
 *                 type: integer
 *               destinationId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               infoImage:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tour_detail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật tour thành công
 *       400:
 *         description: TourId là bắt buộc
 *       404:
 *         description: Không tìm thấy tour
 *       500:
 *         description: Có lỗi khi chỉnh sửa thông tin tour
 */
// [PATCH] /tours/edit/:tourId
module.exports.edit = async (req, res) => {
  let transaction = await sequelize.transaction();
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json("TourId là bắt buộc!");
  }

  const {
    title,
    status,
    isFeatured,
    information,
    schedule,
    departureId,
    transportationId,
    destinationId,
    categoryId,
    images,
    tour_detail
  } = req.body;


  try {
    const tour = await Tour.findOne({
      where: {
        id: tourId
      },
      transaction
    });

    if (!tour) {
      return res.status(404).json("Không tìm thấy tour");
    }
    if (title) {
      var slug = slugify(title, {
        lower: true
      })
    }

    await tour.update({
      title: title || tour.title,
      slug: slug || tour.slug,
      status: status || tour.status,
      isFeatured: isFeatured !== undefined ? isFeatured : tour.isFeatured,
      departureId: departureId || tour.departureId,
      transportationId: transportationId || tour.transportationId,
      destinationId: destinationId || tour.destinationId
    }, {
      transaction
    });

    // Update categoryId for tour
    if (categoryId) {
      await TourCategory.update({
        categoryId
      }, {
        where: {
          tourId
        },
        transaction
      });
    }

    // Update information
    if (information) {
      const informationParse = JSON.parse(information);

      // Tìm bản ghi hiện tại
      const record = await Information.findOne({
        where: {
          tourId
        },
        transaction,
      });

      // Tạo một object để lưu các giá trị cập nhật
      const updatedFields = {};

      if (informationParse.attractions && informationParse.attractions.trim() !== "") {
        updatedFields.attractions = informationParse.attractions;
      } else if (record) {
        updatedFields.attractions = record.attractions;
      }

      if (informationParse.cuisine && informationParse.cuisine.trim() !== "") {
        updatedFields.cuisine = informationParse.cuisine;
      } else if (record) {
        updatedFields.cuisine = record.cuisine;
      }

      if (informationParse.suitableObject && informationParse.suitableObject.trim() !== "") {
        updatedFields.suitableObject = informationParse.suitableObject;
      } else if (record) {
        updatedFields.suitableObject = record.suitableObject;
      }

      if (informationParse.idealTime && informationParse.idealTime.trim() !== "") {
        updatedFields.idealTime = informationParse.idealTime;
      } else if (record) {
        updatedFields.idealTime = record.idealTime;
      }

      if (informationParse.vehicle && informationParse.vehicle.trim() !== "") {
        updatedFields.vehicle = informationParse.vehicle;
      } else if (record) {
        updatedFields.vehicle = record.vehicle;
      }

      if (informationParse.promotion && informationParse.promotion.trim() !== "") {
        updatedFields.promotion = informationParse.promotion;
      } else if (record) {
        updatedFields.promotion = record.promotion;
      }

      // Cập nhật bản ghi với các giá trị đã được xử lý
      await Information.update(updatedFields, {
        where: {
          tourId
        },
        transaction,
      });
    }


    // Update schedule
    if (schedule && JSON.parse(schedule).length > 0) {
      await Schedule.destroy({
        where: {
          tourId
        },
        transaction
      });

      const scheduleParse = JSON.parse(schedule);
      await Promise.all(scheduleParse.map(item => {
        if (!item.day || !item.title) {
          throw new Error("Yêu cầu gửi đủ thông tin Schedule");
        }
        return Schedule.create({
          tourId,
          day: item.day,
          title: item.title,
          information: item.information || ""
        }, {
          transaction
        });
      }));
    }

    // Update images
    if (images && Array.isArray(images) && images.length > 0) {
      await Image.destroy({
        where: {
          tourId
        },
        transaction
      })

      const dataImages = images.map((image, index) => ({
        tourId,
        source: image,
      }));

      await Image.bulkCreate(dataImages, {
        transaction
      });
    }

    // Update tour detail
    if (tour_detail && JSON.parse(tour_detail).length > 0) {
      const tourDetailParse = JSON.parse(tour_detail);

      await Promise.all(tourDetailParse.map(async (item) => {
        // Kiểm tra nếu bản ghi đã tồn tại, nếu có thì cập nhật, nếu không thì tạo mới
        const existingTourDetail = await TourDetail.findOne({
          where: {
            tourId: tourId,
            dayStart: item.dayStart, // Có thể sử dụng dayStart hoặc bất kỳ thuộc tính nào duy nhất
          }
        });

        if (existingTourDetail) {
          // Nếu bản ghi tồn tại, cập nhật
          await existingTourDetail.update({
            adultPrice: item.adultPrice,
            childrenPrice: item.childrenPrice || 0,
            childPrice: item.childPrice || 0,
            babyPrice: item.babyPrice || 0,
            singleRoomSupplementPrice: item.singleRoomSupplementPrice || 0,
            stock: item.stock,
            dayReturn: item.dayReturn,
            discount: item.discount || 0
          }, {
            transaction
          });
        } else {
          // Nếu bản ghi không tồn tại, tạo mới
          await TourDetail.create({
            tourId: tourId,
            adultPrice: item.adultPrice,
            childrenPrice: item.childrenPrice || 0,
            childPrice: item.childPrice || 0,
            babyPrice: item.babyPrice || 0,
            singleRoomSupplementPrice: item.singleRoomSupplementPrice || 0,
            stock: item.stock,
            dayStart: item.dayStart,
            dayReturn: item.dayReturn,
            discount: item.discount || 0
          }, {
            transaction
          });
        }
      }));
    }


    await transaction.commit();
    res.status(200).json("Cập nhật tour thành công");

  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return res.status(500).json("Có lỗi khi chỉnh sửa thông tin một tour");
  }
}

/**
 * @swagger
 * /tours/detail/{tourId}:
 *   get:
 *     summary: "Lấy thông tin chi tiết của một tour du lịch"
 *     description: "Trả về các thông tin chi tiết của tour du lịch bao gồm thông tin, lịch trình, điểm đến, phương tiện di chuyển, hình ảnh, và các chi tiết tour."
 *     tags: 
 *       - Tours
 *     parameters:
 *       - name: "tourId"
 *         in: "path"
 *         description: "ID của tour cần lấy thông tin chi tiết"
 *         required: true
 *         schema:
 *           type: "string"
 *     responses:
 *       200:
 *         description: "Thông tin chi tiết của tour"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 tour:
 *                   type: "object"
 *                   description: "Thông tin cơ bản của tour"
 *                 information:
 *                   type: "object"
 *                   description: "Thông tin bổ sung về tour"
 *                 schedule:
 *                   type: "array"
 *                   description: "Danh sách lịch trình của tour"
 *                   items:
 *                     type: "object"
 *                 destination:
 *                   type: "object"
 *                   description: "Thông tin về điểm đến"
 *                 departure:
 *                   type: "object"
 *                   description: "Thông tin về điểm xuất phát"
 *                 transportation:
 *                   type: "object"
 *                   description: "Thông tin về phương tiện di chuyển"
 *                 images:
 *                   type: "array"
 *                   description: "Danh sách hình ảnh của tour"
 *                   items:
 *                     type: "object"
 *                 tourDetails:
 *                   type: "array"
 *                   description: "Chi tiết tour (giá, số lượng, v.v.)"
 *                   items:
 *                     type: "object"
 *       400:
 *         description: "Không tìm thấy tour"
 *         content:
 *           application/json:
 *             schema:
 *               type: "string"
 *               example: "Không tìm thấy tour"
 *       500:
 *         description: "Lỗi khi lấy thông tin tour"
 *         content:
 *           application/json:
 *             schema:
 *               type: "string"
 *               example: "Có lỗi khi lấy ra thông tin một tour"
 */
//[GET] /tours/detail/:tourId
module.exports.getTour = async (req, res) => {
  const tourId = req.params.tourId;

  try {
    const tour = await Tour.findOne({
      where: {
        id: tourId,
        deleted: false
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deleted', 'deletedAt', 'deletedBy', 'updatedBy']
      }
    });
    const tourCategory = await TourCategory.findByPk(tour.id);
    const category = await Category.findByPk(tourCategory.categoryId)

    if (!tour) {
      return res.status(400).json("Không tìm thấy tour");
    }
    const information = await Information.findOne({
      where: {
        tourId: tourId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'tourId']
      }
    });
    const schedule = await Schedule.findAll({
      where: {
        tourId: tourId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'tourId']
      }
    });
    const destination = await Destination.findOne({
      where: {
        id: tour.destinationId
      },
      attributes: ['id', 'title']
    });
    const departure = await Departure.findOne({
      where: {
        id: tour.departureId
      },
      attributes: ['id', 'title']
    });
    const transportation = await Transportation.findOne({
      where: {
        id: tour.transportationId
      },
      attributes: ['id', 'title']
    });
    const images = await Image.findAll({
      where: {
        tourId: tourId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'tourId']
      }
    });
    const tourDetails = await TourDetail.findAll({
      where: {
        tourId: tourId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'tourId']
      }
    });


    res.status(200).json({
      tour: tour,
      information: information,
      schedule: schedule,
      destination: destination,
      departure: departure,
      transportation: transportation,
      images: images,
      tourDetails: tourDetails,
      category: category
    })

  } catch (error) {
    console.log(error);
    res.status(500).json("Có lỗi khi lấy ra thông tin một tour")
  }
}


/**
 * @swagger
 * /tours/remove/{tourId}:
 *   patch:
 *     summary: "Xóa tour du lịch"
 *     description: "Cập nhật trạng thái của tour thành đã xóa (deleted: true)."
 *     tags: 
 *       - Tours
 *     parameters:
 *       - name: "tourId"
 *         in: "path"
 *         description: "ID của tour cần xóa"
 *         required: true
 *         schema:
 *           type: "string"
 *     responses:
 *       200:
 *         description: "Xóa tour thành công"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   type: "string"
 *                   example: "Xóa tour thành công!"
 *       400:
 *         description: "TourId là bắt buộc"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   type: "string"
 *                   example: "TourId là bắt buộc!"
 *       500:
 *         description: "Lỗi khi xóa tour"
 *         content:
 *           application/json:
 *             schema:
 *               type: "string"
 *               example: "Lỗi khi xóa một tour!"
 */
// [PATCH] /tours/remove/:tourId
module.exports.removeTour = async (req, res) => {
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json({
      message: "TourId là bắt buộc!"
    });
  }
  try {
    await Tour.update({
      deleted: true
    }, {
      where: {
        id: tourId
      }
    });

    res.status(200).json({
      message: "Xóa tour thành công!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi xóa một tour!");
  }
}

/**
 * @swagger
 * /tours/get-all-tour:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy tất cả các tour với các bộ lọc tùy chọn
 *     description: API này cho phép người dùng lấy danh sách các tour với các bộ lọc khác nhau như điểm đến, nơi khởi hành, ngày bắt đầu, loại phương tiện và danh mục.
 *     parameters:
 *       - in: query
 *         name: destinationTo
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của điểm đến để lọc tour theo điểm đến.
 *       - in: query
 *         name: departureFrom
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của nơi khởi hành để lọc tour theo nơi khởi hành.
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu tour .
 *       - in: query
 *         name: transTypeId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của loại phương tiện để lọc tour theo phương tiện.
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của danh mục để lọc tour theo danh mục.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Trạng thái của tour. 1 là hoạt động, 0 là không hoạt động.
 *       - in: query
 *         name: isFeatured
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Cờ lọc tour theo tour nổi bật. 1 là nổi bật, 0 là không nổi bật.
 *       - in: query
 *         name: sortOder
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *         description: Thứ tự sắp xếp tour theo giá (giá người lớn).
 *     responses:
 *       200:
 *         description: Danh sách các tour phù hợp với bộ lọc.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Id tour.
 *                   title:
 *                     type: string
 *                     description: Tên của tour.
 *                   source:
 *                     type: string
 *                     description: Đường dẫn hình ảnh (hoặc hình ảnh mặc định nếu không có).
 *                   code:
 *                     type: string
 *                     description: Mã của tour.
 *                   status:
 *                     type: integer
 *                     description: Trạng thái của tour (1 là hoạt động, 0 là không hoạt động).
 *                   isFeatured:
 *                     type: integer
 *                     description: Liệu tour có phải là tour nổi bật không.
 *                   adultPrice:
 *                     type: number
 *                     description: Giá tour cho người lớn.
 *                   dayStart:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày bắt đầu sớm nhất của tour.
 *                   dayReturn:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày kết thúc tour.
 *                   categories:
 *                     type: string
 *                     description: Danh mục của tour.
 *                   destination:
 *                     type: string
 *                     description: Điểm đến của tour.
 */

// [GET] /tour/get-all-tour
module.exports.getAllTour = async (req, res) => {
  try {
    const filters = req.query;
    const query = buildTourQuery(filters);
    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching all tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu"
    });
  }
};

/**
 * @swagger
 * /tours/expired:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy danh sách các tour đã hết hạn
 *     description: API này trả về danh sách các tour đã hết hạn với các bộ lọc tùy chọn như điểm đến, nơi khởi hành, ngày bắt đầu, loại phương tiện, danh mục và trạng thái.
 *     parameters:
 *       - in: query
 *         name: destinationTo
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của điểm đến để lọc tour theo điểm đến.
 *       - in: query
 *         name: departureFrom
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của nơi khởi hành để lọc tour theo nơi khởi hành.
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu tour .
 *       - in: query
 *         name: transTypeId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của loại phương tiện để lọc tour theo phương tiện.
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của danh mục để lọc tour theo danh mục.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Trạng thái của tour. 1 là hoạt động, 0 là không hoạt động.
 *       - in: query
 *         name: isFeatured
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Cờ lọc tour theo tour nổi bật. 1 là nổi bật, 0 là không nổi bật.
 *       - in: query
 *         name: sortOder
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *         description: Thứ tự sắp xếp tour theo giá (giá người lớn).
 *     responses:
 *       200:
 *         description: Danh sách các tour đã hết hạn phù hợp với bộ lọc.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Id tour.
 *                   title:
 *                     type: string
 *                     description: Tên của tour.
 *                   source:
 *                     type: string
 *                     description: Đường dẫn hình ảnh (hoặc hình ảnh mặc định nếu không có).
 *                   code:
 *                     type: string
 *                     description: Mã của tour.
 *                   status:
 *                     type: integer
 *                     description: Trạng thái của tour (1 là hoạt động, 0 là không hoạt động).
 *                   isFeatured:
 *                     type: integer
 *                     description: Liệu tour có phải là tour nổi bật không.
 *                   adultPrice:
 *                     type: number
 *                     description: Giá tour cho người lớn.
 *                   dayStart:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày bắt đầu sớm nhất của tour.
 *                   dayReturn:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày kết thúc tour.
 *                   categories:
 *                     type: string
 *                     description: Danh mục của tour.
 *                   destination:
 *                     type: string
 *                     description: Điểm đến của tour.
 *                   countTourDetail:
 *                     type: integer
 *                     description: Số lượng chi tiết tour (dùng để xác định tour đã hết hạn).
 *       400:
 *         description: Không tìm thấy tour nào thỏa mãn yêu cầu.
 *       500:
 *         description: Lỗi hệ thống khi lấy dữ liệu tour hết hạn.
 */

// [GET] /tours/expired
module.exports.getExpiredTours = async (req, res) => {
  const filters = req.query;

  try {
    const query = buildTourQuery(filters);
    const expiredToursQuery = query.replace('DATEDIFF(tour_detail.dayStart, NOW()) >= 0', 'DATEDIFF(tour_detail.dayStart, NOW()) < 0');
    const tours = await sequelize.query(expiredToursQuery, {
      type: QueryTypes.SELECT
    });

    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching expired tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu tour hết hạn"
    });
  }
};


/**
 * @swagger
 * /tours/expired-soon:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy danh sách các tour sắp hết hạn (từ 0 đến 7 ngày)
 *     description: API này trả về danh sách các tour sắp hết hạn trong vòng 7 ngày tới, với các bộ lọc tùy chọn như điểm đến, nơi khởi hành, ngày bắt đầu, loại phương tiện, danh mục và trạng thái.
 *     parameters:
 *       - in: query
 *         name: destinationTo
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của điểm đến để lọc tour theo điểm đến.
 *       - in: query
 *         name: departureFrom
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của nơi khởi hành để lọc tour theo nơi khởi hành.
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu tour .
 *       - in: query
 *         name: transTypeId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của loại phương tiện để lọc tour theo phương tiện.
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của danh mục để lọc tour theo danh mục.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Trạng thái của tour. 1 là hoạt động, 0 là không hoạt động.
 *       - in: query
 *         name: isFeatured
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Cờ lọc tour theo tour nổi bật. 1 là nổi bật, 0 là không nổi bật.
 *       - in: query
 *         name: sortOder
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *         description: Thứ tự sắp xếp tour theo giá (giá người lớn).
 *     responses:
 *       200:
 *         description: Danh sách các tour sắp hết hạn trong vòng 7 ngày tới phù hợp với bộ lọc.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Id tour.
 *                   title:
 *                     type: string
 *                     description: Tên của tour.
 *                   source:
 *                     type: string
 *                     description: Đường dẫn hình ảnh (hoặc hình ảnh mặc định nếu không có).
 *                   code:
 *                     type: string
 *                     description: Mã của tour.
 *                   status:
 *                     type: integer
 *                     description: Trạng thái của tour (1 là hoạt động, 0 là không hoạt động).
 *                   isFeatured:
 *                     type: integer
 *                     description: Liệu tour có phải là tour nổi bật không.
 *                   adultPrice:
 *                     type: number
 *                     description: Giá tour cho người lớn.
 *                   dayStart:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày bắt đầu sớm nhất của tour.
 *                   dayReturn:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày kết thúc tour.
 *                   categories:
 *                     type: string
 *                     description: Danh mục của tour.
 *                   destination:
 *                     type: string
 *                     description: Điểm đến của tour.
 *                   daysRemaining:
 *                     type: integer
 *                     description: Số ngày còn lại cho đến khi tour hết hạn.
 *                   countTourDetailExpired:
 *                     type: integer
 *                     description: Số lượng chi tiết tour đã hết hạn trong danh sách.
 *       400:
 *         description: Không tìm thấy tour nào thỏa mãn yêu cầu.
 *       500:
 *         description: Lỗi hệ thống khi lấy dữ liệu tour sắp hết hạn.
 */

// [GET] /tours/expired-soon
module.exports.getExpiredSoonTours = async (req, res) => {
  const filters = req.query;

  try {
    const query = buildTourQuery(filters);
    const expiredSoonQuery = query.replace(
      'DATEDIFF(tour_detail.dayStart, NOW()) >= 0',
      'DATEDIFF(tour_detail.dayStart, NOW()) BETWEEN 0 AND 7'
    );
    const tours = await sequelize.query(expiredSoonQuery, {
      type: QueryTypes.SELECT
    });


    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching expired soon tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu tour sắp hết hạn"
    });
  }
};


/**
 * @swagger
 * /tours/status/{tourId}:
 *   patch:
 *     tags:
 *       - Tours
 *     summary: Cập nhật trạng thái tour
 *     description: API này cho phép cập nhật trạng thái của một tour cụ thể thông qua tourId. Trạng thái có thể là "hoạt động" hoặc "không hoạt động".
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tour cần cập nhật trạng thái.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái mới của tour. "true" là hoạt động, "false" là không hoạt động.
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái tour thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *                 tourId:
 *                   type: string
 *                   description: ID của tour đã được cập nhật trạng thái.
 *       400:
 *         description: Thiếu tourId hoặc tham số không hợp lệ.
 *       404:
 *         description: Tour không tồn tại.
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái tour.
 */

// [PATCH] /tours/status/:tourId
module.exports.updateTourStatus = async (req, res) => {
  const {
    status
  } = req.body;
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json("Yêu cầu gửi lên tourId");
  }
  try {
    const updated = await Tour.update({
      status: status
    }, {
      where: {
        id: tourId
      }
    });
    if (updated) {
      res.status(200).json({
        message: "Cập nhật trạng thái tour thành công",
        tourId
      });
    } else {
      res.status(404).json({
        message: "Tour không tồn tại"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật trạng thái tour");
  }
}

/**
 * @swagger
 * /tours/featured/{tourId}:
 *   patch:
 *     tags:
 *       - Tours
 *     summary: Cập nhật trạng thái tour nổi bật
 *     description: API này cho phép cập nhật trạng thái "nổi bật" của một tour cụ thể thông qua tourId.
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tour cần cập nhật trạng thái nổi bật.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isFeatured:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái mới của tour, "true" là tour nổi bật, "false" là không nổi bật.
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái tour nổi bật thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *                 tourId:
 *                   type: string
 *                   description: ID của tour đã được cập nhật trạng thái nổi bật.
 *       400:
 *         description: Thiếu tourId hoặc tham số không hợp lệ.
 *       404:
 *         description: Tour không tồn tại.
 *       500:
 *         description: Lỗi hệ thống khi cập nhật tour nổi bật.
 */

// [PATCH] /tours/featured/:tourId
module.exports.updateTourFeatured = async (req, res) => {
  const {
    isFeatured
  } = req.body;

  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json("Yêu cầu gửi lên tourId");
  }
  try {
    const updated = await Tour.update({
      isFeatured: isFeatured
    }, {
      where: {
        id: tourId
      }
    });
    if (updated) {
      res.status(200).json({
        message: "Cập nhật tour nổi bật thành công",
        tourId
      });
    } else {
      res.status(404).json({
        message: "Tour không tồn tại"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật tour nổi bật");
  }
}

/**
 * @swagger
 * /tours/update-multiple:
 *   patch:
 *     tags:
 *       - Tours
 *     summary: Cập nhật nhiều tour
 *     description: API này cho phép cập nhật trạng thái, trạng thái nổi bật và trạng thái xóa cho nhiều tour cùng một lúc thông qua danh sách tourIds.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID các tour cần cập nhật.
 *               status:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái mới của các tour, "true" là kích hoạt, "false" là hủy.
 *               isFeatured:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái nổi bật của các tour, "true" là tour nổi bật, "false" là không nổi bật.
 *               deleted:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái xóa của các tour, "true" là đã xóa, "false" là chưa xóa.
 *     responses:
 *       200:
 *         description: Cập nhật nhiều tour thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *                 updatedTours:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Danh sách ID của các tour đã được cập nhật.
 *       400:
 *         description: Danh sách ID tour không hợp lệ hoặc không tìm thấy tour để cập nhật.
 *       500:
 *         description: Lỗi hệ thống khi cập nhật nhiều tour.
 */

// [PATCH] /tours/update-multiple
module.exports.updateMultiple = async (req, res) => {
  const {
    tourIds,
    valueChange
  } = req.body;

  if (!tourIds || !Array.isArray(tourIds) || tourIds.length === 0) {
    return res.status(400).json({
      message: "Danh sách ID tour không hợp lệ"
    });
  }

  try {
    const [key, value] = valueChange.split("-");
    const checked = ["status", "isFeatured", "deleted"].includes(key) && ["true", "false"].includes(value);
    if (key == "" || value == "" || !checked) {
      return res.status(400).json("Vui long gửi lên value đúng!")
    }
    const updatedValue = value === "true";
    const updatedTours = await Tour.update({
      [key]: updatedValue
    }, {
      where: {
        id: tourIds
      }
    })
    if (updatedTours[0] > 0) {
      return res.json({
        message: "Cập nhật thành công",
        updatedTours: tourIds
      });
    } else {
      return res.status(400).json({
        message: "Không tìm thấy tour để cập nhật"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật nhiều tour")
  }

}


// [GET] /tours/statistics
module.exports.statistics = async (req, res) => {
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json("Vui lòng gửi lên tourId");
  }
  try {
    const tour = await Tour.findOne({
      where: {
        deleted: false,
        id: tourId
      }
    })
    if (!tour) {
      return res.status(400).json({
        message: "Tour không tồn tại!"
      })
    }


  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi lấy thống kê tour"
    })
  }
}
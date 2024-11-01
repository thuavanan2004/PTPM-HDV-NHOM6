const sequelize = require("../../config/database");
const generateCodeHelper = require("../../helpers/generateCode.helper");
const OrderItem = require("../../models/order_item.model");
const Order = require("../../models/orders.model");
const Transaction = require("../../models/transactions.model");
const sendMailHelper = require("../../helpers/sendEmail.helper");
const moment = require("moment-timezone");

const {
  QueryTypes
} = require("sequelize");

// [GET] /api/orders/book-tour
module.exports.bookTour = async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    address,
    adultPrice,
    adultQuantity,
    childrenPrice,
    childrenQuantity,
    childPrice,
    childQuantity,
    babyPrice,
    babyQuantity,
    singleRoomSupplementPrice,
    singleRoomSupplementQuantity,
    note,
    paymentMethod,
    tourDetailId,
    userId
  } = req.body;

  if (!fullName || !email || !phoneNumber || !paymentMethod || !adultPrice || !adultQuantity || !tourDetailId) {
    return res.status(400).json("Vui lòng gửi đủ dữ liệu");
  }

  try {
    const initTransaction = await sequelize.transaction();

    // Tính tổng giá trị
    const totalChildrenPrice = childrenPrice ? parseInt(childrenPrice) * parseInt(childrenQuantity) : 0;
    const totalChildPrice = childPrice ? parseInt(childPrice) * parseInt(childQuantity) : 0;
    const totalBabyPrice = babyPrice ? parseInt(babyPrice) * parseInt(babyQuantity) : 0;
    const totalSingleRoomSupplementPrice = singleRoomSupplementPrice ? parseInt(singleRoomSupplementPrice) * parseInt(singleRoomSupplementQuantity) : 0;

    const amount = parseInt(adultPrice) * parseInt(adultQuantity) + totalChildrenPrice + totalChildPrice + totalBabyPrice + totalSingleRoomSupplementPrice;

    // Tạo giao dịch
    const transactionCode = generateCodeHelper.generateTransactionCode();
    const transaction = await Transaction.create({
      code: transactionCode,
      amount: amount,
      paymentMethod: paymentMethod
    }, {
      transaction: initTransaction
    });

    // Tạo đơn hàng
    const orderCode = generateCodeHelper.generateOrderCode();
    const order = await Order.create({
      code: orderCode,
      transactionId: transaction.id,
      fullName: fullName,
      email: email,
      phoneNumber: phoneNumber,
      address: address || "",
      userId: userId || null
    }, {
      transaction: initTransaction
    });

    // Tạo mục đơn hàng
    await OrderItem.create({
      orderId: order.id,
      tourDetailId: tourDetailId,
      adultPrice: adultPrice,
      adultQuantity: adultQuantity,
      childrenPrice: childrenPrice || 0,
      childrenQuantity: childrenQuantity || 0,
      childPrice: childPrice || 0,
      childQuantity: childQuantity || 0,
      babyPrice: babyPrice || 0,
      babyQuantity: babyQuantity || 0,
      singleRoomSupplementPrice: singleRoomSupplementPrice || 0,
      singleRoomSupplementQuantity: singleRoomSupplementQuantity || 0,
      note: note || "Không có ghi chú"
    }, {
      transaction: initTransaction
    });

    const query = `
    SELECT tours.title, tours.code, tours.price, tours.image, tour_detail.*, destination.title as destination, departure.title as departure
      FROM favorites
      JOIN tours ON tours.id = favorites.tourId
      JOIN tour_detail ON tour_detail.tourId = tours.id
      JOIN destination ON destination.id = tours.destinationId
      JOIN departure ON departure.id = tours.departureId
      WHERE 
      tour_detail.id = :tourDetailId
    `;

    const tour = await sequelize.query(query, {
      replacements: {
        tourDetailId
      },
      type: QueryTypes.SELECT
    });
    const tourDetail = {
      title: tour[0].title,
      tourCode: tour[0].code,
      dayStart: moment(tour[0].dayStart).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
      dayReturn: moment(tour[0].dayReturn).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
      destination: tour[0].destination,
      departure: tour[0].departure,
      orderCode: orderCode,
      amount: amount.toLocaleString(),
      orderDate: moment(order.orderDate).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'),
      fullName: fullName,
      address: address,
      phoneNumber: phoneNumber,
      email: email
    };

    if (paymentMethod === "cash" || paymentMethod === "bank_transfer") {
      const emailSubject = "Xác nhận đặt tour";
      const emailText = `Xin chào ${fullName},\n\nĐơn hàng của bạn đã được xác nhận với mã đơn hàng: ${order.code}.\nCảm ơn bạn đã đặt tour!`;
      sendMailHelper.sendEmail(email, emailSubject, emailText, tourDetail);
    }
    await initTransaction.commit();
    res.status(200).json({
      message: "Đặt hàng thành công!",
      orderId: order.id,
      transactionId: transaction.id
    });
  } catch (error) {
    console.error("Lỗi khi đặt tour:", error);
    res.status(500).json("Có lỗi xảy ra, vui lòng thử lại sau.");
  }
};
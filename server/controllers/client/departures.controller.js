const Departure = require("../../models/departure.model");

// [GET] /departures/
module.exports.index = async (req, res) => {
  try {
    const departures = await Departure.findAll({
      attributes: ['id', 'title']
    });

    return res.status(200).json(departures);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách điểm khởi hành.'
    });
  }
};
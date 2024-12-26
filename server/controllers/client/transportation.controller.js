const Transportation = require("../../models/transportation.model");


// [GET] /transportations/
module.exports.index = async (req, res) => {
  try {
    const transportations = await Transportation.findAll({
      attributes: ['id', 'title']
    });

    return res.status(200).json(transportations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách phương tiện.'
    });
  }
};
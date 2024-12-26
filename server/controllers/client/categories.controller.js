const Category = require("../../models/category.model");

// [GET] /categories/
module.exports.index = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'title']
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách danh mục.'
    });
  }
};
const unidecode = require("unidecode");
const sequelize = require("../../config/database");
const {
  QueryTypes
} = require("sequelize");

// [GET] /api/destination/
module.exports.index = async (req, res) => {
  const title = req.query.title;

  if (!title) {
    return res.status(400).json({
      message: 'Thiếu title.'
    });
  }

  const titleUnidecode = unidecode(title);
  const titleRegex = `%${titleUnidecode}%`;

  const query = `
  SELECT title, slug, image 
  FROM destination 
  WHERE
    deleted = false
    AND title LIKE :titleRegex
  `;

  try {
    const destination = await sequelize.query(query, {
      replacements: {
        titleRegex: titleRegex
      },
      type: QueryTypes.SELECT
    });

    if (destination.length === 0) {
      return res.status(404).json({
        message: 'Không lấy được địa điểm nào.'
      });
    }

    return res.status(200).json(destination);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách địa điểm.'
    });
  }
};
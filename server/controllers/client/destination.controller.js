const unidecode = require("unidecode");
const sequelize = require("../../config/database");
const Destination = require("../../models/destination.model");
const createTreeHelper = require("../../helpers/createTree.helper");

const {
  QueryTypes
} = require("sequelize");

/**
 * @swagger
 * /destination/:
 *   get:
 *     tags:
 *       - Destination
 *     summary: Lấy danh sách địa điểm theo tiêu đề
 *     description: Truy xuất danh sách các địa điểm phù hợp với tiêu đề đã cung cấp.
 *                  - Khi người dùng gõ từng ký tự vào ô input tìm kiếm, API này sẽ được gọi để lấy ra địa điểm.
 *                  - Khi người dùng bấm nút tìm kiếm, API `/tours/search` sẽ được gọi.
 *     operationId: getDestinations
 *     parameters:
 *       - name: title
 *         in: query
 *         required: true
 *         description: Tiêu đề của địa điểm cần tìm
 *         schema:
 *           type: string
 *           example: "Hà Nội"
 *     responses:
 *       200:
 *         description: Danh sách các địa điểm phù hợp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Hà Nội"
 *                   slug:
 *                     type: string
 *                     example: "ha-noi"
 *                   image:
 *                     type: string
 *                     example: "https://example.com/image.jpg"
 *       400:
 *         description: Thiếu title.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Thiếu title."
 *       404:
 *         description: Không lấy được địa điểm nào.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy địa điểm nào."
 *       500:
 *         description: Có lỗi xảy ra khi lấy danh sách địa điểm.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra khi lấy danh sách địa điểm."
 */

// [GET] /destination/
module.exports.index = async (req, res) => {
  const title = req.query.title;

  if (title) {
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

    return res.status(200).json(destination);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách địa điểm.'
    });
  }
};

/**
 * @swagger
 * /destination/getTree:
 *   get:
 *     summary: Lấy danh sách điểm đến (destination) dưới dạng cây (tree structure).
 *     description: API này trả về danh sách các điểm đến dưới dạng cây, bao gồm các thông tin chi tiết như id, tiêu đề, hình ảnh, thông tin bổ sung, trạng thái và các con trực thuộc (children).
 *     tags:
 *       - Destination
 *     responses:
 *       200:
 *         description: Danh sách điểm đến dạng cây.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID của điểm đến.
 *                     example: 1
 *                   title:
 *                     type: string
 *                     description: Tiêu đề của điểm đến.
 *                     example: "Đà Nẵng"
 *                   image:
 *                     type: string
 *                     description: URL hình ảnh của điểm đến.
 *                     example: "https://example.com/danang.jpg"
 *                   information:
 *                     type: string
 *                     description: Thông tin chi tiết của điểm đến.
 *                     example: "Một thành phố du lịch nổi tiếng tại miền Trung Việt Nam."
 *                   status:
 *                     type: boolean
 *                     description: Trạng thái hoạt động của điểm đến.
 *                     example: true
 *                   parentId:
 *                     type: integer
 *                     description: ID của điểm đến cha.
 *                     example: null
 *                   children:
 *                     type: array
 *                     description: Danh sách các điểm đến con.
 *                     items:
 *                       $ref: '#/components/schemas/DestinationTreeNode'
 *       400:
 *         description: Danh sách destination rỗng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh sách destination rỗng"
 *       500:
 *         description: Lỗi server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi lấy danh sách destination dạng tree"
 *
 * components:
 *   schemas:
 *     DestinationTreeNode:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID của điểm đến.
 *         title:
 *           type: string
 *           description: Tiêu đề của điểm đến.
 *         image:
 *           type: string
 *           description: URL hình ảnh của điểm đến.
 *         information:
 *           type: string
 *           description: Thông tin chi tiết của điểm đến.
 *         status:
 *           type: boolean
 *           description: Trạng thái hoạt động của điểm đến.
 *         parentId:
 *           type: integer
 *           description: ID của điểm đến cha.
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DestinationTreeNode'
 */

// [GET] /destination/getTree
module.exports.getTree = async (req, res) => {
  try {
    const data = await Destination.findAll({
      where: {
        deleted: false,
      }
    })
    if (data.length == 0) {
      return res.status(400).json({
        message: "Danh sách destination rỗng"
      })
    }
    const tree = createTreeHelper(data)
    const formatChildren = (node) => {
      return {
        id: node.dataValues.id,
        title: node.dataValues.title,
        image: node.dataValues.image,
        slug: node.dataValues.slug,
        information: node.dataValues.information,
        status: node.dataValues.status,
        parentId: node.dataValues.parentId,
        children: node.children ? node.children.map(formatChildren) : []
      };
    };

    const formattedTree = tree.map(formatChildren);

    res.status(200).json(formattedTree);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi lấy danh sách destination dạng tree"
    })
  }
}
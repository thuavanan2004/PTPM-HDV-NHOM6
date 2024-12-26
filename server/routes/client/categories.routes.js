const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/client/categories.controller");

router.get("/", controllers.index);

module.exports = router;
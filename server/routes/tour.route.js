const express = require("express");
const router = express.Router();

const controllers = require("../controllers/tour.controller");

// router.get("/", controllers.index);

router.get("/:slugCategory", controllers.category);

module.exports = router;
const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/client/tour.controller");

// router.get("/", controllers.index);

router.get("/detail/:slug", controllers.detail);

router.get("/feature", controllers.feature);

router.get("/flash-sale", controllers.flashSale)

router.get("/:slug", controllers.getTour);



module.exports = router;
const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/client/destination.controller");


router.get("/", controllers.index);

router.get("/getTree", controllers.getTree);


module.exports = router;
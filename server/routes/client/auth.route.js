const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/client/auth.controller");

router.post("/register", controllers.register);

router.post("/login", controllers.login);

router.post("/refresh-token", controllers.refreshToken)

router.get("/logout", controllers.logout);



module.exports = router;
const tourRoutes = require("./tour.route");


module.exports = (app) => {

  app.use("/tours", tourRoutes)
};
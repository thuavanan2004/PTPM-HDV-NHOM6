const tourRoutes = require("./tours.route");


const adminRoutes = (app) => {
  const version = 'api';

  app.use(version + '/tours', tourRoutes);
}
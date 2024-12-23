const swaggerJsDoc = require("swagger-jsdoc");

// Cấu hình cho Swagger
const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "API Tour Du Lịch",
    version: "1.0.11",
    description: "Đây là tất cả các endpoint của tour du lịch",
    contact: {
      email: "apiteam@swagger.io",
    },
    license: {
      name: "Apache 2.0",
      url: "http://www.apache.org/licenses/LICENSE-2.0.html",
    },
  },
  servers: [{
    url: "http://localhost:5000/api/client",
    description: "Local server",
  }, ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{
    BearerAuth: [],
  }, ],
};

// Tùy chọn cho swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ["./controllers/client/*.js"],
};

const swaggerDocs = swaggerJsDoc(options);

module.exports = swaggerDocs;
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const clientRoutes = require("./routes/client/index");
const sequelize = require("./config/database");
const srapeData = require("./scrape-data/index");
const cron = require('node-cron');


sequelize;

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cookieParser());

cron.schedule("0 20 * * *", () => {
  console.log("Bắt đầu cào dữ liệu...");

  srapeData.srape()
    .then(() => console.log("Cào dữ liệu hoàn tất"))
    .catch(error => console.log("Lỗi khi cào dữ liệu:", error));
});
clientRoutes(app);

app.listen(port, () => {
  console.log(`App đang lắng nghe trên cổng ${port}`)
})
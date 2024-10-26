const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const allRoute = require("./routes/index");
const sequelize = require("./config/database");
const srapeData = require("./scrape-data/index");
const cron = require('node-cron');


sequelize;

const app = express();
const port = process.env.PORT;

cron.schedule("0 20 * * *", () => {
  console.log("Bắt đầu cào dữ liệu...");

  srapeData.srape()
    .then(() => console.log("Cào dữ liệu hoàn tất"))
    .catch(error => console.log("Lỗi khi cào dữ liệu:", error));
});

allRoute(app);

app.listen(port, () => {
  console.log(`App đang lắng nghe trên cổng ${port}`)
})
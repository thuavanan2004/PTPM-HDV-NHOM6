const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const allRoute = require("./routes/index");
const sequelize = require("./config/database");
const srapeData = require("./scrape-data/index");

sequelize;

const app = express();
const port = process.env.PORT;

srapeData.srape();

allRoute(app);

app.listen(port, () => {
  console.log(`App đang lắng nghe trên cổng ${port}`)
})
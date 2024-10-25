const {
  DataTypes
} = require("sequelize");
const sequelize = require("../config/database");


const Tour = sequelize.define("Tour", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(10),
    unique: true
  },
  image: {
    type: DataTypes.STRING(255)
  },
  price: {
    type: DataTypes.STRING(20)
  },
  transportation: {
    type: DataTypes.STRING(255)
  },
  timeStart: {
    type: DataTypes.TEXT
  },
  dayStay: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tourDeparture: {
    type: DataTypes.STRING(255)
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: "tours",
  timestamps: true,
})


module.exports = Tour;
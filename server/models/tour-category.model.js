const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const TourCategory = sequelize.define('TourCategory', {
  tour_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'tours_categories',
  timestamps: false
});


module.exports = TourCategory;
const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const Departure = sequelize.define('Departure', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    unique: true
  }
}, {
  tableName: 'departure',
  timestamps: false
});


module.exports = Departure;
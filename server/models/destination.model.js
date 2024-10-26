const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database');

const Destination = sequelize.define('Destination', {
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
  tableName: 'destination',
  timestamps: false
});


module.exports = Destination;
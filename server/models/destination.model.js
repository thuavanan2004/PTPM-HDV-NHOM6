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
    unique: true,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(255)
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  information: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
  },
  deletedBy: {
    type: DataTypes.INTEGER,
  },
  parentId: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: 'destination',
  timestamps: true
});


module.exports = Destination;
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
    type: DataTypes.INTEGER
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
  destinationId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'destination',
      key: 'id'
    },
    allowNull: false
  },
  transportationId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'transportation',
      key: 'id'
    },
    allowNull: false
  },
  departureId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'departure',
      key: 'id'
    },
    allowNull: false
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

Tour.associate = (models) => {
  Tour.belongsTo(models.Departure, {
    foreignKey: 'departure_id'
  });
  Tour.belongsTo(models.Destination, {
    foreignKey: 'destination_id'
  });
  Tour.belongsTo(models.Transportation, {
    foreignKey: 'transportation_id'
  });
};


module.exports = Tour;
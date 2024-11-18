'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Firm extends Model {
    static associate(models) {
      Firm.hasMany(models.Contact, {
        foreignKey: 'firmId',
        as: 'contacts',
      });
    }
  }

  Firm.init(
    {
      name: DataTypes.STRING,
      city: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Firm',
    }
  );

  return Firm;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      Contact.belongsTo(models.Firm, {
        foreignKey: 'firmId',
        as: 'firm',
      });
    }
  }

  Contact.init(
    {
      firmId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Contact',
    }
  );

  return Contact;
};

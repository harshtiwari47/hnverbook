import {
   Model,
   DataTypes
} from 'sequelize';

import sequelize from '../database.js';

import {
   User
} from '../models/user.js';

export class Observer extends Model {}

Observer.init({
   id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
   },
   observerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: User,
         key: 'user_id'
      }
   },
   observingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: User,
         key: 'user_id'
      }
   },
   createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
   }
}, {
   sequelize,
   modelName: 'Observer',
   underscored: true,
   timestamps: true
});

User.hasMany(Observer, {
   foreignKey: 'observer_id'
});

User.hasMany(Observer, {
   foreignKey: 'observing_id'
});
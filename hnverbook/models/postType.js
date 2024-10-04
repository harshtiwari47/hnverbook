import {
   Model,
   DataTypes
} from 'sequelize';
import sequelize from '../database.js';

import {
   User
} from '../models/user.js';
import {
   Posts
} from '../models/posts.js';

class Blip extends Model {}

Blip.init({
   typeId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
   },
   postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: Posts,
         key: 'post_id'
      }
   },
   userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: User,
         key: 'user_id'
      }
   },
   description: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: 'TEXT',
      validate: {
         len: [0, 250]
      }
   }
}, {
   sequelize,
   modelName: 'blip',
   underscored: true,
   timestamps: false
});

Posts.hasOne(Blip, {
   foreignKey: 'post_id'
});

Blip.belongsTo(Posts, {
   foreignKey: 'post_id'
});

export {
   Blip
}
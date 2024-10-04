import {
   Model,
   DataTypes
} from 'sequelize';
import sequelize from '../database.js';

class User extends Model {}

User.init({
   userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
   },
   username: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: true,
      validate: {
         is: /^[0-9a-z_]+$/ // Only allows alphanumeric characters and underscores
      }
   },
   name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "HnverUser"
   },
   email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
         isEmail: true
      }
   },
   password: {
      type: DataTypes.STRING(64),
      allowNull: false,
   },
   verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
   },
   authVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
   },
   location: {
      type: DataTypes.STRING,
      allowNull: true
   },
   description: {
      type: DataTypes.STRING(125),
      allowNull: true
   },
   avatar: {
      type: DataTypes.STRING,
      defaultValue: 'user'
   },
   banner: {
      type: DataTypes.STRING,
      defaultValue: '#000'
   },
   link: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
         isUrl: {
            msg: "Must be a valid URL"
         }
      }
   },
   joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'joined_at' // Use snake_case for the database field
   },
   refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
   }
}, {
   sequelize,
   modelName: 'user',
   underscored: true,
   // Use snake_case for column names
   timestamps: true // Automatically manage createdAt and updatedAt
});

export {
   User
};
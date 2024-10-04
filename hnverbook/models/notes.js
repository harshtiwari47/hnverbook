import {
   Model,
   DataTypes
} from 'sequelize';

import sequelize from '../database.js';

import {
   User
} from '../models/user.js';

export class Spaces extends Model {}

Spaces.init({
   spaceId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
   },
   userId: {
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
   },
   updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
   },
   title: {
      type: DataTypes.STRING(24),
      allowNull: false,
      validate: {
         len: [1, 24]
      }
   },
   color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#4478f1",
      validate: {
         len: [3, 20]
      }
   },
   description: {
      type: DataTypes.STRING(75),
      allowNull: true,
      validate: {
         len: [1, 75]
      }
   }
}, {
   sequelize,
   modelName: 'spaces',
   underscored: true,
   timestamps: true
});

User.hasMany(Spaces, {
   foreignKey: 'user_id'
});

Spaces.belongsTo(User, {
   foreignKey: 'user_id'
});

export class Notes extends Model {}

Notes.init({
   noteId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
   },
   spaceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: Spaces,
         key: 'space_id'
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
   createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
   },
   updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
   },
   title: {
      type: DataTypes.STRING(115),
      allowNull: false,
      validate: {
         len: [1, 115]
      }
   },
   bgColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#d6dff4",
      validate: {
         len: [3, 20]
      }
   },
   textColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#01091c",
      validate: {
         len: [3, 20]
      }
   },
   note: {
      type: DataTypes.STRING(1999),
      allowNull: false,
      validate: {
         len: [1, 1999]
      }
   }
}, {
   sequelize,
   modelName: 'notes',
   underscored: true,
   timestamps: true
});

Spaces.hasMany(Notes, {
   foreignKey: 'space_id'
});

Notes.belongsTo(Spaces, {
   foreignKey: 'space_id'
});
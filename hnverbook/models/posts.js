import {
   Model,
   DataTypes
} from 'sequelize';
import sequelize from '../database.js';

import {
   User
} from '../models/user.js';

class Posts extends Model {}

Posts.init({
   postId: {
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
      },
      field: 'user_id'
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
   type: {
      type: DataTypes.ENUM,
      values: ['blip', 'media', 'blog', 'events', 'storyboard', 'discussion','interactive'],
      allowNull: false,
      defaultValue: 'blog'
   },
   title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
         len: [1, 100]
      }
   },
   keywords: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
         len: [1, 200]
      }
   },
   location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'GLOBAL',
      validate: {
         len: [1, 100]
      }
   }
}, {
   sequelize,
   modelName: 'posts',
   underscored: true, // Use snake_case for column names
   timestamps: true // Automatically manage createdAt and updatedAt
});

User.hasMany(Posts, {
   foreignKey: 'user_id'
});

Posts.belongsTo(User, {
   foreignKey: 'user_id'
});

class Like extends Model {}

Like.init({
   likeId: {
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
      },
      field: 'user_id'
   },
   postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: Posts,
         key: 'post_id'
      },
      field: 'post_id'
   }
}, {
   sequelize,
   modelName: 'like',
   underscored: true,
});

Posts.hasMany(Like, {
   foreignKey: 'post_id'
});

Like.belongsTo(Posts, {
   foreignKey: 'post_id'
});

class Comment extends Model {}

Comment.init({
   commentId: {
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
      },
      field: 'user_id'
   },
   postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: Posts,
         key: 'post_id'
      },
      field: 'post_id'
   },
   content: {
      type: DataTypes.TEXT,
      allowNull: false
   },
   createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
   }
}, {
   sequelize,
   modelName: 'comment',
   underscored: true,
   timestamps: false
});

Posts.hasMany(Comment, {
   foreignKey: 'post_id'
});

Comment.belongsTo(Posts, {
   foreignKey: 'post_id'
});

class Share extends Model {}

Share.init({
   shareId: {
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
      },
      field: 'user_id'
   },
   postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: Posts,
         key: 'post_id'
      },
      field: 'post_id'
   },
   sharedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'shared_at'
   }
}, {
   sequelize,
   modelName: 'share',
   underscored: true,
   timestamps: false
});

Posts.hasMany(Share, {
   foreignKey: 'post_id'
});

Share.belongsTo(Posts, {
   foreignKey: 'post_id'
});

class Save extends Model {}

Save.init({
   saveId: {
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
      },
      field: 'user_id'
   },
   postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: Posts,
         key: 'post_id'
      },
      field: 'post_id'
   },
   savedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'saved_at'
   }
}, {
   sequelize,
   modelName: 'save',
   underscored: true,
   timestamps: false
});

Posts.hasMany(Save, {
   foreignKey: 'post_id'
});

Save.belongsTo(Posts, {
   foreignKey: 'post_id'
});

export {
   Posts,
   Comment,
   Like,
   Share,
   Save
}
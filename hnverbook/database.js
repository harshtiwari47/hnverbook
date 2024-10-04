import {
   Sequelize
} from 'sequelize';

const sequelize = new Sequelize('database', 'user', 'pass', {
   dialect: 'sqlite',
   host: './db.sqlite',
   logging: false
});

export default sequelize;
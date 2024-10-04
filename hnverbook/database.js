import "dotenv/config.js";

/*
const sequelize = new Sequelize('database', 'user', 'pass', {
   dialect: 'sqlite',
   host: './db.sqlite',
   logging: false
});

export default sequelize; */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('HnverBook', 'avnadmin', process.env.DB_PASSWORD, {
   dialect: 'mysql',
   host: 'hnverbook-tiwariharsh512-601f.h.aivencloud.com',
   port: process.env.DB_PORT,
   dialectOptions: {
     ssl: {
       rejectUnauthorized: false
     }
   },
   logging: false 
});

export default sequelize;
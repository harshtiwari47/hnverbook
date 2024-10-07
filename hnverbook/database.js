import "dotenv/config.js";
import { Sequelize } from 'sequelize';

let sequelize;
try {
 /*
 sequelize = new Sequelize('database', 'user', 'pass', {
   dialect: 'sqlite',
   host: './db.sqlite',
   logging: true
});
*/ 

 sequelize = new Sequelize('HnverBook', 'avnadmin', process.env.DB_PASSWORD, {
   dialect: 'mysql',
   host: process.env.DB_HOST,
   port: process.env.DB_PORT,
   dialectOptions: {
     ssl: {
       rejectUnauthorized: false
     }
   },
   logging: false 
});

} catch (e) {
   console.error('failed to connect database!', e)
}
export default sequelize;
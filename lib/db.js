const Bluebird = require("bluebird");
const mysql = require("mysql");

Bluebird.promisifyAll(require("mysql/lib/Connection").prototype);
Bluebird.promisifyAll(require("mysql/lib/Pool").prototype);

let pool = null;

module.exports = {
  getPool: () => {
    if (!pool) {
      const config = {
        user: process.env.MYSQL_USER,
        host: process.env.MYSQL_HOST,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      };

      pool = mysql.createPool(Object.assign({
        connectionLimit: 10
      }, config));
    }

    return pool;
  }
};

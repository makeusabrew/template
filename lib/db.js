const config = require("./config");
const Bluebird = require("bluebird");
const mysql = require("mysql");

Bluebird.promisifyAll(require("mysql/lib/Connection").prototype);
Bluebird.promisifyAll(require("mysql/lib/Pool").prototype);

let pool = null;

module.exports = {
  getPool: () => {
    if (!pool) {
      pool = mysql.createPool(Object.assign({
        connectionLimit: 10
      }, config.mysql));
    }

    return pool;
  }
};

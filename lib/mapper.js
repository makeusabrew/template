const Db = require("./db");
const Bluebird = require("bluebird");
const debug = require("debug")("lib:db:mapper");
const _ = require("lodash");

// @TODO baked in reviver / replacer logic?

class Mapper {
  constructor(db) {
    this.db = db || Db.getPool();
    this.name = this.constructor.name;
  }

  table() {
    return null;
  }

  pkey() {
    return "id";
  }

  query(sql, params) {
    debug("%s:query - %s", this.name, sql, JSON.stringify(params));
    return this.db.queryAsync(sql, params);
  }

  get(id) {
    const pkey = this.pkey();

    return this.read(`${pkey} = ?`, [id]);
  }

  create(object) {
    return this.query(`INSERT INTO ${this.table()} SET ?`, object)
    .then(result => {
      debug("INSERT result:", result);
      // on the fence with this change. I don't like having to make an extra query
      // but having fresh columns (and default data) pulled from the database is appealing
      // and keeps thinks consistant.
      // @TODO: decide if this should stay
      return this.get(object.id || result.insertId);
    });
  }

  findOne(params) {

    const criteria = _.map(_.keys(params), key => {
      return key + " = ?";
    });

    return this.read(criteria.join(" AND "), _.values(params));
  }

  update() {
  }

  delete() {
  }

  insert(sql, params, expectedRows = 1) {

    return this.query(sql, params)
    .then(result => {
      if (result.affectedRows !== expectedRows) {
        throw new Error(`Unexpected number of rows affected, ${result.affectedRows} instead of ${expectedRows}`);
      }
      if (expectedRows === 1) {
        return result.insertId;
      }
    });
  }

  _prepareRead(sql, params) {
    if (!params && typeof sql === "object") {
      params = sql;
      sql = "?";
    }
    return this.query(`SELECT * FROM ${this.table()} WHERE ${sql}`, params);
  }

  read(sql, params) {
    return this._prepareRead(sql, params)
    .then(rows => {
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    });
  }

  readAll(sql, params) {
    return this._prepareRead(sql, params)
    .then(rows => {
      debug("%s:readAll - row length %d", this.name, rows.length);
      return rows;
    });
  }

  startTx() {
    return Bluebird.using(this.getConnection(), conn => conn.beginTransactionAsync());
  }

  tx(callback) {
    return this.startTx()
    // from starting a TX we have a connection object, scoped to the TX itself.
    .then(conn => {
      // So, pass that back to the callback (userland) and let it do whatever it wants; presumably
      // a series of queries...
      return callback((sql, params) => conn.queryAsync(sql, params), conn)
      .then(response => {
        return conn.commitAsync()
        .then(() => {
          // and finally, return the callback's response (not the result from the commit)
          return response;
        });
      })
      .catch(e => {
        // if anything in the chain goes wrong, abort and re-throw
        return conn.rollbackAsync()
        .then(() => {
          throw e;
        });
      });
    });
  }

  getConnection() {
    return this.db.getConnectionAsync().disposer(conn => conn.release());
  }
}

module.exports = Mapper;

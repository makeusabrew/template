const Bluebird = require("bluebird");
const debug = require("debug")("lib:controller");

const error = (message, status) => {
  debug(`Creating error '${message}' (${status})`);
  // using an empty object {} as the first arg here doesn't
  // properly map the new Error values onto it
  return Object.assign(new Error(message), {
    status
  });
};

class BaseController {
  run(method, req, res, next) {
    // methods are only ever passed the request and response,
    // never 'next'. If they need to invoke an error, they
    // just throw new Error("whatever");

    // in theory, we can probably get away with just passing `req`
    // and forcing controllers to always just return their final
    // response.

    const name = this.constructor.name;

    return Bluebird.resolve()
    .then(() => {
      debug("%s:%s call", name, method);
      return this[method].call(this, req, res);
    })
    .then(response => {
      debug("%s:%s end", name, method);
      return response;
    })
    .catch(e => {
      debug("%s:%s error", name, method);

      if (e.status) {
        debug("Dispatching %s %s", e.status, e.message);
        return res.status(e.status).send(e.message);
      }

      return next(e);
    });
  }

  static factory(method) {
    return (req, res, next) => {
      const ctrl = new this();
      return ctrl.run(method, req, res, next);
    };
  }

  static NotFoundError(message) {
    return error(message, 404);
  }
}

module.exports = BaseController;

const swig = require("swig");
const express = require("express");
const debug = require("debug")("server:index");
const session = require("express-session");

module.exports = {
  start: () => {
    const app = express();

    const routes = require("./routes");

    app.engine("html", swig.renderFile);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");
    app.set("view cache", false);
    app.set("trust proxy", 1);
    app.use(session({
      secret: "__TODO__",
      resave: false,
      saveUninitialized: false
    }));

    routes.load(app);

    app.use((err, req, res, next) => {  // eslint-disable-line no-unused-vars
      debug("Trapped error", err);
      return res.status(500).send("Internal server error");
    });

    app.listen(7777, () => {
      debug("Server listening on port 7777");
    });
  }
};

if (process.env.NODE_ENV !== "test") {
  module.exports.start();
}

const HomeController = require("../controller/home");

module.exports = {
  load: app => {
    app.get("/", HomeController.factory("index"));
  }
};

const Controller = require("../../../lib/controller");

class HomeController extends Controller {
  index(req, res) {
    const user = req.session.user;
    return res.render("index", { user });
  }
}

module.exports = HomeController;

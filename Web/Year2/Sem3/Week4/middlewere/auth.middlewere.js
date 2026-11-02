const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, "coding");
    next();
  } catch (error) {
    res.send({ msg: "Login First" });
  }
};

module.exports = { auth };

const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", ""); //this is the token that was saved in the header
    const secretKey = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secretKey, (err, decoded) =>
      err ? err.message : decoded,
    ); //this is the decoded token with the id key
    const admin = await Admin.findOne({
      _id: decoded._id,
      "tokens.token": token,
    }); //this is looking for a specific admin that has the authentication token stored that we are comparing
    if (!admin) {
      throw new Error();
    }
    req.token = token;
    req.admin = admin;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Autheniticate!" });
  }
};

module.exports = auth;

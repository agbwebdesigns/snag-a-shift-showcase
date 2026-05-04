const jwt = require("jsonwebtoken");
const Employee = require("../models/employee");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const secretKey = process.env.JWT_SECRET;

    // Verify token
    let decoded;
    try {
      //verify the access token
      decoded = jwt.verify(token, secretKey);
    } catch (err) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    // Find employee based on decoded token
    const employee = await Employee.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!employee) {
      return res
        .status(401)
        .json({ message: "Employee not found. Please authenticate." });
    }

    req.token = token;
    req.employee = employee;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Please authenticate!" });
  }
};

module.exports = auth;

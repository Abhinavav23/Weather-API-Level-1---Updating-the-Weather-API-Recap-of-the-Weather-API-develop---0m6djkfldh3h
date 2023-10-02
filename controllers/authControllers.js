const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = "newtonSchool";

const decodeToken = (req, res, next) => {
  try {
    let { token } = req.body;
    console.log(token);
    const decodedToken = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ payload: decodedToken, status: "Success" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Function for user signup
const signup = async (req, res, next) => {
  try {
    // Extract user data from the request body (e.g., username, email, password)
    const { username, email, password } = req.body;
    // Create a new user instance using the User model
    const user = new User({ username, email, password });
    // Save the user to the database
    await user.save();
    // Handle success and send a success response with user data
    res.status(201).json({
      message: "User created successfully",
      data: {
        user,
      },
    });
    // Handle errors and send an error response
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Function for user login
const login = async (req, res, next) => {
  try {
    // Extract user credentials from the request body (e.g., email, password)
    const { email, password } = req.body;
    // Check if both email and password are provided; if not, send an error response
    if (email === "" || password === "") {
      res.status(401).json({
        message: "please enter username or password",
        status: "Error",
        error: "Invalid Credentials",
      });
    }
    // Find the user in the database by their email
    try {
      const user = await User.findOne({ email });
      console.log('user', user);
      if (user) {
        // Compare the provided password with the stored password using bcrypt
        const isMatched = bcrypt.compareSync(password, user.password);
        if (isMatched) {
           // If passwords match, generate a JWT token with user information
           const token = jwt.sign({id: user._id, email: user.email}, JWT_SECRET);
           // Send the token in the response
           res.status(200).send({status: "success", token})
        } else {
          // If passwords do not match, send an error response
          res.status(401).json({
            message: "Invalid email or password",
            status: "Error",
            error: "Invalid Credentials",
          });
        }
      }else{
        res.status(401).json({
          message: "Invalid email or password",
          status: "Error",
          error: "Invalid Credentials",
        });
      }
    } catch (err) {
      console.log('err', err);
      // If the user is not found, send an error response
      res.status(401).json({
        message: "Invalid email or password",
        status: "Error",
        error: "Invalid Credentials",
      });
    }
    
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports = { login, signup, decodeToken };

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const {signupValidation,loginValidation}=require("../Validations/validation");
const dotEnv=require("dotenv");
dotEnv.config();
// Register a new user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const {error}=signupValidation(req.body);
  // console.log("..");
   if(error){
       return res.status(400).send(error.details[0].message);
     }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user and generate JWT
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const {error}=loginValidation(req.body);
  // console.log("..");
   if(error){
       return res.status(400).send(error.details[0].message);
     }
     
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    //const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });

    const token=jwt.sign({
        _id:user._id
       },process.env.TOKEN_SECRET);
       res.setHeader('auth-token',token);
       res.status(200).json({ token });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};

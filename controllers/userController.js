import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
   const { username, email, password } = req.body;

    if (!username || !email || !password) {
    throw new Error("Please fill all the fields");
  }
 //data base se talk mtlb async and await use kro 
   const userExists = await User.findOne({ email });
  if (userExists) res.status(400).send("User already exists");

 // Hash the user password
//  - Why it's important: A salt is a random string added to the password 
//  before hashing. It makes each hash unique—even if two users have the 
//  same password.
// Storing plain-text passwords is extremely dangerous.
//  Hashing turns the password into a fixed-length, irreversible string

  const salt = await bcrypt.genSalt(10);
//   Why This Is Used
// This is part of a secure user registration system. Here's the flow:
// - User submits a form with username, email, and password.
// - You hash the password before saving it.
// - You store the hashed password in the database.
// - Later, during login, you’ll use bcrypt.compare() to check if the entered password matches the stored hash.

  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ username, email, password: hashedPassword });



  try {
    await newUser.save();
    createToken(res, newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});


// [User Registers]
//  ↓
// [Password is salted + hashed with bcrypt]
//  ↓
// [Stored in DB as hashedPassword]

// [User Logs In]
//  ↓
// [Entered password is compared with hashedPassword using bcrypt.compare()]
//  ↓
// [If match → Login success ✅ | Else → Error ❌]

//THIS FUNCTION IS FOR LOGIN THE USER 
const loginUser = asyncHandler(async (req, res) => {

 const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (isPasswordValid) {
      createToken(res, existingUser._id);

      res.status(201).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      });
    } else {
      res.status(401).json({ message: "Invalid Password" });
    }
  } else {
    res.status(401).json({ message: "User not found" });
  }
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
};
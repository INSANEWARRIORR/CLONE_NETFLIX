import { User } from "../models/userModel.js";
import bcryptjs from "bcryptjs"; // it is used for converting plane text into hashed
import jwt from "jsonwebtoken";

//Login Page
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Invalid data",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // for matching encrypt(hashed) password and simple password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    //if password and encrypt(hashed) password matches
    const tokenData = {
      id: user._id,
    };
    const token = await jwt.sign(tokenData, "gtawfwhwvsnabdaghpp", {
      expiresIn: "1h",
    });
    return res
      .status(200)
      .cookie("token", token, { httpOnly: true })
      .json({
        message: `Welcome back ${user.fullName}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
  }
};

//Logout Credential
export const Logout = async (req, res) => {
  return res
    .status(200)
    .cookie("token", "", { expiresIn: new Date(Date.now()), httpOnly: true }) // making token empty after logout
    .json({
      message: "User logged out successfully.",
      success: true,
    });
};

// Sign Up Credential
export const Register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    //if user details is not matched
    if (!fullName || !email || !password) {
      return res.status(401).json({
        message: "Invalid Data",
        success: false,
      });
    }

    // if mail is already registered
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "This email is already used",
        success: false,
      });
    }

    // For hiding the password
    const hashedPassword = await bcryptjs.hash(password, 16);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    //account created message
    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

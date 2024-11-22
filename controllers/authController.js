const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
// Registration
exports.registerUser = async (req, res) => {
  const { username, email, password, referralCode } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userReferralCode = username.slice(0, 4) + Date.now().toString(36);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      referralCode: userReferralCode,
      referredBy: referralCode || null,
    });

    const savedUser = await newUser.save();

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrer.referralList.push(savedUser._id);
        await referrer.save();
      }
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "10h" });

    res.status(201).json({
      message: "Registration successful",
      referralCode: userReferralCode,
      token, 
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
};
// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "10h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};





exports.getUserDetailsWithReferrals = async (req, res) => {
  try {
    const userId = req.user.userId; 

    const userWithReferrals = await User.aggregate([

      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
  
      {
        $lookup: {
          from: "users", 
          localField: "referralList", 
          foreignField: "_id",
          as: "referrals",
        },
      },
      {
        $project: {
          password: 0, 
          "referrals.password": 0,
          "referrals.createdAt": 0,
          "referrals.updatedAt": 0,
        },
      },
    ]);

    if (!userWithReferrals || userWithReferrals.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userWithReferrals[0]); 
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user details", details: error.message });
  }
};


const getUserWithReferrals = async (userId) => {
  const user = await User.findById(userId)
    .select('username email referralList') 
    .lean(); 

  if (!user) return null;

  const referrals = await Promise.all(
    user.referralList.map(async (referralId) => {
      return await getUserWithReferrals(referralId);
    })
  );

  return {
    username: user.username,
    email: user.email,
    referrals,
  };
};



exports.getAllUsersWithRecursiveReferrals = async (req, res) => {
  try {
   
    const allUsers = await User.find().select('username email _id'); 


    const usersWithReferrals = await Promise.all(
      allUsers.map(async (user) => {
        return await getUserWithReferrals(user._id);
      })
    );

    res.status(200).json({
      message: "All users with their referrals (recursive)",
      data: usersWithReferrals,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
};



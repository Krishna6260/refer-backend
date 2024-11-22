const User = require("../models/User");


exports.getReferralList = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("referralList", "username email");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ referralList: user.referralList });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch referrals", details: error.message });
  }
};

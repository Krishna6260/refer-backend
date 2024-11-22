const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { getReferralList } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getUserDetailsWithReferrals } = require("../controllers/authController");
const { getAllUsersWithRecursiveReferrals } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/referrals", authMiddleware, getReferralList);
router.get("/mydetails", authMiddleware, getUserDetailsWithReferrals);
router.get("/alllist",authMiddleware, getAllUsersWithRecursiveReferrals);


module.exports = router;

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    referralCode: {
        type: String,
        unique: true
    },
    referredBy: {
        type: String,
        default: null
    },
    referralList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
});

module.exports = mongoose.model("User", userSchema);

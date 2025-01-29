const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: [8, "Password should be at least 8 characters long."],
        },
    },
    {
        timestamps: true,
    },
);
userSchema.pre("save", async function (next) {
    if (!this.isModified) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

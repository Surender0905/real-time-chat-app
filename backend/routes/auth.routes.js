require("dotenv").config();
const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({
            success: false,
            message: "Username and password are required.",
        });
    }
    try {
        const exitingUser = await User.findOne({ username });

        if (exitingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists.",
            });
        }

        const user = await User.create({ username, password });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.status(201).json({
            success: true,
            message: "User created successfully.",
            username,
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({
            success: false,
            message: "Username and password are required.",
        });
    }
    try {
        const user = await User.findOne({ username });

        if (!user) {
            res.status(400).json({
                success: false,
                message: "User does not exist.",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            res.status(400).json({
                success: false,
                message: "Incorrect password.",
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(200).json({
            success: true,
            message: "User logged in successfully.",
            username,
            id: user._id,
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;

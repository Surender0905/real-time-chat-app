require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const authRouter = require("./routes/auth.routes");

app.use(cors());
app.use(express.json());

const connect = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/ChatApp");
        console.log("Connected to MongoDB");
    } catch (error) {
        throw error;
    }
};

//health check
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/auth", authRouter);

// app.use("/api/conversations", require("./routes/conversations"));
// app.use("/api/messages", require("./routes/messages"));

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

app.listen(8800, () => {
    connect();
    console.log("Connected to backend!");
});

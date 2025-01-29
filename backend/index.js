require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const cors = require("cors");
const authRouter = require("./routes/auth.routes");
const Message = require("./models/Messages");

const app = express();
//http server
const httpServer = createServer(app);
//socket server
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

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

//socket logic
io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on("send-message", async (data) => {
        const { senderId, receiverId, text } = data;
        try {
            const message = new Message({
                sender: senderId,
                receiver: receiverId,
                text,
            });
            await message.save();
        } catch (error) {
            console.log(error);
        }

        socket.broadcast.emit("receive-message", data);
    });

    socket.on("disconnect", () => {
        console.log("a user disconnected", socket.id);
    });
});

app.get("/api/messages", async (req, res) => {
    const { senderId, receiverId } = req.query;
    try {
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

httpServer.listen(8800, () => {
    connect();
    console.log("Connected to backend!");
});

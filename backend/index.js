require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const cors = require("cors");
const authRouter = require("./routes/auth.routes");
const Message = require("./models/Messages");
const User = require("./models/User");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();
//http server
const httpServer = createServer(app);
//socket server
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
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

let users = {};
//socket logic
io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    // Listen for a user joining the chat
    socket.on("joinChat", (userId) => {
        console.log(`${userId} has joined the chat`);
        users[userId] = socket.id; // Map user to socket id
    });
    socket.on("send-message", async (data) => {
        const { sender, receiver, text } = data;
        console.log(data, "socket");
        try {
            const message = new Message({
                sender,
                receiver,
                text,
            });
            await message.save();
        } catch (error) {
            console.log(error);
        }

        // Emit the message to the recipient
        if (users[receiver]) {
            io.to(users[receiver]).emit("receiveMessage", messageData);
        }
        socket.broadcast.emit("receive-message", data);
    });

    // socket.on("disconnect", () => {
    //     console.log("a user disconnected", socket.id);
    // });

    // Handle user disconnecting
    socket.on("disconnect", () => {
        console.log("a user disconnected", socket.id);
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId]; // Remove the user from the users list
                break;
            }
        }
    });
});

app.get("/api/messages", authMiddleware, async (req, res) => {
    const { senderId, receiverId } = req.query;

    try {
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        })
            .populate("sender")
            .populate("receiver")
            .sort({ createdAt: 1 });

        console.log(messages, "server");
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/users", authMiddleware, async (req, res) => {
    try {
        const users = await User.find({
            username: { $ne: req.user.username },
        });
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

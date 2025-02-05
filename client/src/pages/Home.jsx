/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./ChatPage.css";

const socket = io("http://localhost:8800");
const Home = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const [users, setUsers] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");

    //fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8800/api/users",
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    },
                );

                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();

        // Listen for incoming messages
        socket.on("receive-message", (data) => {
            console.log(data, "socket");
            if (
                data.sender === currentChat._id ||
                data.receiver === currentChat._id
            ) {
                setMessages((prev) => [...prev, data]);
            }
        });

        return () => {
            socket.off("receive-message");
        };
    }, [currentChat, user.token]);

    const fetchMessages = async (receiver) => {
        try {
            const { data } = await axios.get(
                "http://localhost:8800/api/messages",
                {
                    params: { senderId: user.id, receiverId: receiver._id },
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                },
            );
            console.log(data);
            setMessages(data);
            setCurrentChat(receiver);
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const sendMessage = () => {
        const messageData = {
            sender: user.id,
            receiver: currentChat._id,
            text: currentMessage,
        };
        const sendData = {
            sender: { username: user.username },
            receiver: currentChat.username,
            text: currentMessage,
        };
        socket.emit("send-message", messageData);
        setMessages((prev) => [...prev, sendData]);
        setCurrentMessage("");
    };
    return (
        <div className="chat-container">
            <h2>Welcome, {user?.username}</h2>
            <div className="chat-list">
                <h3>Chats</h3>
                {users.map((u) => (
                    <div
                        key={u._id}
                        className={`chat-user ${
                            currentChat === u.username ? "active" : ""
                        }`}
                        onClick={() => fetchMessages(u)}
                    >
                        {u.username}
                    </div>
                ))}
            </div>

            {currentChat && (
                <div className="chat-window">
                    <h5>You are chatting with {currentChat?.username}</h5>
                    <MessageList messages={messages} user={user?.username} />
                    <div className="message-field">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={currentMessage}
                            style={{ minWidth: "400px" }}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                        />
                        <button
                            type="button"
                            style={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                marginTop: "5px",
                            }}
                            onClick={sendMessage}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;

const MessageList = ({ messages, user }) => {
    return (
        <div className="message-list">
            {messages?.map((msg, index) => (
                <div
                    key={index}
                    className={`message ${
                        msg.sender === user.username ? "sent" : "received"
                    }`}
                >
                    <strong>{msg?.sender.username}: </strong>
                    {msg.text}
                </div>
            ))}
        </div>
    );
};

import { useState } from "react";
import axios from "axios";
import "./AuthForm.css";
import { toast } from "react-toastify";

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true); // Track whether it's login or register
    const [formData, setFormData] = useState({
        username: "",

        password: "",
    });
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isLogin
            ? "http://localhost:8800/api/auth/login"
            : "http://localhost:8800/api/auth/register";
        try {
            const response = await axios.post(url, formData);
            console.log(response.data, "test");
            toast.success(response.data.message);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("id", response.data.id);
            localStorage.setItem("username", response.data.username);
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong");
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setFormData({
            username: "",
            email: "",
            password: "",
        });
        setError("");
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? "Login" : "Register"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">
                    {isLogin ? "Login" : "Register"}
                </button>
            </form>
            <p onClick={toggleForm} className="toggle-link">
                {isLogin
                    ? "Create an account"
                    : "Already have an account? Login"}
            </p>
        </div>
    );
};

export default AuthForm;

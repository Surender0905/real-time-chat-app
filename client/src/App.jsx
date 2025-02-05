import "./App.css";
import AuthForm from "./pages/Auth";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";

function App() {
    return (
        <>
            <RouteHandler />
        </>
    );
}

const RouteHandler = () => {
    const isLogin = !!localStorage.getItem("token");

    return (
        <Routes>
            <Route
                path="/auth"
                element={isLogin ? <Navigate to="/" /> : <AuthForm />}
            />
            <Route
                path="/"
                element={isLogin ? <Home /> : <Navigate to="/auth" />}
            />
        </Routes>
    );
};
export default App;

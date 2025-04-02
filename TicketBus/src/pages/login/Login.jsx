/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaDiscord, FaApple, FaRegEye, FaEyeSlash } from "react-icons/fa";
import { FaSquareTwitter } from "react-icons/fa6";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        try {
            const accessToken = localStorage.getItem("token");
            const requestBody = {
                username,
                password,
            };
            if (accessToken) {
                requestBody.access_token = accessToken;
            }
            const response = await axios.post("http://localhost:3001/login", requestBody);
            const { access_token, role } = response.data;
            localStorage.setItem("token", access_token);
            alert("Login successful!");
            if (role === "admin") {
                navigate("/admin");
            } else {
                navigate("/"); 
            }
            window.location.reload(); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
            alert("Error: " + errorMessage);
            if (errorMessage === "Invalid or expired token") {
                localStorage.removeItem("token");
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-red-100">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300">
                <h2 className="text-red-500 text-3xl font-semibold text-center mb-6">Welcome Back</h2>

                <div className="flex justify-center space-x-3 mb-4">
                    {[FaFacebook, FaGithub, FaDiscord, FaApple, FaSquareTwitter].map((Icon, index) => (
                        <button key={index} className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-red-500 hover:text-white transition">
                            <Icon />
                        </button>
                    ))}
                </div>

                <button className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-red-500 hover:text-white transition">
                    <FcGoogle className="mr-2" /> Log in with Google
                </button>

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <p className="mx-3 text-gray-500 text-sm">Or</p>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-neutral-500">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-neutral-500">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <FaRegEye size={20} /> : <FaEyeSlash size={20} />}
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" /> Keep me logged in
                        </label>
                        <Link to="/forgot-password" className="text-red-500">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
                        Log In
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Need an account? <Link to="/register" className="text-red-500 font-medium">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

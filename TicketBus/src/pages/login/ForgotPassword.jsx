import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [otpSent, setOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userId, setUserId] = useState(""); // Store userId from forgot password and OTP verification
    const [error, setError] = useState(""); // Add error state for displaying errors
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const handleSendOTP = async () => {
        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/forgot-password", { email });
            setOtpSent(true);
            setUserId(response.data.userId); // Store the userId returned from the backend
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Error sending OTP. Please try again.");
            console.error("Error sending OTP:", error);
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter a 6-digit OTP.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/verify-otp", { otp: otpCode });
            setIsOtpVerified(true);
            setUserId(response.data.userId); // Update userId in case it's needed (already set from forgot-password)
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Error verifying OTP. Please try again.");
            console.error("Error verifying OTP:", error);
        }
    };

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        let newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setError("Passwords do not match. Please try again.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/change-password", {
                userId,
                newPassword,
            });
            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            setError(error.response?.data?.message || "Error resetting password. Please try again.");
            console.error("Error resetting password:", error);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-cover bg-center bg-red-100">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300">
                {!otpSent ? (
                    <>
                        <h2 className="text-red-500 text-3xl font-semibold text-center mb-6">Forgot Password</h2>
                        <p className="text-gray-500 text-center mb-6">Enter your email address to receive a password reset OTP.</p>
                        <div className="relative mb-4">
                            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <button onClick={handleSendOTP} className="w-full bg-red-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition">
                            Send OTP
                        </button>
                    </>
                ) : !isOtpVerified ? (
                    <>
                        <h2 className="text-red-500 text-3xl font-semibold text-center mb-6">Enter OTP</h2>
                        <p className="text-gray-500 text-center mb-6">Please enter the 6-digit OTP sent to {email}.</p>
                        <div className="flex justify-center gap-2 mb-6">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    onChange={(e) => handleChange(e, index)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
                                />
                            ))}
                        </div>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <button onClick={handleVerifyOTP} className="w-full bg-red-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition">
                            Verify OTP
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-6">
                            Didn't receive OTP? <button onClick={handleSendOTP} className="text-red-500 font-medium">Resend</button>
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-red-500 text-3xl font-semibold text-center mb-6">Reset Password</h2>
                        <p className="text-gray-500 text-center mb-6">Enter your new password below.</p>
                        <div className="relative mb-4">
                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="relative mb-4">
                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <button onClick={handleResetPassword} className="w-full bg-red-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition">
                            Reset Password
                        </button>
                    </>
                )}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Remember your password? <Link to="/login" className="text-red-500 font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
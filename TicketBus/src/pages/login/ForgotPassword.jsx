import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [otpSent, setOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const inputRefs = useRef([]);

    const handleSendOTP = async () => {
        if (!email) return;

        try {
            //api thực tế
            await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            setOtpSent(true);
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            const response = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otp.join("") }),
            });

            const data = await response.json();
            if (data.success) {
                setIsOtpVerified(true);
            } else {
                alert("Invalid OTP, please try again!");
            }
        } catch (error) {
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
            alert("Passwords do not match, please try again!");
            return;
        }

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });

            const data = await response.json();
            if (data.success) {
                alert("Password reset successful!");
                window.location.href = "/login";
            } else {
                alert("An error occurred, please try again!");
            }
        } catch (error) {
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

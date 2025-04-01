import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyOtp = () => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:3001/verify-otp", {
                otp,
            });
            alert(response.data.message); 
            navigate("/login");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "OTP verification failed.";
            alert("Error: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-red-100">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300">
                <h2 className="text-red-500 text-3xl font-semibold text-center mb-6">Verify OTP</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-neutral-500">OTP Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter the OTP sent to your email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already verified?{" "}
                    <Link to="/login" className="text-red-500 font-medium">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyOtp;
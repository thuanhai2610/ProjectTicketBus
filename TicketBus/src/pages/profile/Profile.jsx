import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [avatarError, setAvatarError] = useState(false); // New state to track avatar loading errors
    const location = useLocation();
    const navigate = useNavigate();

    const BACKEND_URL = "http://localhost:3001"; 

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const username = queryParams.get("username");
                if (!username) {
                    throw new Error("Username is required");
                }
                const response = await axios.get(`http://localhost:3001/user/profile?username=${username}`);
                // Prepend the backend URL to the avatar path
                if (response.data.avatar) {
                    response.data.avatar = `${BACKEND_URL}${response.data.avatar}`;
                    console.log("Avatar URL:", response.data.avatar); // Debug the URL
                }
                const dobDate = response.data.dob ? new Date(response.data.dob) : null;
                const formattedDob = dobDate && !isNaN(dobDate.getTime())
                    ? `${dobDate.getDate().toString().padStart(2, '0')}/${(dobDate.getMonth() + 1).toString().padStart(2, '0')}/${dobDate.getFullYear()}`
                    : "Chưa cập nhật";

                // Update the profile data with the formatted dob
                const profile = {
                    ...response.data,
                    dob: formattedDob
                };
                setProfile(profile);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Không tìm thấy người dùng hoặc lỗi server!");
                setLoading(false);
            }
        };
        fetchProfile();
    }, [location]);

    const handleEditProfile = () => {
        navigate(`/update-profile?username=${profile.username}`);
    };

    const handleAvatarError = () => {
        setAvatarError(true);
    };

    if (loading) {
        return <div className="text-center text-primary">Đang tải...</div>;
    }
    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }
    if (!profile) {
        return <div className="text-center text-red-500">Không tìm thấy thông tin người dùng</div>;
    }

    return (
        <div className="flex p-6 bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <div className="w-1/4 p-4 bg-white rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                        {profile.avatar && !avatarError ? (
                            <img
                                src={profile.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={handleAvatarError} // Trigger fallback if image fails to load
                            />
                        ) : (
                            <FaUserCircle className="w-full h-full text-gray-500" />
                        )}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{profile.username}</h3>
                    <ul className="mt-4 space-y-2 text-primary font-semibold">
                        <li>Thông tin tài khoản</li>
                        <li>Địa chỉ giao hàng</li>
                        <li>Phương thức thanh toán</li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-3/4 p-6 bg-white rounded-lg shadow-lg ml-4">
                <h2 className="text-xl font-semibold mb-4 text-primary">Thông tin cá nhân</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700">Họ:</label>
                            <input
                                type="text"
                                value={profile.firstName || "Chưa cập nhật"}
                                className="w-full p-2 border rounded-md"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Tên:</label>
                            <input
                                type="text"
                                value={profile.lastName || "Chưa cập nhật"}
                                className="w-full p-2 border rounded-md"
                                disabled
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700">Email:</label>
                        <input type="email" value={profile.email || "Chưa cập nhật"} className="w-full p-2 border rounded-md" disabled />
                    </div>
                    <div>
                        <label className="block text-gray-700">Số điện thoại:</label>
                        <input
                            type="text"
                            value={profile.phone || "Chưa cập nhật"}
                            className="w-full p-2 border rounded-md"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Ngày sinh: {FormData.dob}</label>
                        <input
                            type="text"
                            value={profile.dob || "Chưa cập nhật"}
                            className="w-full p-2 border rounded-md"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Giới tính:</label>
                        <input 
                            type="text" 
                            value={profile.gender || "Chưa cập nhật"} 
                            className="w-full p-2 border rounded-md" 
                            disabled 
                        />
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={handleEditProfile}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                    >
                        Chỉnh sửa thông tin
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
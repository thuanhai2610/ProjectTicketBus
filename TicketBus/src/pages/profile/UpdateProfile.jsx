import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

const UpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null); // Store the selected file
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const username = queryParams.get("username");
        if (!username) {
          throw new Error("Username is required");
        }
        const response = await axios.get(
          `http://localhost:3001/user/profile?username=${username}`
        );
        const profileData = {
          ...response.data,
          dob: response.data.dob
            ? new Date(response.data.dob).toISOString().split("T")[0]
            : "",
        };
        setProfile(profileData);
        setFormData(profileData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Không tìm thấy người dùng hoặc lỗi server!");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
  
    if (file) {
      // Kiểm tra nếu file có phải là ảnh không
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn một file ảnh hợp lệ!");
        return;
      }
  
      setSelectedFile(file); // Lưu file vào state để gửi lên server
  
      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result })); // Hiển thị ảnh trước khi tải lên
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
  
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
  
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone || "");
      formDataToSend.append("dob", formData.dob || "");
      formDataToSend.append("gender", formData.gender || "");
      formDataToSend.append("username", formData.username);
      
      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile); 
      }
  
      await axios.post(`http://localhost:3001/user/update-profile`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      });
  
      setSuccessMsg("Cập nhật thông tin thành công!");
      setTimeout(() => {
        navigate(`/user/profile?username=${formData.username}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Lỗi khi cập nhật thông tin! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCancel = () => {
    navigate(`/user/profile?username=${profile?.username}`);
  };

  if (loading && !profile) {
    return <div className="text-center text-primary">Đang tải...</div>;
  }

  if (error && !profile) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="text-center text-red-500">
        Không tìm thấy thông tin người dùng
      </div>
    );
  }

  return (
    <div className="flex p-6 bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 p-4 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
  {profile.avatar ? (
    <img
      src={profile.avatar}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <FaUserCircle className="w-full h-full text-gray-500" />
  )}
</div>

          <label className="mt-4 bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary-dark">
            Cập nhật ảnh
            <input
              type="file"
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
            />
          </label>
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
        <h2 className="text-xl font-semibold mb-4 text-primary">
          Cập nhật thông tin cá nhân
        </h2>

        {successMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Họ:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleInputChange}
                placeholder="Nhập họ"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Tên:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleInputChange}
                placeholder="Nhập tên"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              placeholder="Nhập email"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Số điện thoại:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Ngày sinh:</label>
            <input
              type="date"
              name="dob"
              value={formData.dob || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Giới tính:</label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const Navbar = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsername(decoded.username || 'User');
                setIsLoggedIn(true);
                
                const fetchUserData = async () => {
                    try {
                        const response = await axios.get(`http://localhost:3001/user/profile?username=${decoded.username}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        
                        setAvatar(response.data.avatar || '');
                    } catch (error) {
                        console.error("Lỗi lấy dữ liệu người dùng", error);
                        setAvatar('');
                    }
                };
                fetchUserData();
            } catch (error) {
                console.error("Token không hợp lệ", error);
                localStorage.removeItem("token");
                setIsLoggedIn(false);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUsername('');
        setAvatar('');
        navigate("/");
        window.location.reload();
    };

    const handleGoToProfile = () => {
        navigate(`/user/profile?username=${username}`);
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            setIsVisible(currentScroll <= scrollPosition || currentScroll <= 50);
            setScrollPosition(currentScroll);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollPosition]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <nav className={`w-full h-[8ch] fixed top-0 left-0 lg:px-24 md:px-16 sm:px-7 px-4 backdrop:blur-lg transition-transform duration-300 z-50 
            ${isVisible ? "translate-y-0" : "-translate-y-full"} 
            ${scrollPosition > 50 ? "bg-neutral-100 shadow-sm shadow-black" : "bg-neutral-100/10"}`}>
            <div className="w-full h-full flex items-center justify-between">
                <Link to="/" className='text-4xl text-primary font-bold'>
                    Ticket<span className='text-neutral-800'>Bus</span>
                </Link>

                <div className="flex-1 flex justify-center">
                    <ul className="list-none flex items-center justify-center flex-wrap gap-8 text-lg text-neutral-900 font-semibold">
                        <li><Link to="/" className='hover:text-primary ease-in-out duration-300'>Trang Chủ</Link></li>
                        <li><Link to="/offer" className='hover:text-primary ease-in-out duration-300'>Chương trình khuyến mãi</Link></li>
                        <li><Link to="/bus-tickets" className='hover:text-primary ease-in-out duration-300'>Tra cứu vé</Link></li>
                        <li><Link to="/blog" className='hover:text-primary ease-in-out duration-300'>Tin tức</Link></li>
                    </ul>
                </div>

                <div className="flex items-center space-x-2">
                    {isLoggedIn ? (
                        <div className="flex items-center space-x-3">
                            {avatar ? (
                                <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full border border-primary" />
                            ) : (
                                <FaUserCircle className="w-10 h-10 text-gray-500" />
                            )}
                            
                            <button 
                                onClick={handleGoToProfile}
                                className="text-neutral-900 font-medium hover:underline"
                            >
                                {username}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="px-4 py-1 border border-primary text-neutral-500 text-base font-normal rounded-full hover:bg-primary hover:text-neutral-50 transition duration-300"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-neutral-500 text-base font-normal hover:text-primary transition duration-300">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="px-4 py-1 border border-primary text-neutral-500 text-base font-normal rounded-full hover:bg-primary hover:text-neutral-50 transition duration-300">
                                Đăng ký
                            </Link>
                        </>
                    )}
                    
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700 dark:text-white" />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react'
import { FaBars, FaMoon, FaSun } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6';
import { Link } from 'react-router-dom'


const Navbar = () => {

    const [scrollPosition, setScrollPostion] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [open, setOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    //Navrbar items
    const navItems = [
        { label: "Trang Chủ", link: "/" },
        { label: "Chương trình khuyến mãi", link: "/offer" },
        { label: "Tra cứu vé", link: "/bus-tickets" },
        { label: "Tin tức", link: "/blog" },

    ]

    //Handle click open
    const handleOpen = () => {
        setOpen(!open)
    }


    //Handle click close
    const handleClose = () => {
        setOpen(false);
    }

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollState = window.scrollY;

            if (currentScrollState > scrollPosition && currentScrollState > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setScrollPostion(currentScrollState);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll)
        };

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
            ${scrollPosition > 50 ? "bg-violet-300" : "bg-neutral-100/10"}`}>
                <div className="w-full h-full flex items-center justify-between">
                    
                    {/* Logo section  */}
                    <Link to="/" className='text-4xl text-primary font-bold'>
                        Ticket<span className='text-neutral-800'>Bus</span>
                    </Link>
            
                    {/* Nav Links  */}
                    <div className="flex-1 flex justify-center ">
                        <ul className="list-none flex items-center justify-center flex-wrap gap-8 text-lg text-neutral-900 font-semibold">
                            {navItems.map((item, ind) => (
                                <li key={ind}>
                                    <Link to={item.link} className='hover:text-primary ease-in-out duration-300 '>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
            
                    {/* Button Section  */}
                    <div className="flex items-center space-x-2">
                        <Link to="/login" className="text-neutral-500 text-base font-normal hover:text-primary transition duration-300">
                            Đăng nhập
                        </Link>
                        <Link to="/register" className="px-4 py-1 border border-primary text-neutral-500 text-base font-normal rounded-full hover:bg-primary hover:text-neutral-50 transition duration-300">
                            Đăng ký
                        </Link>
                        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700 dark:text-white" />}
                        </button>
                    </div>
            
                </div>
            </nav>
            
    )
}

export default Navbar

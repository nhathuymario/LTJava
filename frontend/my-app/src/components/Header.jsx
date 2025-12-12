import { Link, useNavigate } from "react-router-dom";
import Button from "./ui/Button.jsx";
import { useAuthContext } from "../features/auth/AuthProvider.jsx";
import { logout as ApiLogout } from "../features/auth/services/authService.js";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { FiBook, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";

const Header = () => {
    const navigate = useNavigate();
    const { logout, token, name, email } = useAuthContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Đăng xuất?',
            text: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                // Call API logout if needed, or just clear local state
                // const respond = await ApiLogout(); 
                // Assuming ApiLogout handles server-side invalidation

                logout();

                await Swal.fire({
                    title: 'Đã đăng xuất',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                navigate("/login");
            } catch (error) {
                console.error('Lỗi đăng xuất:', error);
                logout(); // Force logout on client side even if server fails
                navigate("/login");
            }
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:bg-blue-700 transition-colors">
                        <span className="font-bold text-xl">S</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 leading-none">SMD</span>
                        <span className="text-xs text-blue-600 font-medium tracking-wider">SYSTEM</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                        Trang chủ
                    </Link>
                    <Link to="/library" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                        Thư viện
                    </Link>
                    <Link to="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                        Giới thiệu
                    </Link>
                    <Link to="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                        Liên hệ
                    </Link>
                </nav>

                {/* Auth Buttons / User Menu */}
                <div className="hidden md:flex items-center space-x-4">
                    {token ? (
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-medium text-gray-900">{name || "Người dùng"}</p>
                                <p className="text-xs text-gray-500">{email}</p>
                            </div>
                            <div className="relative group">
                                <button className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors">
                                    <FiUser className="w-5 h-5" />
                                </button>
                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all transform origin-top-right">
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                                        Hồ sơ cá nhân
                                    </Link>
                                    {/* Add Dashboard link if user has roles */}
                                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                                        Trang quản lý
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg">
                    <div className="flex flex-col space-y-4">
                        <Link to="/" className="text-gray-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                            Trang chủ
                        </Link>
                        <Link to="/library" className="text-gray-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                            Thư viện
                        </Link>
                        <hr className="border-gray-100" />
                        {token ? (
                            <>
                                <div className="py-2">
                                    <p className="font-medium text-gray-900">{name}</p>
                                    <p className="text-sm text-gray-500">{email}</p>
                                </div>
                                <Link to="/profile" className="text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                                    Hồ sơ cá nhân
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="text-red-600 font-medium py-2 text-left"
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-3 pt-2">
                                <Link
                                    to="/login"
                                    className="text-center w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-center w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
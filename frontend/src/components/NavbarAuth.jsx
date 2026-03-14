import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiLogOut, FiUser, FiShoppingBag } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { authService } from '../services/authService';

const NavbarAuth = ({ mobile = false, closeMenu = () => { } }) => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        // Initial fetch
        const fetchUser = async () => {
            setUser(await authService.getCurrentUser());
        };
        fetchUser();

        // Subscribe to auth state
        const { data: authListener } = authService.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener.subscription?.unsubscribe();
        };
    }, []);

    const handleLogin = async () => {
        try {
            localStorage.setItem('returnToAfterLogin', window.location.pathname);
            await authService.signInWithGoogle();
        } catch (error) {
            console.error('Failed to login:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            setIsDropdownOpen(false);
            closeMenu();
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    const isAdmin = user && (user.app_metadata?.is_admin || user.user_metadata?.is_admin || user.email === 'crocheella19@gmail.com');

    if (mobile) {
        return (
            <div className="pt-4 mt-2 text-start border-t border-gray-100">
                {user ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-white shadow-sm">
                                    <FiUser className="w-5 h-5" />
                                </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-gray-900 truncate">
                                    {user.user_metadata?.full_name ||
                                        (user.email?.includes('admin') ? 'Admin' : user.email?.split('@')[0]) ||
                                        'User'}
                                </span>
                                <span className="text-xs text-text/50 truncate">{user.email}</span>
                            </div>
                        </div>

                        <Link
                            to="/account"
                            onClick={closeMenu}
                            className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                        >
                            <FiUser className="w-5 h-5 text-gray-400" />
                            {t('nav.manageAccount')}
                        </Link>

                        <Link
                            to="/my-orders"
                            onClick={closeMenu}
                            className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                        >
                            <FiShoppingBag className="w-5 h-5 text-gray-400" />
                            {t('nav.myOrders')}
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-left mt-1"
                        >
                            <FiLogOut className="w-5 h-5" />
                            {t('nav.logout')}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-3 py-4 mt-2 bg-white border border-gray-200 rounded-xl text-text font-bold shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                        <FcGoogle className="w-6 h-6" />
                        {t('nav.continueWithGoogle')}
                    </button>
                )}
            </div>
        );
    }

    // Desktop view
    return (
        <div className="hidden lg:flex items-center border-s ps-3 border-gray-200">
            {user ? (
                <div
                    className="relative group"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                        {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                <FiUser />
                            </div>
                        )}
                        <div className="flex flex-col items-start xl:flex hidden">
                            <span className="text-sm font-semibold text-gray-900 max-w-[120px] truncate leading-tight">
                                {user.user_metadata?.full_name?.split(' ')[0] ||
                                    (user.email?.includes('admin') ? 'Admin' : user.email?.split('@')[0]) ||
                                    'User'}
                            </span>
                            {isAdmin && <span className="text-[10px] text-primary font-bold uppercase tracking-wider leading-tight mt-0.5">Admin</span>}
                        </div>
                    </div>

                    {/* Dropdown Menu - Controlled by group-hover for pure CSS behavior or JS if needed */}
                    <div className={`absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-200 transform origin-top-right z-50 py-2 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                        }`}>
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-xs text-text/50 uppercase tracking-wider font-semibold mb-0.5">{t('nav.signedInAs')}</p>
                            <p className="text-sm text-gray-900 font-medium truncate">{user.email}</p>
                        </div>
                        <Link
                            to="/account"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                            <FiUser className="w-4 h-4" />
                            {t('nav.manageAccount')}
                        </Link>
                        <Link
                            to="/my-orders"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                            <FiShoppingBag className="w-4 h-4" />
                            {t('nav.myOrders')}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                            <FiLogOut className="w-4 h-4" />
                            {t('nav.logout')}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <FcGoogle className="w-4 h-4" />
                    {t('nav.login')}
                </button>
            )}
        </div>
    );
};

export default NavbarAuth;

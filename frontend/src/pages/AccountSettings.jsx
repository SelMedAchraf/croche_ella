import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, FiMapPin, FiSave, FiKey } from 'react-icons/fi';
import axios from 'axios';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';

const AccountSettings = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        full_address: ''
    });

    const [passwordMode, setPasswordMode] = useState('request'); // 'request' | 'verify' | 'update'
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                const adminCheck = currentUser.app_metadata?.is_admin || currentUser.user_metadata?.is_admin || currentUser.email === 'crocheella19@gmail.com';
                setIsAdmin(adminCheck);

                setFormData({
                    full_name: currentUser.user_metadata?.full_name || '',
                    phone: currentUser.user_metadata?.phone || '',
                    full_address: currentUser.user_metadata?.full_address || ''
                });
            }
            setLoading(false);
        };
        fetchUser();

        // Listen for auth state changes (e.g., logout in another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                navigate('/');
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setUser(session.user);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    full_address: formData.full_address
                }
            });

            if (error) throw error;
            setSuccessMsg('Your account information has been updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err);
            setErrorMsg(err.message || 'Failed to update account information.');
        } finally {
            setSaving(false);
        }
    };

    const handleSendCode = async () => {
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${apiUrl}/auth-settings/send-code`, {}, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setSuccessMsg('A 6-digit confirmation code has been sent to your email.');
            setPasswordMode('verify');
        } catch (err) {
            console.error('Error sending code:', err);
            setErrorMsg(err.response?.data?.error || 'Failed to send confirmation code.');
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${apiUrl}/auth-settings/verify-code`, { code: verificationCode }, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setSuccessMsg('Code verified successfully! You may now enter your new password.');
            setPasswordMode('update');
        } catch (err) {
            console.error('Error verifying code:', err);
            setErrorMsg(err.response?.data?.error || 'Invalid or expired confirmation code.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateAdminPassword = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');

        if (newPassword !== confirmPassword) {
            setSaving(false);
            return setErrorMsg('Passwords do not match.');
        }

        if (newPassword.length < 6) {
            setSaving(false);
            return setErrorMsg('Password must be at least 6 characters long.');
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            setSuccessMsg('Your password has been changed successfully! Redirecting...');
            setPasswordMode('request');
            setVerificationCode('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
            }, 3000);
        } catch (err) {
            console.error('Error changing password:', err);
            setErrorMsg(err.message || 'Failed to update password.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen section-padding flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen section-padding text-center flex items-center justify-center">
                <p className="text-xl text-text/60">You must be logged in to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen section-padding bg-gray-50/50">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-display font-bold text-primary mb-2">Manage My Account</h1>
                        <p className="text-text/60">
                            {isAdmin
                                ? 'Admin Profile Settings'
                                : 'Update your contact and delivery information'}
                        </p>
                    </div>

                    <div className="card p-8">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl flex-shrink-0">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <FiUser />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {formData.full_name || 'My Profile'}
                                </h2>
                                <div className="flex items-center gap-2 text-text/60 mt-1">
                                    <FiMail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                    {isAdmin && <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>}
                                    {user.app_metadata?.provider === 'google' && <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">Google</span>}
                                </div>
                            </div>
                        </div>

                        {successMsg && (
                            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-3">
                                <FiCheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>{successMsg}</p>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                                <p>{errorMsg}</p>
                            </div>
                        )}

                        {isAdmin ? (
                            <div className="space-y-6">
                                {passwordMode === 'request' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiLock className="text-primary" />
                                            Security Settings
                                        </h3>
                                        <p className="text-text/70 mb-4">
                                            As an administrator, you can change your password by requesting a secure 6-digit confirmation code to your email address: <strong>{user.email}</strong>
                                        </p>
                                        <button
                                            onClick={handleSendCode}
                                            disabled={saving}
                                            className="btn-primary py-3 px-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <FiMail />
                                            {saving ? 'Sending confirmation...' : 'Send Password Change Confirmation'}
                                        </button>
                                    </div>
                                )}

                                {passwordMode === 'verify' && (
                                    <form onSubmit={handleVerifyCode} className="space-y-4 max-w-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <FiKey className="text-primary" />
                                            Enter Security Code
                                        </h3>
                                        <p className="text-text/70 mb-4 text-sm">
                                            We sent a 6-digit code to <strong>{user.email}</strong>. Please enter it below.
                                        </p>
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            required
                                            maxLength={6}
                                            className="input-field text-center tracking-widest text-lg font-bold font-mono"
                                            placeholder="XXXXXX"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={saving || verificationCode.length !== 6}
                                                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {saving ? 'Verifying...' : 'Verify Code'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPasswordMode('request')}
                                                className="px-6 py-3 border border-gray-200 text-text/70 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {passwordMode === 'update' && (
                                    <form onSubmit={handleUpdateAdminPassword} className="space-y-5 max-w-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <FiLock className="text-primary" />
                                            Set New Password
                                        </h3>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                className="input-field"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="input-field"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {saving ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
                                            <FiUser className="text-text/60" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
                                            <FiPhone className="text-text/60" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="+213 XXX-XXXXXX"
                                        />
                                    </div>
                                </div>


                                <div>
                                    <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
                                        <FiMapPin className="text-text/60" />
                                        Full Address
                                    </label>
                                    <textarea
                                        name="full_address"
                                        value={formData.full_address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="input-field resize-none"
                                        placeholder="Street address, building, apartment number..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary py-3 px-8 flex items-center justify-center gap-2 ml-auto disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <FiSave />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AccountSettings;

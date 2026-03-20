import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMail, FiPhone, FiCheckCircle, FiMapPin, FiSave } from 'react-icons/fi';
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

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                const adminCheck = currentUser.app_metadata?.is_admin || currentUser.user_metadata?.is_admin || currentUser.email === 'crochetwebsite19@gmail.com';
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
            setUser(data.user);
            setSuccessMsg(t('account.successUpdate'));
        } catch (err) {
            console.error('Error updating profile:', err);
            setErrorMsg(err.message || t('account.failedUpdate'));
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
                <p className="text-xl text-text/60">{t('account.mustLogin')}</p>
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
                        <h1 className="text-4xl font-display font-bold text-primary mb-2">{t('account.title')}</h1>
                        <p className="text-text/60">
                            {isAdmin
                                ? t('account.adminProfile')
                                : t('account.updateInfo')}
                        </p>
                    </div>

                    <div className="card p-4 sm:p-8">
                        <div className="mb-8 pb-8 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {formData.full_name || t('account.myProfile')}
                            </h2>
                            <div className="flex items-center gap-2 text-text/60 mt-1">
                                <FiMail className="w-4 h-4 flex-shrink-0" />
                                <span>{user.email}</span>
                                {isAdmin && <span className="hidden sm:block ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>}
                                {user.app_metadata?.provider === 'google' && <span className="hidden sm:block ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">Google</span>}
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

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
                                            <FiUser className="text-text/60" />
                                            {t('account.fullName')}
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
                                            {t('account.phoneNumber')}
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
                                        {t('account.fullAddress')}
                                    </label>
                                    <textarea
                                        name="full_address"
                                        value={formData.full_address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="input-field resize-none"
                                        placeholder={t('checkout.addressPlaceholder')}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={saving || !(
                                            formData.full_name !== (user.user_metadata?.full_name || '') ||
                                            formData.phone !== (user.user_metadata?.phone || '') ||
                                            formData.full_address !== (user.user_metadata?.full_address || '')
                                        )}
                                        className="btn-primary py-3 px-8 flex items-center justify-center gap-2 ms-auto disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <FiSave />
                                        {saving ? t('account.saving') : t('account.saveChanges')}
                                    </button>
                                </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AccountSettings;

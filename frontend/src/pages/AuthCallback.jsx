import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase client automatically handles parsing the OAuth callback fragments from the URL.
        // We just wait for the session to be ready, then redirect to the original destination or home.

        const handleCallback = async () => {
            if (window.location.hash) {
                const hashStr = window.location.hash.substring(1); // remove '#'
                const params = new URLSearchParams(hashStr);
                const errorDesc = params.get('error_description') || params.get('error') || '';
                if (errorDesc.toLowerCase().includes('ban')) {
                    setTimeout(() => {
                        toast.error("Your account has been blocked by an administrator.", { duration: 5000 });
                    }, 500);
                    navigate('/');
                    return;
                }
            }

            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during auth callback:', error);
                navigate('/');
                return;
            }

            if (session) {
                const user = session.user;
                const isAdmin = user.app_metadata?.is_admin ||
                    user.user_metadata?.is_admin ||
                    user.email === 'crochetwebsite19@gmail.com';

                if (isAdmin) {
                    localStorage.removeItem('returnToAfterLogin');
                    navigate('/admin/dashboard');
                } else {
                    const returnTo = localStorage.getItem('returnToAfterLogin') || '/';
                    localStorage.removeItem('returnToAfterLogin');
                    navigate(returnTo);
                }
            } else {
                navigate('/');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center section-padding">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-2xl font-display font-semibold text-primary">
                    Completing login...
                </h2>
                <p className="text-text/60 mt-2">Please wait while we log you in securely.</p>
            </div>
        </div>
    );
};

export default AuthCallback;

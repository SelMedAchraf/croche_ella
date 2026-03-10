import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase client automatically handles parsing the OAuth callback fragments from the URL.
        // We just wait for the session to be ready, then redirect to the original destination or home.

        const handleCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during auth callback:', error);
                navigate('/');
                return;
            }

            if (session) {
                // If there is a return URL in local storage from before the login redirect
                const returnTo = localStorage.getItem('returnToAfterLogin') || '/';
                localStorage.removeItem('returnToAfterLogin');
                navigate(returnTo);
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

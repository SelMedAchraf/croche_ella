import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export const LANGUAGES = [
    { code: 'en', label: 'EN', full: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'FR', full: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'AR', full: 'العربية', flag: '🇸🇦' },
];

const LanguageSwitcher = ({ compact = false }) => {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

    const handleChange = (code) => {
        i18n.changeLanguage(code);
        setOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative" style={{ direction: 'ltr' }}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm w-[72px] justify-center"
                aria-label="Switch language"
            >
                <span>{current.flag}</span>
                <span className="font-bold">{current.label}</span>
                <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-1.5 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-[140px] py-1 overflow-hidden"
                    >
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleChange(lang.code)}
                                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-primary/5 hover:text-primary ${i18n.language === lang.code
                                    ? 'bg-primary/5 text-primary font-semibold'
                                    : 'text-gray-700'
                                    }`}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.full}</span>
                                {i18n.language === lang.code && (
                                    <span className="ml-auto text-primary">✓</span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;

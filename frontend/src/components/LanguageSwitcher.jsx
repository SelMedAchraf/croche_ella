import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';


export const LANGUAGES = [
    { code: 'en', label: 'EN', full: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'FR', full: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'AR', full: 'العربية', flag: '🇸🇦' },
];

const LanguageSwitcher = memo(({ compact = false }) => {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Optimization: Memoize current language selection
    const current = useMemo(() =>
        LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0],
        [i18n.language]
    );

    // Optimization: Use useCallback for change handler
    const handleChange = useCallback((code) => {
        i18n.changeLanguage(code);
        setOpen(false);
    }, [i18n]);

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
                // Optimization: Added h-[38px] and fixed w-[72px] to prevent layout shifts
                className="flex items-center gap-1.5 px-3 py-1.5 h-[38px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm w-[72px] justify-center"
                aria-label="Switch language"
            >
                <span className="w-4 h-4 flex items-center justify-center">{current.flag}</span>
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

            {open && (
                <div
                    className="absolute top-full mt-1.5 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-[140px] py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
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
                            <span className="w-4 h-4 flex items-center justify-center">{lang.flag}</span>
                            <span>{lang.full}</span>
                            {i18n.language === lang.code && (
                                <span className="ml-auto text-primary">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

        </div>
    );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;

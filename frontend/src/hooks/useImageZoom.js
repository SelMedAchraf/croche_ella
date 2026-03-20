import { useState, useCallback, useEffect } from 'react';

const useImageZoom = () => {
    const [zoomedImage, setZoomedImageInternal] = useState(null);

    const setZoomedImage = useCallback((url) => {
        if (url) {
            // Push state only if it's currently closed
            setZoomedImageInternal((prev) => {
                if (!prev) {
                    window.history.pushState({ imageZoomOpen: true }, '');
                }
                return url;
            });
        } else {
            // If trying to close
            if (window.history.state?.imageZoomOpen) {
                window.history.back(); // This will trigger popstate
            } else {
                setZoomedImageInternal(null);
            }
        }
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            setZoomedImageInternal(null);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return [zoomedImage, setZoomedImage];
};

export default useImageZoom;

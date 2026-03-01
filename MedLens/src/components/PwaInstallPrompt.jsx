import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Hide if the app is already installed
        window.addEventListener('appinstalled', () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);

        console.log(`User response to the install prompt: ${outcome}`);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-full border border-gray-200 shadow-2xl xs:w-auto w-[90%]"
                >
                    <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center shrink-0">
                        <Download size={20} />
                    </div>
                    <div className="flex-1 xs:flex-none">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">Install MedLens</h4>
                        <p className="text-xs text-gray-500 leading-tight">Fast access, offline mode</p>
                    </div>
                    <button
                        onClick={handleInstallClick}
                        className="ml-2 px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-full hover:bg-brand-700 transition-colors focus:ring-4 focus:ring-brand-500/50 shadow-md shrink-0 whitespace-nowrap"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="ml-1 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                        aria-label="Dismiss install prompt"
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}